import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import ScrapeJob from "@/models/ScrapeJob";
import getConfigs from "@/app/lib/config";

const configs = getConfigs();

export async function POST(req) {
  try {
    const { url } = await req.json();
    console.log(`Received url: ${url}`);

    // Connect to database and create a job record
    await connectDb();
    const scrapeJob = await ScrapeJob.create({
      url,
      status: 'processing',
    });

    const jobId = scrapeJob._id.toString();
    console.log(`Created scrape job with ID: ${jobId}`);

    // Start the scraping process (fire and forget)
    fetch(`http://${configs.SCRAPER_HOST}:${configs.SCRAPER_PORT}/api/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urls: [url],
        callback_url: "http://localhost:3000/api/scrape/result",
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
