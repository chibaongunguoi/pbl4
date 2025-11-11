import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import JobDetail from '@/models/JobDetail';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const skill = searchParams.get('skill');
    const city = searchParams.get('city');

    // Build search conditions
    const searchConditions = [];

    // Text search in multiple fields
    if (query && query.trim().length > 0) {
      const searchRegex = new RegExp(query.trim(), 'i');
      
      // Get all jobs first to search in descriptions object
      const allJobs = await JobDetail.find().lean();
      const jobIdsMatchingDescriptions = allJobs
        .filter(job => {
          if (job.descriptions && typeof job.descriptions === 'object') {
            // Search in all values of descriptions object
            return Object.values(job.descriptions).some(desc => 
              typeof desc === 'string' && searchRegex.test(desc)
            );
          }
          return false;
        })
        .map(job => job._id);

      searchConditions.push({
        $or: [
          { job_title: searchRegex },
          { job_description: searchRegex },
          { company_name: searchRegex },
          { location: searchRegex },
          { job_type: searchRegex },
          { skills: { $in: [searchRegex] } },
          { _id: { $in: jobIdsMatchingDescriptions } }, // Add jobs matching in descriptions
        ],
      });
    }

    // Filter by skill
    if (skill && skill.trim().length > 0) {
      searchConditions.push({
        skills: { $regex: new RegExp(skill.trim(), 'i') }
      });
    }

    // Filter by city
    if (city && city.trim().length > 0) {
      searchConditions.push({
        $or: [
          { province: { $regex: new RegExp(city.trim(), 'i') } },
          { location: { $regex: new RegExp(city.trim(), 'i') } },
        ]
      });
    }

    // If no search conditions, return empty result
    if (searchConditions.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No search criteria provided',
      });
    }

    // Combine all conditions with AND
    const jobs = await JobDetail.find({
      $and: searchConditions
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      data: jobs,
      count: jobs.length,
      query: query || '',
      skill: skill || '',
      city: city || '',
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
