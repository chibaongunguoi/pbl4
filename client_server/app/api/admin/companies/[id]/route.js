import { NextResponse } from "next/server";
import Company from "@/models/Company";
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