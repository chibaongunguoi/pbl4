import { NextResponse } from 'next/server';
import connectDb from '@/app/lib/db';
import User from '@/models/User';

export async function GET(request) {
  try {
    // Connect to database
    await connectDb();

    // Count total users
    const totalUsers = await User.countDocuments();

    return NextResponse.json({ 
      count: totalUsers,
      success: true 
    });

  } catch (error) {
    console.error('Error getting user count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}