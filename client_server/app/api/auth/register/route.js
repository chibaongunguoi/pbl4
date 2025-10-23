import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDb from "@/app/lib/db";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    await connectDb();
    
    const body = await request.json();
    const { username, password } = body;

    // Validation
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: "Tên đăng nhập và mật khẩu là bắt buộc"
      }, { status: 400 });
    }

    // Validate username length
    if (username.trim().length < 3) {
      return NextResponse.json({
        success: false,
        error: "Tên đăng nhập phải có ít nhất 3 ký tự"
      }, { status: 400 });
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: "Mật khẩu phải có ít nhất 6 ký tự"
      }, { status: 400 });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: "Tên đăng nhập đã tồn tại"
      }, { status: 409 });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      username: username.trim(),
      password: hashedPassword,
      role: "user" // Default role for regular users
    });

    const savedUser = await newUser.save();

    return NextResponse.json({
      success: true,
      message: "Đăng ký thành công",
      user: {
        id: savedUser._id,
        username: savedUser.username,
        role: savedUser.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json({
        success: false,
        error: "Dữ liệu không hợp lệ"
      }, { status: 400 });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: "Tên đăng nhập đã tồn tại"
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: "Lỗi server. Vui lòng thử lại sau."
    }, { status: 500 });
  }
}