import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import UserProfile from "@/models/UserProfile";
import { verifyToken } from "@/app/lib/auth";

// GET - Fetch user profile by user ID (admin only)
export async function GET(request, { params }) {
  try {
    const token = request.cookies.get("auth")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized - No token" }, { status: 401 });
    }

    let user;
    try {
      user = await verifyToken(token);
    } catch (err) {
      console.error("Token verification error:", err);
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = params;
    const profile = await UserProfile.findOne({ userID: id });

    if (!profile) {
      return NextResponse.json({ 
        success: true, 
        data: null,
        message: "No profile found for this user"
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: profile 
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile by user ID (admin only)
export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized - No token" }, { status: 401 });
    }

    let user;
    try {
      user = await verifyToken(token);
    } catch (err) {
      console.error("Token verification error:", err);
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = params;
    const body = await request.json();
    const { name, phone, gender, birthdate, cv, description } = body;

    // Check if profile exists
    let profile = await UserProfile.findOne({ userID: id });

    if (profile) {
      // Update existing profile
      profile.name = name || profile.name;
      profile.phone = phone || profile.phone;
      profile.gender = gender || profile.gender;
      profile.birthdate = birthdate || profile.birthdate;
      profile.cv = cv !== undefined ? cv : profile.cv;
      profile.description = description !== undefined ? description : profile.description;

      await profile.save();
    } else {
      // Create new profile
      profile = new UserProfile({
        userID: id,
        name,
        phone,
        gender,
        birthdate,
        cv,
        description
      });

      await profile.save();
    }

    return NextResponse.json({ 
      success: true, 
      data: profile,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
