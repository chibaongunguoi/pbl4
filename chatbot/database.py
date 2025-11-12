from fastapi import FastAPI, Request
import subprocess
import uvicorn
import traceback


def removeConsecutiveSpaces(s: str) -> str:
    lines = [line.strip() for line in s.split("\n") if line.strip() != ""]
    s = "\n".join(lines)

    old_char = ""
    result = ""
    for c in s:
        if old_char != " " or c != " ":
            result += c

        old_char = c

    return result


HOST = "localhost"
PORT = 27017


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


if __name__ == "__main__":
    print("[One-INFO] Initializing the app...")
    print("[One-SUCCESS] The app has been initialized.")
    uvicorn.run(app, host="localhost", port=37111)
