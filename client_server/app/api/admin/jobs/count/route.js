import { NextResponse } from 'next/server';
import connectDb from '@/app/lib/db';
import JobDetail from '@/models/JobDetail';

export async function GET(request) {
  try {
    // Connect to database
    await connectDb();
    
    // Count total jobs from database
    const jobCount = await JobDetail.countDocuments();

    return NextResponse.json({ 
      count: jobCount,
      success: true 
    });

  } catch (error) {
    console.error('Error getting job count:', error);
    // Fallback count if database fails
    return NextResponse.json({ 
      count: 0,
      success: false,
      error: 'Could not fetch job count' 
    }, { status: 500 });
  }
}