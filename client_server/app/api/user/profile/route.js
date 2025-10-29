import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import UserProfile from "@/models/UserProfile";
import { verifyToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    await connectDb();

    const token = req.cookies.get("auth")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await UserProfile.findOne({ username: decoded.username }).lean();

    return NextResponse.json({ success: true, data: profile || null }, { status: 200 });
  } catch (err) {
    console.error("GET /api/user/profile error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDb();

    const token = req.cookies.get("auth")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    // Ensure username from token is used
    const payload = {
      name: body.name || '',
      gender: body.gender || '',
      birthdate: body.birthdate ? new Date(body.birthdate) : undefined,
      cv: body.cv || '',
      description: body.description || '',
      username: decoded.username
    };

    // Prevent duplicate
    const existing = await UserProfile.findOne({ username: decoded.username });
    if (existing) {
      return NextResponse.json({ error: "Profile already exists" }, { status: 409 });
    }

    const profile = await UserProfile.create(payload);
    return NextResponse.json({ success: true, data: profile }, { status: 201 });
  } catch (err) {
    console.error("POST /api/user/profile error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDb();

    const token = req.cookies.get("auth")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const updates = {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.gender !== undefined && { gender: body.gender }),
      ...(body.birthdate !== undefined && { birthdate: body.birthdate ? new Date(body.birthdate) : null }),
      ...(body.cv !== undefined && { cv: body.cv }),
      ...(body.description !== undefined && { description: body.description }),
    };

    const updated = await UserProfile.findOneAndUpdate(
      { username: decoded.username },
      updates,
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/user/profile error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
