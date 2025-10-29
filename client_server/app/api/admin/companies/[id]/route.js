import { NextResponse } from "next/server";
import Company from "@/models/Company";
import User from "@/models/User";
import connectDb from "@/app/lib/db";

export async function GET(request, { params }) {
  try {
    await connectDb();
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "ID công ty là bắt buộc" 
      }, { status: 400 });
    }

    const company = await Company.findById(id);
    
    if (!company) {
      return NextResponse.json({ 
        success: false, 
        error: "Không tìm thấy công ty" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      company: company
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching company detail:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Lỗi khi lấy thông tin công ty" 
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDb();
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "ID công ty là bắt buộc" 
      }, { status: 400 });
    }

    const body = await request.json();
    
    // Get current company to access old username
    const currentCompany = await Company.findById(id);
    if (!currentCompany) {
      return NextResponse.json({ 
        success: false, 
        error: "Không tìm thấy công ty" 
      }, { status: 404 });
    }

    // Handle username and password update separately
    const newUsername = body.username?.trim();
    const newPassword = body.password?.trim();
    
    // Update User account if username or password is provided
    if (newUsername || newPassword) {
      const oldUsername = currentCompany.username;
      
      if (!oldUsername) {
        return NextResponse.json({ 
          success: false, 
          error: "Công ty này chưa có tài khoản người dùng" 
        }, { status: 400 });
      }

      // Find the user account
      const userAccount = await User.findOne({ username: oldUsername });
      if (!userAccount) {
        return NextResponse.json({ 
          success: false, 
          error: "Không tìm thấy tài khoản người dùng" 
        }, { status: 404 });
      }

      // If username is being changed, check if new username already exists
      if (newUsername && newUsername !== oldUsername) {
        const existingUser = await User.findOne({ username: newUsername });
        if (existingUser) {
          return NextResponse.json({ 
            success: false, 
            error: "Username mới đã tồn tại trong hệ thống" 
          }, { status: 400 });
        }
        
        // Update username in User model
        userAccount.username = newUsername;
      }

      // Update password if provided
      if (newPassword) {
        userAccount.password = newPassword;
      }

      await userAccount.save();
    }
    
    // Remove fields that shouldn't be updated directly
    const { _id, __v, createdAt, password, username, ...updateData } = body;
    
    // Add username to updateData if it was changed
    if (newUsername) {
      updateData.username = newUsername;
    }

    const company = await Company.findByIdAndUpdate(
      id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!company) {
      return NextResponse.json({ 
        success: false, 
        error: "Không tìm thấy công ty" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: company,
      message: "Cập nhật công ty thành công"
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Lỗi khi cập nhật công ty" 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDb();
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "ID công ty là bắt buộc" 
      }, { status: 400 });
    }

    const company = await Company.findByIdAndDelete(id);
    
    if (!company) {
      return NextResponse.json({ 
        success: false, 
        error: "Không tìm thấy công ty" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Xóa công ty thành công"
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Lỗi khi xóa công ty" 
    }, { status: 500 });
  }
}