import { NextResponse } from "next/server";
import Company from "@/models/Company";
import User from "@/models/User";
import connectDb from "@/app/lib/db";

export async function GET() {
  try {
    await connectDb();
    const companies = await Company.find()
      .select('name email phone logo website address username createdAt')
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

    if (!body.username || !body.username.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: "Username là bắt buộc" 
      }, { status: 400 });
    }

    if (!body.password || !body.password.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: "Password là bắt buộc" 
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

    // Handle user creation if username and password are provided
    let createdUsername = null;
    
    // Check if username already exists
    const existingUser = await User.findOne({ username: body.username.trim() });
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: "Username đã tồn tại trong hệ thống" 
      }, { status: 400 });
    }

    // Create new user account with role "company"
    try {
      // Clear any cached model to ensure fresh schema
      delete require.cache[require.resolve('@/models/User')];
      
      const newUser = new User({
        username: body.username.trim(),
        password: body.password, // Lưu password không mã hóa theo yêu cầu
        role: 'company'
      });
      await newUser.save();
      createdUsername = body.username.trim();
    } catch (userError) {
      console.error("Error creating user:", userError);
      return NextResponse.json({ 
        success: false, 
        error: "Không thể tạo tài khoản người dùng: " + userError.message
      }, { status: 500 });
    }

    // Create new company
    const newCompany = new Company({
      name: body.name.trim(),
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      website: body.website?.trim() || null,
      logo: body.logo?.trim() || null,
      description: body.description?.trim() || null,
      address: body.address?.trim() || null,
      username: createdUsername
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
        error: "Email đã tồn tại" 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: "Không thể thêm công ty" 
    }, { status: 500 });
  }
}