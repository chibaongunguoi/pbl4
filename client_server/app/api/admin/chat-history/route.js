import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import ChatHistory from "@/models/ChatHistory";
import { verifyToken } from "@/app/lib/auth";

export async function POST(request) {
  try {
    // Verify auth token
    const token = request.cookies.get("auth")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await connectDb();

    const body = await request.json();
    const messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ success: false, error: "Missing messages" }, { status: 400 });
    }

    // Build message objects (role, content) - timestamp set by schema
    const sanitized = messages.map((m) => ({ role: m.role, content: m.content }));

    const chat = new ChatHistory({ userId: user.userId, messages: sanitized });
    await chat.save();

    return NextResponse.json({ success: true, id: chat._id }, { status: 201 });
  } catch (error) {
    console.error("Error saving chat history:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
