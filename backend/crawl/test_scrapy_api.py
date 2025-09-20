#!/usr/bin/env python3
"""
Test script for the Scrapy-based crawler API
"""

import requests
import json
import time


def test_crawler_api():
    """Test the crawler API endpoints"""
    base_url = "http://localhost:37222"
    
    print("Testing Scrapy-based Crawler API...")
    
    # Test: Crawl job listings (now the default crawl endpoint)
    print("\n1. Testing job listings crawl...")
    crawl_payload = {
        "pages": [1, 2]  # Test with first 2 pages
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/crawl",
            json=crawl_payload,
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Successfully retrieved {data['count']} job URLs")
            job_urls = data['job_urls']
            print(f"Sample URLs: {job_urls[:3] if job_urls else 'None found'}")
        else:
            print(f"✗ Failed to crawl: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error testing crawl: {e}")
    
    print("\nTesting complete!")


if __name__ == "__main__":
    print("Make sure the demo.py server is running on localhost:37222")
    print("You can start it with: python demo.py")
    input("Press Enter when the server is ready...")
    
    test_crawler_api()
