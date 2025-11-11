import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import Notification from '@/models/Notification';
import { verifyToken } from '@/app/lib/auth';

// GET - Lấy tất cả thông báo (admin only)
export async function GET(request) {
  try {
    await dbConnect();

    // Verify token
    const token = request.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Only admin can access all notifications
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all notifications with user and job details
    const notifications = await Notification.find({})
      .populate('userID', 'username email')
      .populate('JobDetailID', 'job_title company_name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { 
        success: true,
        data: notifications,
        count: notifications.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
