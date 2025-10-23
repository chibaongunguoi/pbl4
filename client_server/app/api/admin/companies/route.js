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