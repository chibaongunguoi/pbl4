from fastapi import FastAPI
from pydantic import BaseModel
from requests import Response
import uvicorn
from typing import Optional
from datetime import datetime, timezone
from src.scraper_api_host import ScraperApiHost


def now():
    return datetime.now(timezone.utc).isoformat()


class ValidateCrawlInput(BaseModel):
    urls: list[str]
    callback_url: Optional[str] = None  # Optional callback URL


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


def content_function(response: Response):
    from bs4 import BeautifulSoup

    soup = BeautifulSoup(response.content, "html.parser")

    # Extract job URLs from listing pages using more specific selector
    # Look for actual job posting links, not skill/tag links
    job_links = soup.select('a[href*="/viec-lam/"][target="_blank"]')

    job_urls = []
    found_count = 0
    for link in job_links:
        try:
            href = link.attrs.get("href", "")
            if isinstance(href, str) and href:
                # Only include actual job posting URLs with numbers/IDs
                # Skip skill tags like /viec-lam/laravel, /viec-lam/java
                if (
                    href.startswith("/viec-lam/")
                    and href != "/viec-lam"
                    and "/" in href[10:]
                ):  # Check if there's more after /viec-lam/
                    # Additional check: job URLs typically have numbers or multiple segments
                    parts = href.split("/")
                    if len(parts) >= 3 and (parts[2].isdigit() or "-" in parts[2]):
                        full_url = f"https://devwork.vn{href}"
                        if full_url not in job_urls:
                            job_urls.append(full_url)
                            found_count += 1
        except (AttributeError, TypeError, KeyError):
            continue

    return job_urls


if __name__ == "__main__":
    api_host = ScraperApiHost(
        host="localhost", port=37222, content_function=content_function
    )
    api_host.run()
