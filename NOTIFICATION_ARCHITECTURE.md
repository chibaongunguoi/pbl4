# Notification System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADMIN SUBMITS URL                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Frontend (ScrapeManager)                                           │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ 1. Submit URL via form                                     │    │
│  │ 2. POST /api/scrape/upload { url }                         │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Backend (/api/scrape/upload)                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ 1. Create ScrapeJob in MongoDB                             │    │
│  │    - status: "processing"                                  │    │
│  │    - url: submitted URL                                    │    │
│  │ 2. Get jobId                                               │    │
│  │ 3. Call scraper service with callback URL + jobId         │    │
│  │ 4. Return jobId to frontend                                │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                    │                              │
                    │                              ▼
                    │              ┌──────────────────────────────────┐
                    │              │  Scraper Service                 │
                    │              │  (Python - port 37222)           │
                    │              │  ┌─────────────────────────┐    │
                    │              │  │ 1. Scrape the URL       │    │
                    │              │  │ 2. Collect job data     │    │
                    │              │  │ 3. POST to callback URL │    │
                    │              │  └─────────────────────────┘    │
                    │              └──────────────────────────────────┘
                    │                              │
                    ▼                              ▼
┌─────────────────────────────┐   ┌──────────────────────────────────┐
│  Frontend Polling           │   │  Backend (/api/scrape/result)    │
│  ┌────────────────────────┐ │   │  ┌─────────────────────────┐    │
│  │ Every 3 seconds:       │ │   │  │ 1. Receive callback     │    │
│  │ GET /api/scrape/status/│ │   │  │ 2. Update ScrapeJob:    │    │
│  │     {jobId}            │ │   │  │    - status: completed  │    │
│  │                        │ │   │  │    - jobCount: X        │    │
│  │ Check job.status       │ │   │  │ 3. Save JobDetails      │    │
│  └────────────────────────┘ │   │  └─────────────────────────┘    │
└─────────────────────────────┘   └──────────────────────────────────┘
                    │                              │
                    └──────────────┬───────────────┘
                                   ▼
                        ┌────────────────────────┐
                        │   MongoDB Database     │
                        │  ┌──────────────────┐  │
                        │  │  ScrapeJob       │  │
                        │  │  - _id (jobId)   │  │
                        │  │  - url           │  │
                        │  │  - status        │  │
                        │  │  - jobCount      │  │
                        │  │  - timestamps    │  │
                        │  └──────────────────┘  │
                        └────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Frontend Detects Completion                                        │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ 1. Poll returns status: "completed"                        │    │
│  │ 2. Stop polling interval                                   │    │
│  │ 3. Show toast notification                                 │    │
│  │    "Cào dữ liệu thành công! Đã thu thập X công việc."     │    │
│  │ 4. Update job history table                                │    │
│  │ 5. Re-enable submit button                                 │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                        ┌────────────────────┐
                        │  ADMIN NOTIFIED!   │
                        └────────────────────┘
```

## Key Components:

### 1. Database (MongoDB)
- **ScrapeJob Collection:** Stores job metadata and status
- **JobDetail Collection:** Stores scraped job postings

### 2. Backend API Routes
- **POST /api/scrape/upload:** Creates job, triggers scraper
- **POST /api/scrape/result:** Receives scraper callback, updates job
- **GET /api/scrape/status/[jobId]:** Returns job status (for polling)
- **GET /api/scrape/jobs:** Returns recent jobs (for history)

### 3. Frontend
- **Form submission:** Starts the process
- **Polling loop:** Checks status every 3 seconds
- **Toast notifications:** Shows instant feedback
- **Job history table:** Displays all recent jobs

### 4. Scraper Service (Python)
- Receives URLs to scrape
- Processes them asynchronously
- Sends results back via callback

## Timing:
- **Polling interval:** 3 seconds
- **Toast duration:** 5 seconds
- **Job history:** Last 50 jobs
