#!/usr/bin/env python3
"""
Simple usage example for the simplified crawl API
"""

import requests
import json


def crawl_job_listings():
    """Example of how to use the crawl API"""
    
    # API endpoint
    url = "http://localhost:37222/api/crawl"
    
    # Request payload - specify which pages to crawl
    payload = {
        "pages": [1, 2, 3]  # Crawl first 3 pages
    }
    
    print("Crawling job listings from DevWork...")
    print(f"Pages to crawl: {payload['pages']}")
    
    try:
        # Send POST request
        response = requests.post(url, json=payload, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"\n✅ Success!")
            print(f"Status: {data['status']}")
            print(f"Total job URLs found: {data['count']}")
            
            job_urls = data['job_urls']
            
            # Display first 10 URLs as examples
            print(f"\nFirst 10 job URLs:")
            for i, job_url in enumerate(job_urls[:10], 1):
                print(f"{i:2}. {job_url}")
            
            if len(job_urls) > 10:
                print(f"... and {len(job_urls) - 10} more URLs")
            
            # Save all URLs to file
            with open('job_urls.json', 'w', encoding='utf-8') as f:
                json.dump(job_urls, f, ensure_ascii=False, indent=2)
            
            print(f"\n💾 All URLs saved to 'job_urls.json'")
            
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")


if __name__ == "__main__":
    print("DevWork Job Crawler - Usage Example")
    print("=" * 40)
    print("\nMake sure the server is running:")
    print("python demo.py")
    print("\nPress Enter to start crawling...")
    input()
    
    crawl_job_listings()
