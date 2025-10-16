import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import JobDetail from "@/models/JobDetail";

export async function GET(req) {
  try {
    await connectDb();
    
    // Get all jobs from database
    const jobs = await JobDetail.find({})
      .sort({ collected_at: -1 }) // Sort by newest first
      .limit(500) // Limit to prevent too much data
      .lean(); // For better performance
    
    // Transform data to match expected format
    const transformedJobs = jobs.map(job => ({
      id: job._id.toString(),
      title: job.job_title,
      company: job.company_name,
      location: job.province,
      salary: job.salary,
      skills: job.skills || [],
      logo: job.thumbnail,
      experience: job.job_info?.get('Kinh nghiệm') || job.job_info?.get('experience'),
      posted_date: job.collected_at ? new Date(job.collected_at).toLocaleDateString('vi-VN') : 'N/A',
      url: job.url
    }));

    return NextResponse.json({ 
      jobs: transformedJobs,
      success: true,
      total: transformedJobs.length
    });
  }
  catch (e) {
    console.error("Error fetching jobs:", e);
    return NextResponse.json({ 
      error: "Something went wrong.", 
      jobs: [],
      success: false 
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const res = await req.json();
    const data = res.data;
    console.log("Data:");
    console.log(data);
    await connectDb();
    await JobDetail.bulkWrite(
      data.map(record => ({ updateOne: { filter: { url: record.url }, update: { $set: record }, upsert: true } }))
    );
    return NextResponse.json({}, { status: 200 });
  }
  catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

