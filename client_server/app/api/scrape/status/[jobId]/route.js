import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import ScrapeJob from "@/models/ScrapeJob";

export async function GET(req, { params }) {
  try {
    const { jobId } = params;
    
    await connectDb();
    const job = await ScrapeJob.findById(jobId).lean();
    
    if (!job) {
      return NextResponse.json({ 
        error: "Job not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      job: {
        id: job._id.toString(),
        url: job.url,
        status: job.status,
        jobCount: job.jobCount,
        errorMessage: job.errorMessage,
        metadata: job.metadata,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
      }
    });
  }
  catch (e) {
    console.error("Error fetching job status:", e);
    return NextResponse.json({ 
      error: "Something went wrong." 
    }, { status: 500 });
  }
}
