import { NextResponse } from 'next/server';
import connectDb from '@/app/lib/db';
import Notification from '@/models/Notification';
import { verifyToken } from '@/app/lib/auth';

// DELETE - Xóa thông báo (admin only)
export async function DELETE(request, { params }) {
  try {
    await connectDb();

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

    // Only admin can delete notifications
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Find and delete the notification
    const deletedNotification = await Notification.findByIdAndDelete(id);

    if (!deletedNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Notification deleted successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
