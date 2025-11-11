import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import User_company from '@/models/User_company';
import Company from '@/models/Company';
import User from '@/models/User';
import UserProfile from '@/models/UserProfile';
import JobDetail from '@/models/JobDetail';
import { verifyToken } from '@/app/lib/auth';

// GET: Fetch all applications for the company
export async function GET(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get("auth")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if user is company role
    if (decoded.role !== 'company') {
      return NextResponse.json(
        { success: false, message: 'Only company accounts can access applications' },
        { status: 403 }
      );
    }

    await connectDB();

    // Find company by username
    const company = await Company.findOne({ username: decoded.username });
    if (!company) {
      // Return empty array instead of error - company might not have applications yet
      console.log('Company not found for username:', decoded.username);
      return NextResponse.json(
        {
          success: true,
          data: [],
          count: 0,
          message: 'No company profile found'
        },
        { status: 200 }
      );
    }

    console.log('Found company:', company._id, company.name);

    // Find all jobs posted by this company
    const companyJobs = await JobDetail.find({ company_name: company.name });
    const jobIds = companyJobs.map(job => job._id);

    console.log('Found company jobs:', jobIds.length);

    // Find all applications for these jobs
    const applications = await User_company.find({ JobDetailID: { $in: jobIds } })
      .populate('userID', 'username')
      .populate('JobDetailID')
      .sort({ time: -1 }); // Sort by most recent first

    console.log('Found applications:', applications.length);

    // Fetch UserProfile for each application
    const applicationsWithProfile = await Promise.all(
      applications.map(async (app) => {
        const userProfile = await UserProfile.findOne({ username: app.userID?.username });
        return {
          _id: app._id,
          userID: app.userID,
          JobDetailID: app.JobDetailID,
          time: app.time,
          status: app.status || 'chưa duyệt',
          userProfile: userProfile || null,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: applicationsWithProfile,
        count: applicationsWithProfile.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
