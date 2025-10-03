from src.scrape_manager import AggregationMode
from src.scraper_api_host import ScraperApiHost
from src.scrape_strategies import OverallCrawlStrategy


if __name__ == "__main__":
    api_host = ScraperApiHost(
        host="localhost",
        port=37333,
        scrape_strategy=OverallCrawlStrategy(),
        aggregation_mode=AggregationMode.flatten,
    )
    api_host.run()
