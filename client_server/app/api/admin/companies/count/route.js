import { NextResponse } from "next/server";
import Company from "@/models/Company";
import connectDb from "@/app/lib/db";

export async function GET() {
  try {
    await connectDb();
    const count = await Company.countDocuments();
    
    return NextResponse.json({ 
      success: true, 
      count: count 
    }, { status: 200 });
  } catch (error) {
    console.error("Error counting companies:", error);
    return NextResponse.json({ 
      success: false, 
      count: 0 
    }, { status: 500 });
  }
}