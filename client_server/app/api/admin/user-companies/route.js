import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import User_company from '@/models/User_company';
import User from '@/models/User';
import Company from '@/models/Company';
import { verifyToken } from '@/app/lib/auth';

// GET: Fetch all applications (admin only)
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

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only admin can access all applications' },
        { status: 403 }
      );
    }

    await connectDB();

    // Find all applications and populate user and company info
    const applications = await User_company.find()
      .populate('userID', 'username role')
      .populate('companyID', 'name email phone')
      .sort({ time: -1 }); // Sort by most recent first

    return NextResponse.json(
      {
        success: true,
        data: applications,
        count: applications.length,
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

// DELETE: Delete an application (admin only)
export async function DELETE(request) {
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

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only admin can delete applications' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Application ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const deletedApplication = await User_company.findByIdAndDelete(id);

    if (!deletedApplication) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Application deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
