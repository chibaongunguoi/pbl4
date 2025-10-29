import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import User_company from "@/models/User_company";
import { verifyToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    await connectDb();

    const token = req.cookies.get("auth")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyID } = await req.json();

    if (!companyID) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    // Check if user already applied to this company
    const existingApplication = await User_company.findOne({
      userID: decoded.userId,
      companyID: companyID
    });

    if (existingApplication) {
      return NextResponse.json({ 
        error: "You have already applied to this company" 
      }, { status: 409 });
    }

    // Create new application
    const application = await User_company.create({
      userID: decoded.userId,
      companyID: companyID,
      time: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      message: "Application submitted successfully",
      data: application 
    }, { status: 201 });

  } catch (err) {
    console.error("Apply error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET endpoint to check if user has applied or get user's applications
export async function GET(req) {
  try {
    await connectDb();

    const token = req.cookies.get("auth")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyID = searchParams.get('companyID');

    if (companyID) {
      // Check if user has applied to specific company
      const application = await User_company.findOne({
        userID: decoded.userId,
        companyID: companyID
      });

      return NextResponse.json({ 
        success: true,
        hasApplied: !!application,
        data: application
      }, { status: 200 });
    } else {
      // Get all user's applications
      const applications = await User_company.find({ 
        userID: decoded.userId 
      }).populate('companyID').sort({ time: -1 });

      return NextResponse.json({ 
        success: true,
        data: applications
      }, { status: 200 });
    }

  } catch (err) {
    console.error("Get applications error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
