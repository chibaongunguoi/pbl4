import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDb from '@/app/lib/db';
import Notification from '@/models/Notification';
import { verifyToken } from '@/app/lib/auth';

export async function GET() {
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

    console.log('Decoded token:', decoded);
    console.log('User ID from token:', decoded.userId);

    await connectDb();

    // Fetch notifications for the current user, sorted by newest first
    const notifications = await Notification.find({ userID: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    console.log('Found notifications count:', notifications.length);
    console.log('Notifications:', notifications);

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
