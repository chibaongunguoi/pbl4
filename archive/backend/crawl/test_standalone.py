#!/usr/bin/env python3
"""
Simple test for the standalone Scrapy script
"""

import subprocess
import json
import tempfile
import os


def test_standalone_scrapy():
    """Test the standalone Scrapy script directly"""
    print("Testing standalone Scrapy script...")
    
    script_path = os.path.join(os.path.dirname(__file__), 'scrapy_standalone.py')
    
    # Test: Job listings
    print("\n1. Testing job listings crawler...")
    try:
        with tempfile.NamedTemporaryFile(mode='w+', suffix='.json', delete=False) as temp_file:
            output_file = temp_file.name
        
        cmd = [
            'python', 
            script_path, 
            'job_listings', 
            output_file, 
            json.dumps([1])  # Test with page 1 only
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            # Read results
            try:
                with open(output_file, 'r', encoding='utf-8') as f:
                    job_urls = json.load(f)
                print(f"✓ Successfully retrieved {len(job_urls)} job URLs")
                if job_urls:
                    print(f"Sample URLs: {job_urls[:3]}")
                else:
                    print("No URLs found")
            except Exception as e:
                print(f"✗ Error reading results: {e}")
        else:
            print(f"✗ Job listings crawling failed: {result.stderr}")
        
        # Cleanup
        try:
            os.unlink(output_file)
        except:
            pass
            
    except subprocess.TimeoutExpired:
        print("✗ Scrapy process timed out")
    except Exception as e:
        print(f"✗ Error running test: {e}")
    
    print("\nStandalone test complete!")


if __name__ == "__main__":
    test_standalone_scrapy()
