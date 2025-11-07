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

export async function POST(request) {
  try {
    await connectDb();
    const body = await request.json();
    
    // Validate required fields
    if (!body.job_title) {
      return NextResponse.json({ 
        success: false, 
        error: "Tên công việc là bắt buộc" 
      }, { status: 400 });
    }

    // Generate unique URL if not provided
    let jobUrl = body.url;
    if (!jobUrl) {
      // Create URL from job title and timestamp
      const slug = body.job_title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const timestamp = Date.now();
      jobUrl = `https://example.com/jobs/${slug}-${timestamp}`;
    }

    // Create new job
    const newJob = new JobDetail({
      job_title: body.job_title,
      company_name: body.company_name || '',
      province: body.province || 'Không xác định',
      salary: body.salary || '',
      thumbnail: body.thumbnail || '',
      skills: body.skills || [],
      descriptions: body.descriptions || {},
      job_info: body.job_info || {},
      url: jobUrl,
      company_url: body.company_url || '',
      collected_at: new Date()
    });

    await newJob.save();

    return NextResponse.json({ 
      success: true, 
      data: newJob,
      message: "Tạo công việc thành công"
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Không thể tạo công việc mới" 
    }, { status: 500 });
  }
}