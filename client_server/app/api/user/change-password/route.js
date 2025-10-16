import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDb from "@/app/lib/db";
import { verifyToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    await connectDb();
    
    // Lấy token từ cookies
    const token = req.cookies.get("auth")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token để lấy user info
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        error: "Current password and new password are required" 
      }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ 
        error: "New password must be at least 6 characters long" 
      }, { status: 400 });
    }

    // Tìm user và kiểm tra mật khẩu hiện tại
    const user = await User.findOne({ 
      username: decoded.username, 
      password: currentPassword 
    });

    if (!user) {
      return NextResponse.json({ 
        error: "Current password is incorrect" 
      }, { status: 400 });
    }

    // Cập nhật mật khẩu mới
    await User.updateOne(
      { _id: user._id },
      { password: newPassword }
    );

    return NextResponse.json({ 
      success: true,
      message: "Password updated successfully" 
    }, { status: 200 });

  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}