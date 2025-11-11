import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import JobDetail from '@/models/JobDetail';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No search query provided',
      });
    }

    // Search in multiple fields using regex (case-insensitive)
    const searchRegex = new RegExp(query.trim(), 'i');
    
    const jobs = await JobDetail.find({
      $or: [
        { job_title: searchRegex },
        { job_description: searchRegex },
        { company_name: searchRegex },
        { location: searchRegex },
        { job_type: searchRegex },
        { skills: { $in: [searchRegex] } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      data: jobs,
      count: jobs.length,
      query: query,
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
