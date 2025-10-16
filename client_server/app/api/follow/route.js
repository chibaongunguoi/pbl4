import { NextResponse } from "next/server";
import Follow from "@/models/Follow";
import connectDb from "@/app/lib/db";
import { verifyToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    await connectDb();
    
    // Lấy token từ cookies
    const token = req.cookies.get("auth")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }

    // Verify token để lấy user info
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;
    const { id: jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Kiểm tra xem user đã follow job này chưa
    const existingFollow = await Follow.findOne({ userId, jobId });

    if (existingFollow) {
      // Nếu đã follow thì unfollow (xóa)
      await Follow.deleteOne({ userId, jobId });
      return NextResponse.json({ 
        success: true, 
        message: "Unfollowed successfully", 
        isFollowed: false 
      }, { status: 200 });
    } else {
      // Nếu chưa follow thì tạo mới
      const newFollow = new Follow({
        userId,
        jobId
      });
      
      await newFollow.save();
      return NextResponse.json({ 
        success: true, 
        message: "Followed successfully", 
        isFollowed: true 
      }, { status: 201 });
    }

  } catch (error) {
    console.error("Follow API error:", error);
    
    // Xử lý lỗi duplicate key (trường hợp race condition)
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: true, 
        message: "Already followed", 
        isFollowed: true 
      }, { status: 200 });
    }
    
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// API để lấy trạng thái follow
export async function GET(req) {
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

    const userId = decoded.userId;
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Kiểm tra trạng thái follow
    const follow = await Follow.findOne({ userId, jobId });
    
    return NextResponse.json({ 
      isFollowed: !!follow 
    }, { status: 200 });

  } catch (error) {
    console.error("Get follow status error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
