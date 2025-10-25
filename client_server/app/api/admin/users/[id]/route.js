import { NextResponse } from 'next/server';
import connectDb from '@/app/lib/db';
import User from '@/models/User';

export async function DELETE(request, { params }) {
  try {
    await connectDb();
    const { id } = params;

    // Tìm và xóa người dùng
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'Không tìm thấy người dùng' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Xóa người dùng thành công'
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Không thể xóa người dùng: ' + error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    await connectDb();
    const { id } = params;

    // Tìm người dùng theo ID (không trả về password)
    const user = await User.findById(id, { password: 0 });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Không tìm thấy người dùng' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      user: user
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Không thể lấy thông tin người dùng: ' + error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDb();
    const { id } = params;
    const body = await request.json();

    // Cập nhật người dùng
    const updateData = {};
    if (body.username) updateData.username = body.username;
    if (body.role) updateData.role = body.role;
    if (body.password) updateData.password = body.password;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true, select: '-password' }
    );

    if (!updatedUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'Không tìm thấy người dùng' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Cập nhật người dùng thành công',
      user: updatedUser
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Không thể cập nhật người dùng: ' + error.message 
      },
      { status: 500 }
    );
  }
}
