from fastapi import FastAPI, Request
import json
import subprocess
import uvicorn
from src.one_database_system import (
    DatabaseSystem,
    removeConsecutiveSpaces,
    MODEL_NAME,
    MODEL_URL,
)
import traceback
import requests


HOST = "localhost"
PORT = 27017


db_system = DatabaseSystem(host=HOST, port=PORT)

app = FastAPI()


@app.post("/api/query")
async def receiveQuery(request: Request):
    try:
        data = await request.json()
        query = data["query"]

        if any(
            c in query.lower() for c in ["insert", "delete", "drop", "update", "upsert"]
        ):
            return {"error": "Invalid query."}

        cmd = [
            "mongosh",
            "--eval",
            query,
            f"mongodb://{HOST}:{PORT}/pbl4_db",
            "--quiet",
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
        result = result.stdout
        result = removeConsecutiveSpaces(result)
        result = result.replace("\\n", " ")
        result = result.replace("\n", " ")
        return {"result": result}
    except Exception:
        traceback.print_exc()
        return {"result": "ERROR"}


@app.post("/api/rag")
async def receiveRag(request: Request):
    try:
        data = await request.json()
        text = data["text"]
        filter = data["filter"]
        if filter is None:
            filter = "{}"

        payload = {"model": MODEL_NAME, "input": [text]}
        response = requests.post(url=MODEL_URL, json=payload).json()
        embedding = response["data"][0]["embedding"]

        filter = json.loads(filter)
        results = db_system.vector_collection.query(
            query_embeddings=embedding,
            where=filter if len(filter) > 0 else None,
            n_results=20,
        )["metadatas"]
        return {"result": json.dumps(results, ensure_ascii=False)}

    except Exception:
        traceback.print_exc()
        return {"result": "ERROR"}


if __name__ == "__main__":
    print("[One-INFO] Initializing the app...")
    db_system.sync()
    print("[One-SUCCESS] The app has been initialized.")
    uvicorn.run(app, host="localhost", port=37222)
