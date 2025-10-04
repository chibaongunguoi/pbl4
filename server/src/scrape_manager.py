from enum import Enum, auto
import requests
from datetime import datetime, timezone
import time
import traceback
from .scrape_strategies import ScrapeStrategy


class AggregationMode(Enum):
    flatten = auto()
    append = auto()


def now():
    return datetime.now(timezone.utc).isoformat()


def sendCallback(callback_url: str, data, success: bool = True, metadata: dict = {}):
    try:
        import requests

        payload: dict = {
            "status": "success" if success else "error",
            "data": data,
        }

        metadata = metadata.copy()
        metadata["finish_at"] = time.time()
        metadata["completed_in_seconds"] = metadata["finish_at"] - metadata["start_at"]

        if isinstance(data, list):
            metadata["count"] = len(data)

        payload["metadata"] = metadata

        print(f"Sending callback to: {callback_url}")
        response = requests.post(
            callback_url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30,
        )
        response.raise_for_status()
        print(f"Callback sent successfully. Status: {response.status_code}")

    except Exception as e:
        print(f"Error sending callback to {callback_url}: {e}")


class ScrapeManager:
    def __init__(
        self,
        scrape_strategy: ScrapeStrategy,
        aggregation_mode: AggregationMode = AggregationMode.flatten,
    ):
        self.scrape_strategy = scrape_strategy
        self.aggregation_mode = aggregation_mode

    def scrapeSingle(self, url: str):
        print(f"Scraping URL: {url}")
        response = None
        for _ in range(3):
            try:
                response = requests.get(
                    url,
                    headers={
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                    },
                    timeout=30,
                )
                response.raise_for_status()
            except Exception:
                time.sleep(2)

        if response is None:
            print(f"Failed to scrape {url}, connection failed after 3 times.")
            if self.aggregation_mode == AggregationMode.flatten:
                return []
            else:
                return None

        try:
            result = self.scrape_strategy.scrape(response)
            print(f"Scraped {url} successfully.")
            return result

        except Exception:
            print(f"[!! ERROR !!] Fail to scrape {url}.")
            traceback.print_exc()

        if self.aggregation_mode == AggregationMode.flatten:
            return []
        else:
            return None

    def scrapeUrls(self, urls: list[str]) -> list:
        """Crawl the provided URLs in parallel using ThreadPoolExecutor"""
        if not urls:
            print("[-- INFO --] ScrapeManager.scrapeUrls: No URLs provided.")
            return []

        print(f"[-- INFO --] ScrapeManager.scrapeUrls: {len(urls)} URL(s) provided.")
        try:
            from concurrent.futures import ThreadPoolExecutor, as_completed

            batch_result = []
            with ThreadPoolExecutor(max_workers=min(len(urls), 4)) as executor:
                future_to_url = {
                    executor.submit(self.scrapeSingle, url): url for url in urls
                }
                for future in as_completed(future_to_url):
                    url = future_to_url[future]
                    try:
                        result = future.result()
                        if self.aggregation_mode == AggregationMode.flatten:
                            assert isinstance(result, list)
                            for record in result:
                                if record not in batch_result:
                                    batch_result.append(record)

                        else:
                            if result is not None:
                                batch_result.append(result)
                    except Exception as e:
                        print(
                            f"[ERROR at ScrapeManager.scrapeUrls] Error processing {url}: {str(e)}"
                        )
                        traceback.print_exc()

            return batch_result

        except Exception as e:
            print(f"[!! ERROR !!] ScrapeManager.crawl_urls: {e}")
            return []

    def scrapeUrlsWithCallback(
        self, urls: list[str], callback_url: str, metadata: dict = {}
    ):
        try:
            data = self.scrapeUrls(urls)
            sendCallback(callback_url=callback_url, data=data, metadata=metadata)

        except Exception:
            sendCallback(
                callback_url=callback_url,
                data=[],
                success=False,
            )
