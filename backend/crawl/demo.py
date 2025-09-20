from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ValidationError
import uvicorn
import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import List
from datetime import datetime, timezone


def now():
    return datetime.now(timezone.utc).isoformat()


def removeConsecutiveSpaces(s: str):
    if not s:
        return s
    lines = [line.strip() for line in s.split("\n") if line.strip() != ""]
    s = "\n".join(lines)

    old_char = ""
    result = ""
    for c in s:
        if old_char != " " or c != " ":
            result += c
        old_char = c
    return result


class ValidateCrawlInput(BaseModel):
    urls: list[str]


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


class ScrapyManager:
    def __init__(self):
        pass

    def crawl_single_url(self, url: str) -> List[str]:
        """Crawl a single URL and return job URLs found"""
        try:
            import requests
            from bs4 import BeautifulSoup
            
            print(f"Crawling URL: {url}")
            
            # Make request to the URL
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            # Parse the HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract job URLs from listing pages using more specific selector
            # Look for actual job posting links, not skill/tag links
            job_links = soup.select('a[href*="/viec-lam/"][target="_blank"]')
            
            job_urls = []
            found_count = 0
            for link in job_links:
                try:
                    href = link.attrs.get('href', '')
                    if isinstance(href, str) and href:
                        # Only include actual job posting URLs with numbers/IDs
                        # Skip skill tags like /viec-lam/laravel, /viec-lam/java
                        if (href.startswith('/viec-lam/') and 
                            href != '/viec-lam' and
                            '/' in href[10:]):  # Check if there's more after /viec-lam/
                            
                            # Additional check: job URLs typically have numbers or multiple segments
                            parts = href.split('/')
                            if len(parts) >= 3 and (parts[2].isdigit() or '-' in parts[2]):
                                full_url = f"https://devwork.vn{href}"
                                if full_url not in job_urls:
                                    job_urls.append(full_url)
                                    found_count += 1
                except (AttributeError, TypeError, KeyError):
                    continue
            
            print(f"Found {found_count} job URLs from {url}")
            return job_urls
            
        except Exception as e:
            print(f"Error crawling {url}: {e}")
            return []

    def crawl_urls(self, urls: List[str]) -> List[str]:
        """Crawl the provided URLs in parallel using ThreadPoolExecutor"""
        try:
            import requests
            from bs4 import BeautifulSoup
            from concurrent.futures import ThreadPoolExecutor, as_completed
            
            all_job_urls = []
            
            # Process URLs in parallel
            with ThreadPoolExecutor(max_workers=min(len(urls), 4)) as executor:
                # Submit all crawling tasks
                future_to_url = {executor.submit(self.crawl_single_url, url): url for url in urls}
                
                # Collect results as they complete
                for future in as_completed(future_to_url):
                    url = future_to_url[future]
                    try:
                        job_urls = future.result()
                        # Add URLs to our list, avoiding duplicates
                        for job_url in job_urls:
                            if job_url not in all_job_urls:
                                all_job_urls.append(job_url)
                    except Exception as e:
                        print(f"Error processing {url}: {e}")
            
            print(f"Total unique job URLs found: {len(all_job_urls)}")
            return all_job_urls
            
        except ImportError:
            print("Error: requests and beautifulsoup4 libraries are required")
            return []
        except Exception as e:
            print(f"Error in crawl_urls: {e}")
            return []


# Global scrapy manager instance
scrapy_manager = ScrapyManager()


class CrawlerApiHost(ApiHost):
    def __init__(self, host: str, port: int):
        super().__init__(host, port)
        self.executor = ThreadPoolExecutor(max_workers=4)

    def route(self):
        self.app.add_api_route("/api/crawl", self.receiveCrawl, methods=["POST"])

    async def receiveCrawl(self, request: Request):
        """Endpoint to crawl the provided URLs"""
        try:
            data = await request.json()
            validated_input = ValidateCrawlInput(**data)

            # Run crawling in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            job_urls = await loop.run_in_executor(
                self.executor, 
                scrapy_manager.crawl_urls, 
                validated_input.urls
            )

            # Ensure job_urls is a list
            if not isinstance(job_urls, list):
                job_urls = []

            return JSONResponse(
                status_code=200,
                content={
                    "status": "success",
                    "count": len(job_urls),
                    "job_urls": job_urls,
                },
            )

        except ValidationError as e:
            return JSONResponse(
                status_code=422,
                content={
                    "status": "error",
                    "message": "Invalid input format",
                    "details": str(e),
                },
            )
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={
                    "status": "error",
                    "message": "Internal server error",
                    "details": str(e),
                },
            )


if __name__ == "__main__":
    api_host = CrawlerApiHost(host="localhost", port=37222)
    api_host.run()
