from pymongo import MongoClient, UpdateOne
import json


def processData(filename: str):
    try:
        with open(filename, "r", encoding="utf-8") as f:
            data = json.loads(f.read())

        client = MongoClient("mongodb://localhost:27017/")
        db = client["pbl4_db"]
        collection = db["job_detail"]
        collection.create_index("url", unique=True)

        operations = [
            UpdateOne({"url": job["url"]}, {"$set": job}, upsert=True) for job in data
        ]
        result = collection.bulk_write(operations)
        print("result: ", result)
        print(
            "[One-SUCCESS] Data is processed and uploaded to the database successfully."
        )

    except Exception as e:
        print("[One-ERROR] Error occured when processing data:", e)
