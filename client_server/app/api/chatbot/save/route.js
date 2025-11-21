import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import ChatHistory from "@/models/ChatHistory";
import { verifyToken } from '@/app/lib/auth';

export async function POST(req) {
  try {
    const token = req.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }
    const { chat_id, messages } = await req.json();
    await connectDb();
    await ChatHistory.findByIdAndUpdate(chat_id, {
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date()
      })),
      updatedAt: new Date()
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving chat:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}