# python job_scraper.py
from src.scrape_manager import AggregationMode
from src.scraper_api_host import ScraperApiHost
from src.scrape_strategies import OverallScrapeStrategy


if __name__ == "__main__":
    api_host = ScraperApiHost(
        host="localhost",
        port=37222,
        scrape_strategy=OverallScrapeStrategy(),
        aggregation_mode=AggregationMode.append,
    )
    api_host.run()
