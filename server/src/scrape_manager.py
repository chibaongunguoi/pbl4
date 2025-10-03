from enum import Enum, auto
from datetime import datetime, timezone
import time


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
        content_function,
        aggregation_mode: AggregationMode = AggregationMode.flatten,
    ):
        self.content_function = content_function
        self.aggregation_mode = aggregation_mode

    def scrapeSingle(self, url: str):
        try:
            import requests

            print(f"Scraping URL: {url}")

            # Make request to the URL
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }

            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            result = self.content_function(response)
            print(f"Scraped {url} successfully.")
            return result

        except Exception as e:
            print(f"Error scraping {url}: {e}")
            if self.aggregation_mode == AggregationMode.flatten:
                return []
            else:
                return None

    def scrapeUrls(self, urls: list[str]) -> list:
        """Crawl the provided URLs in parallel using ThreadPoolExecutor"""
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
                            f"[ERROR at ScrapeManager.scrapeUrls] Error processing {url}: {e}"
                        )

            return batch_result

        except Exception as e:
            print(f"Error in crawl_urls: {e}")
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
