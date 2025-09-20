#!/usr/bin/env python3
"""
Standalone Scrapy script to avoid reactor conflicts with FastAPI
This script runs Scrapy in isolation and outputs results to JSON
"""

import sys
import json
import scrapy
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings


class DevWorkListingSpider(scrapy.Spider):
    name = 'devwork_listings'
    allowed_domains = ['devwork.vn']
    
    def __init__(self, pages=None, output_file=None, *args, **kwargs):
        super(DevWorkListingSpider, self).__init__(*args, **kwargs)
        self.pages = pages or [1]
        self.output_file = output_file
        self.job_urls = []
        
    def start_requests(self):
        for page in self.pages:
            url = f"https://devwork.vn/viec-lam?page={page}"
            yield scrapy.Request(url=url, callback=self.parse)
    
    def parse(self, response):
        """Parse job listing page to extract job URLs"""
        try:
            job_links = response.css('a[data-v-289040a2][target="_blank"][href*="/viec-lam/"]::attr(href)').getall()
            
            for link in job_links:
                if link and link.startswith('/viec-lam/'):
                    full_url = f"https://devwork.vn{link}"
                    self.job_urls.append(full_url)
                    yield {'job_url': full_url}
                    
        except Exception as e:
            self.logger.error(f"Error parsing listing {response.url}: {e}")
    
    def closed(self, reason):
        """Called when spider is closed - save results to file"""
        if self.output_file:
            with open(self.output_file, 'w', encoding='utf-8') as f:
                json.dump(self.job_urls, f, ensure_ascii=False, indent=2)


def main():
    if len(sys.argv) < 3:
        print("Usage: python scrapy_standalone.py job_listings <output_file> <pages_json>")
        sys.exit(1)
    
    spider_name = sys.argv[1]
    output_file = sys.argv[2]
    
    if spider_name != 'job_listings':
        print(f"Only 'job_listings' spider is supported")
        sys.exit(1)
    
    if len(sys.argv) < 4:
        print("Error: Pages required for job_listings spider")
        sys.exit(1)
    
    # Configure settings for parallel processing
    settings = get_project_settings()
    settings.update({
        'ROBOTSTXT_OBEY': False,
        'CONCURRENT_REQUESTS': 16,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 8,
        'DOWNLOAD_DELAY': 0.5,
        'RANDOMIZE_DOWNLOAD_DELAY': 0.3,
        'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'DEFAULT_REQUEST_HEADERS': {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        },
        'TELNETCONSOLE_ENABLED': False,
        'LOG_LEVEL': 'WARNING'
    })
    
    # Create process and run spider
    process = CrawlerProcess(settings)
    
    # Pages are passed as JSON string in argv[3]
    pages = json.loads(sys.argv[3])
    process.crawl(DevWorkListingSpider, pages=pages, output_file=output_file)
    
    process.start()


if __name__ == '__main__':
    main()
