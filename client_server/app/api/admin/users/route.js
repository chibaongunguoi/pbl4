import { NextResponse } from 'next/server';
import connectDb from '@/app/lib/db';
import User from '@/models/User';

export async function GET(request) {
  try {
    // Connect to database
    await connectDb();

    // Get all users with selected fields (exclude password)
    const users = await User.find({}, {
      password: 0 // Exclude password field
    }).sort({ createdAt: -1 }); // Sort by newest first

    return NextResponse.json({ 
      users: users,
      success: true 
    });

  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}