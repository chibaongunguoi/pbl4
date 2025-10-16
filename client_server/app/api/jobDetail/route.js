import { NextResponse } from "next/server";
import JobDetail from "@/models/JobDetail";
import connectDb from "@/app/lib/db";

export async function GET() {
  try {
    await connectDb();
    const jobs = await JobDetail.find().sort({ createdAt: -1 });
    return NextResponse.json({ 
      success: true, 
      data: jobs,
      count: jobs.length 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching job details:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch job details" 
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    await connectDb();
    const jobs = await JobDetail.find().sort({ createdAt: -1 });
    return NextResponse.json({ 
      success: true, 
      data: jobs,
      count: jobs.length 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching job details:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch job details" 
    }, { status: 500 });
  }
}