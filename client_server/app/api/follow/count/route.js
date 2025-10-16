import { NextResponse } from "next/server";
import Follow from "@/models/Follow";
import connectDb from "@/app/lib/db";

export async function GET(req) {
  try {
    await connectDb();
    
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Đếm số lượt follow cho job này
    const followCount = await Follow.countDocuments({ jobId });
    
    return NextResponse.json({ 
      count: followCount 
    }, { status: 200 });

  } catch (error) {
    console.error("Get follow count error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDb();
    
    const { jobIds } = await req.json();

    if (!jobIds || !Array.isArray(jobIds)) {
      return NextResponse.json({ error: "Job IDs array is required" }, { status: 400 });
    }

    // Lấy số lượt follow cho nhiều jobs cùng lúc
    const followCounts = await Follow.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: "$jobId", count: { $sum: 1 } } }
    ]);

    // Tạo map để dễ lookup
    const countMap = {};
    followCounts.forEach(item => {
      countMap[item._id] = item.count;
    });

    // Đảm bảo tất cả jobIds đều có trong response (count = 0 nếu chưa có follow nào)
    const result = jobIds.reduce((acc, jobId) => {
      acc[jobId] = countMap[jobId] || 0;
      return acc;
    }, {});

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Get follow counts error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}