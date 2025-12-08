import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import ScrapeJob from "@/models/ScrapeJob";
import getConfigs from "@/app/lib/config";

const configs = getConfigs();

export async function POST(req) {
  try {
    const { urls } = await req.json();
    console.log(`Received urls: ${urls}`);

    // Validate input - urls should be an array of strings
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "URLs must be a non-empty array." }, { status: 400 });
    }

    // Filter out empty strings and trim whitespace
    const validUrls = urls.filter(url => url && url.trim()).map(url => url.trim());

    if (validUrls.length === 0) {
      return NextResponse.json({ error: "No valid URLs provided." }, { status: 400 });
    }

    // Connect to database and create a job record
    await connectDb();
    const scrapeJob = await ScrapeJob.create({
      urls: validUrls,
      status: 'processing',
      totalUrls: validUrls.length,
      processedUrls: 0,
      progress: 0,
    });

    const jobId = scrapeJob._id.toString();
    console.log(`Created scrape job with ID: ${jobId}`);

    // Start the scraping process (fire and forget)
    fetch(`http://${configs.SCRAPER_HOST}:${configs.SCRAPER_PORT}/api/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urls: validUrls,
        callback_url: "http://localhost:3000/api/scrape/result",
        progress_callback_url: "http://localhost:3000/api/scrape/progress",
        metadata: {
          jobId,
          start_at: Date.now() / 1000 // Unix timestamp in seconds
        }
      }),
    }).catch(err => {
      console.error("Error calling scraper:", err);
      // Update job status to failed if scraper call fails
      ScrapeJob.findByIdAndUpdate(jobId, {
        status: 'failed',
        errorMessage: 'Failed to start scraper service',
        completedAt: new Date(),
      }).catch(console.error);
    });

    return NextResponse.json({ jobId }, { status: 200 });
  }
  catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
