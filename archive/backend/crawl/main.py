from src.one_crawler import (
    DevWorkCrawlOptions,
    DevWorkJobUrlsCrawler,
    DevWorkScrapeOptions,
    DevWorkScraper,
)
import json
import time
# from src.one_processor import processData

if __name__ == "__main__":
    start_time = time.time()
    crawl_options = DevWorkCrawlOptions()
    crawler = DevWorkJobUrlsCrawler(options=crawl_options)
    job_urls = crawler.crawlAllJobLinks(pages=[i + 1 for i in range(7)])
    print(f"[One-INFO] Got {len(job_urls)} links.")

    scrape_options = DevWorkScrapeOptions()
    scraper = DevWorkScraper(options=scrape_options)

    jobs = scraper.scrape(job_urls=job_urls)
    with open("./data/job_details.json", "w", encoding="utf-8") as f:
        json.dump([job.__dict__ for job in jobs], f, ensure_ascii=False, indent=2)

    end_time = time.time()
    print(f"[One-INFO] Got {len(jobs)} jobs.")
    print(f"[One-INFO] The whole process takes {end_time - start_time:.4f} seconds.")

    # processData("./data/job_details.json")
