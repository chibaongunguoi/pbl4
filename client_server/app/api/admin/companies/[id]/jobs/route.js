import { NextResponse } from "next/server";
import JobDetail from "@/models/JobDetail";
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

    // First get company name by ID
    const Company = (await import("@/models/Company")).default;
    const company = await Company.findById(id);
    
    if (!company) {
      return NextResponse.json({ 
        success: false, 
        error: "Không tìm thấy công ty" 
      }, { status: 404 });
    }

    // Find jobs by company name
    const jobs = await JobDetail.find({ 
      company_name: { $regex: new RegExp(company.name, 'i') }
    }).sort({ createdAt: -1 });
    return NextResponse.json({ 
      success: true, 
      jobs: jobs,
      count: jobs.length,
      companyName: company.name
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching company jobs:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Lỗi khi lấy danh sách công việc" 
    }, { status: 500 });
  }
}