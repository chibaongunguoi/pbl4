import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import User_company from '@/models/User_company';
import { verifyToken } from '@/app/lib/auth';

// DELETE - Xóa đơn ứng tuyển
export async function DELETE(request, { params }) {
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

    // Only company role can delete applications
    if (decoded.role !== 'company') {
      return NextResponse.json(
        { error: 'Forbidden - Only companies can delete applications' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Find and delete the application
    const deletedApplication = await User_company.findByIdAndDelete(id);

    if (!deletedApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Application deleted successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
