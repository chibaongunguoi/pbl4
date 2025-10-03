from fastapi import FastAPI, Request, Response
import traceback
import uvicorn
from datetime import datetime, timezone
import os


def now():
    t = datetime.now(timezone.utc).isoformat()
    for i in [":", ".", "+"]:
        t = t.replace(i, "-")

    return t


class ApiHost:
    def __init__(self, host: str, port: int):
        self.host = host
        self.port = port
        self.app = FastAPI()
        self.route()

    def run(self):
        uvicorn.run(self.app, host=self.host, port=self.port)

    def route(self):
        self.app.add_api_route("/api/receive", self.receive, methods=["POST"])

    async def receive(self, request: Request):
        try:
            data = await request.json()
            os.makedirs("./out", exist_ok=True)
            with open(f"./out/{now()}.json", "w", encoding="utf-8") as f:
                import json

                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception:
            traceback.print_exc()

        return Response(status_code=200)


if __name__ == "__main__":
    api_host = ApiHost(host="localhost", port=37555)
    api_host.run()
