import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import JobDetail from "@/models/JobDetail";
import ScrapeJob from "@/models/ScrapeJob";

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
    const { data, status, metadata } = res;
    
    console.log("Scrape callback received:");
    console.log("Status:", status);
    console.log("Data count:", data?.length || 0);
    console.log("Metadata:", metadata);
    
    await connectDb();
    
    // Update the ScrapeJob status if jobId is provided
    if (metadata?.jobId) {
      const updateData = {
        completedAt: new Date(),
      };

      if (status === 'success') {
        updateData.status = 'completed';
        updateData.jobCount = data?.length || 0;
        if (metadata.completed_in_seconds) {
          updateData.metadata = { 
            ...metadata,
            completed_in_seconds: metadata.completed_in_seconds 
          };
        }
      } else {
        updateData.status = 'failed';
        updateData.errorMessage = 'Scraping failed';
      }

      await ScrapeJob.findByIdAndUpdate(metadata.jobId, updateData);
      console.log(`Updated ScrapeJob ${metadata.jobId} with status: ${updateData.status}`);
    }

    // Save job details to database if data exists
    if (data && Array.isArray(data) && data.length > 0) {
      await JobDetail.bulkWrite(
        data.map(record => ({ 
          updateOne: { 
            filter: { url: record.url }, 
            update: { $set: record }, 
            upsert: true 
          } 
        }))
      );
      console.log(`Saved ${data.length} job details to database`);
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  }
  catch (e) {
    console.error("Error in scrape result callback:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

