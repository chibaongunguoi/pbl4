import { NextResponse } from "next/server";
import Company from "@/models/Company";
import connectDb from "@/app/lib/db";

export async function GET() {
  try {
    await connectDb();
    const companies = await Company.find()
      .select('name email phone logo website address createdAt')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      companies: companies,
      count: companies.length 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch companies" 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDb();
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ 
        success: false, 
        error: "Tên công ty là bắt buộc" 
      }, { status: 400 });
    }

    // Check if company name already exists
    const existingCompany = await Company.findOne({ name: body.name });
    if (existingCompany) {
      return NextResponse.json({ 
        success: false, 
        error: "Tên công ty đã tồn tại" 
      }, { status: 400 });
    }

    // Create new company
    const newCompany = new Company({
      name: body.name.trim(),
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      website: body.website?.trim() || null,
      logo: body.logo?.trim() || null,
      description: body.description?.trim() || null,
      address: body.address?.trim() || null
    });

    const savedCompany = await newCompany.save();
    
    return NextResponse.json({ 
      success: true, 
      message: "Thêm công ty thành công",
      company: savedCompany
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating company:", error);
    
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
        error: "Tên công ty hoặc email đã tồn tại" 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: "Không thể thêm công ty" 
    }, { status: 500 });
  }
}