import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import ScrapeJob from "@/models/ScrapeJob";

export async function GET(req) {
  try {
    await connectDb();
    
    // Get recent scrape jobs (last 50)
    const jobs = await ScrapeJob.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    const transformedJobs = jobs.map(job => ({
      id: job._id.toString(),
      url: job.url,
      status: job.status,
      jobCount: job.jobCount,
      errorMessage: job.errorMessage,
      metadata: job.metadata,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    }));

    return NextResponse.json({ 
      jobs: transformedJobs,
      success: true 
    });
  }
  catch (e) {
    console.error("Error fetching recent jobs:", e);
    return NextResponse.json({ 
      error: "Something went wrong.",
      jobs: []
    }, { status: 500 });
  }
}
