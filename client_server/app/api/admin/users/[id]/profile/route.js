import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import UserProfile from "@/models/UserProfile";
import { verifyToken } from "@/app/lib/auth";

// GET - Fetch user profile by user ID (admin only)
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    await connectDB();
   console.log(id,"21");  
    const profile = await UserProfile.findOne({ username: id });
    console.log(profile,"22");
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
    const { id } = await params;
    
    await connectDB();
 
   
    const body = await request.json();
    const { name, phone, gender, birthdate, cv, description } = body;

    // Check if profile exists
    let profile = await UserProfile.findOne({ username: id });

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
        username: id,
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
