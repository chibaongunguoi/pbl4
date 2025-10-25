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
    
    // Remove fields that shouldn't be updated
    const { _id, __v, createdAt, password, username, ...updateData } = body;

    const company = await Company.findByIdAndUpdate(
      id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');
    
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