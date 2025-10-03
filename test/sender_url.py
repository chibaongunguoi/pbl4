import time
import requests
import asyncio


class RequestSender:
    def __init__(self, host: str, port: int | None = None) -> None:
        self.host = host
        if host == "localhost":
            self.host = "http://localhost"
        if port is not None:
            self.host += f":{port}"

    def post(self, url, data):
        url = self.host + url
        response = requests.post(url, json=data)
        data = response.json()
        return data


async def getResponse(urls):
    if not urls:
        return
    request_sender = RequestSender(host="localhost", port=37333)
    await asyncio.to_thread(
        request_sender.post,
        "/api/crawl",
        {
            "urls": urls,
            "callback_url": "http://localhost:37555/api/receive",
            "metadata": {
                "start_at": time.time(),
            },
        },
    )


urls = [
    "https://www.topcv.vn/tim-viec-lam-cong-nghe-thong-tin-cr257?sba=1&category_family=r257",
    "https://devwork.vn/viec-lam",
]


async def main():
    mid = len(urls) // 2
    urls_1 = urls[mid:]
    urls_2 = urls[:mid]
    await asyncio.gather(
        getResponse(urls_1),
        getResponse(urls_2),
    )


if __name__ == "__main__":
    asyncio.run(main())
