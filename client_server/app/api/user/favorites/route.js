import { NextResponse } from "next/server";
import Follow from "@/models/Follow";
import connectDb from "@/app/lib/db";
import { verifyToken } from "@/app/lib/auth";

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

    // Lấy danh sách jobId mà user đã follow
    const follows = await Follow.find({ userId }).sort({ createdAt: -1 });
    const jobIds = follows.map(follow => follow.jobId);

    // Fetch thông tin chi tiết của các jobs từ API jobDetail
    let jobs = [];
    if (jobIds.length > 0) {
      try {
  const response = await fetch(`/api/jobDetail`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Filter jobs theo jobIds đã follow
          jobs = data.data?.filter(job => jobIds.includes(job._id)) || [];
          
          // Sắp xếp theo thứ tự follow (mới nhất trước)
          jobs.sort((a, b) => {
            const aIndex = jobIds.indexOf(a._id);
            const bIndex = jobIds.indexOf(b._id);
            return aIndex - bIndex;
          });
        }
      } catch (fetchError) {
        console.error('Error fetching job details:', fetchError);
      }
    }

    return NextResponse.json({ 
      success: true,
      data: jobs,
      total: jobs.length
    }, { status: 200 });

  } catch (error) {
    console.error("Get user favorites error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}