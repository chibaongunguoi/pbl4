import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDb from '@/app/lib/db';
import Notification from '@/models/Notification';
import { verifyToken } from '@/app/lib/auth';

export async function PUT(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth');

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token.value);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    await connectDb();

    const { id } = await params;
    const { status } = await request.json();

    // Verify the notification belongs to the current user
    const notification = await Notification.findOne({
      _id: id,
      userID: decoded.userId,
    });

    if (!notification) {
      return NextResponse.json(
        { message: 'Notification not found' },
        { status: 404 }
      );
    }

    notification.status = status || 'đã đọc';
    await notification.save();

    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully',
      data: notification,
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
