from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl, ValidationError
import uvicorn


class ApiHost:
    def __init__(self, host: str, port: int):
        self.host = host
        self.port = port
        self.app = FastAPI()
        self.route()

    def route(self):
        raise NotImplementedError()

    def run(self):
        uvicorn.run(self.app, host=self.host, port=self.port)


class ValidateCrawlInput(BaseModel):
    urls: list[HttpUrl]


class CrawlerApiHost(ApiHost):
    def route(self):
        self.app.add_api_route("/api/crawl", self.receiveCrawl, methods=["POST"])

    async def receiveCrawl(self, request: Request):
        data = await request.json()
        try:
            ValidateCrawlInput(**data)
            return JSONResponse(status_code=200, content={})
        except ValidationError:
            return JSONResponse(status_code=422, content={})
        except Exception:
            return JSONResponse(status_code=500, content={})


if __name__ == "__main__":
    api_host = CrawlerApiHost(host="localhost", port=37222)
    api_host.run()
