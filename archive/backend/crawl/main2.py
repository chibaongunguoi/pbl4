import json
from pymongo import MongoClient, UpdateOne
import chromadb
from bson import ObjectId
import time


def removeConsecutiveSpaces(s: str):
    lines = [line.strip() for line in s.split("\n") if line.strip() != ""]
    s = "\n".join(lines)

    old_char = ""
    result = ""
    for c in s:
        if old_char != " " or c != " ":
            result += c

        old_char = c

    return result


def decomposeDict(d: dict, prefix: str = "") -> dict:
    result = {}
    for k, v in d.items():
        key = f"{prefix}{k}"
        if isinstance(v, dict):
            result.update(decomposeDict(v, f"{key}."))
        elif isinstance(v, list):
            result[key] = " | ".join(v)
        elif isinstance(v, str):
            chunks = v.split("\n")
            chunks = [removeConsecutiveSpaces(chunk) for chunk in chunks]
            chunks = [chunk for chunk in chunks if chunk]
            for i, chunk in enumerate(chunks):
                result[(key, i)] = chunk
    return result


class DatabaseSystem:
    def __init__(
        self,
        host="localhost",
        port=27017,
        database_name="pbl4_db",
        collection_name="job_detail",
    ):
        self.data_client = MongoClient(f"mongodb://{host}:{port}/")
        self.data_collection = self.data_client[database_name][collection_name]
        self.data_collection.create_index("url", unique=True)
        self.vector_client = chromadb.PersistentClient(
            path=f"I:/host/chroma/{database_name}"
        )
        self.vector_client.delete_collection(collection_name)
        self.vector_collection = self.vector_client.get_or_create_collection(
            collection_name
        )

    def uploadJson(self, filename: str):
        with open(filename, "r", encoding="utf-8") as f:
            data = json.loads(f.read())

        operations = [
            UpdateOne({"url": job["url"]}, {"$set": job}, upsert=True) for job in data
        ]
        self.data_collection.bulk_write(operations)
        self.sync()

    def decomposeDocuments(self, docs):
        texts = []
        metadatas = []
        ids = []
        for doc in docs:
            document = doc.copy()
            document_id = document["_id"]
            collected_at = document.pop("collected_at", None)
            document.pop("company_name", None)
            document.pop("company_url", None)
            document.pop("thumbnail", None)
            t: str = document["descriptions"]["Thời gian làm việc"]
            t = removeConsecutiveSpaces(t).replace("\n", " ").strip()
            document["descriptions"]["Thời gian làm việc"] = t

            document_id = str(document.pop("_id", None))
            document.pop("url", None)

            decomposed_document = decomposeDict(document)

            text = ""
            metadata = {"field": "_id", "collected_at": collected_at}
            doc_id = f"{document_id}"
            texts.append(text)
            metadatas.append(metadata)
            ids.append(doc_id)

            for k, v in decomposed_document.items():
                ord = None
                if isinstance(k, tuple):
                    k, ord = k
                text = v
                metadata = {"field": k, "_id": document_id}
                doc_id = f"{document_id}_{hash(k)}"

                if ord is not None:
                    doc_id += f"_{ord}"

                texts.append(text)
                metadatas.append(metadata)
                ids.append(doc_id)

        return texts, metadatas, ids

    def sync(self):
        data_documents = list(self.data_collection.find())
        vector_documents = self.vector_collection.get(
            where={"field": "_id"}  # type: ignore
        )

        data_ids = {
            str(document["_id"]): document["collected_at"]
            for document in data_documents
        }

        vector_ids = {
            i: document["collected_at"]
            for i, document in zip(
                vector_documents["ids"],
                vector_documents["metadatas"],  # type: ignore
            )
        }

        removed_ids = [i for i in vector_ids if vector_ids[i] != data_ids.get(i, None)]  # type: ignore
        missing_ids = [
            ObjectId(i) for i in data_ids if data_ids[i] != vector_ids.get(i, None)
        ]

        if removed_ids:
            self.vector_collection.delete(where={"_id": {"$in": removed_ids}})
            self.vector_collection.delete(ids=removed_ids)

        missing_documents = list(
            self.data_collection.find({"_id": {"$in": missing_ids}})
        )

        if missing_documents:
            start_time = time.time()
            texts, metadatas, ids = self.decomposeDocuments(missing_documents)
            print("[One-INFO] Adding data to the vector database...")
            self.vector_collection.add(
                documents=texts,
                metadatas=metadatas,
                ids=ids,
            )
            end_time = time.time()
            print(
                f"[One-SUCCESS] Added data successfully, taking {end_time - start_time:.4f} seconds."
            )


if __name__ == "__main__":
    filename = "./data/job_details.json"

    try:
        db_system = DatabaseSystem()
        db_system.sync()
        # print(db_system.vector_collection.get()["metadatas"])

    except Exception as e:
        print("[One-ERROR] Error occured when processing data:", e)
