import { NextResponse } from 'next/server';
import connectDb from '@/app/lib/db';
import User_company from '@/models/User_company';
import JobDetail from '@/models/JobDetail';
import Notification from '@/models/Notification';
import { verifyToken } from '@/app/lib/auth';

// DELETE - Xóa đơn ứng tuyển
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

// PUT - Update application status (approve/reject)
export async function PUT(request, { params }) {
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

    // Only company role can update application status
    if (decoded.role !== 'company') {
      return NextResponse.json(
        { error: 'Forbidden - Only companies can update applications' },
        { status: 403 }
      );
    }

    const { id } = params;
  const body = await request.json();
  const { status, content: providedContent } = body || {};

    const allowed = ['chưa duyệt', 'đã duyệt', 'đã từ chối'];
    if (!status || !allowed.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const updated = await User_company.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Create a notification for the applicant with job title and custom note
    try {
      const job = await JobDetail.findById(updated.JobDetailID).select('job_title');
      const jobTitle = job?.job_title || 'công việc';
      
      // Determine status text
      let statusText = '';
      if (status === 'đã duyệt') {
        statusText = 'được duyệt';
      } else if (status === 'đã từ chối') {
        statusText = 'bị từ chối';
      } else {
        statusText = status;
      }
      
      // Build notification content
      let content = `CV của bạn đã ${statusText} từ công việc "${jobTitle}"`;
      
      // Add custom note if provided
      if (typeof providedContent === 'string' && providedContent.trim().length > 0) {
        content += `, có ghi chú thêm là: ${providedContent.trim()}`;
      }

      await Notification.create({
        userID: updated.userID,
        JobDetailID: updated.JobDetailID,
        content,
        status: 'chưa đọc'
      });
    } catch (notifErr) {
      console.error('Failed to create notification:', notifErr);
      // Continue even if notification creation failed
    }

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
