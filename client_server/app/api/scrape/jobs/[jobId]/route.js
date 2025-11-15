import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import ScrapeJob from "@/models/ScrapeJob";

export async function DELETE(req, { params }) {
  try {
    const { jobId } = await params;
    
    await connectDb();
    
    const deletedJob = await ScrapeJob.findByIdAndDelete(jobId);
    
    if (!deletedJob) {
      return NextResponse.json({ 
        error: "Job not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Job deleted successfully"
    });
  }
  catch (e) {
    console.error("Error deleting job:", e);
    return NextResponse.json({ 
      error: "Something went wrong." 
    }, { status: 500 });
  }
}
