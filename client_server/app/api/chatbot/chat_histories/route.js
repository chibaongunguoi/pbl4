import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import ChatHistory from "@/models/ChatHistory";
import { verifyToken } from '@/app/lib/auth';

export async function GET(request) {
  try {
    const token = request.cookies.get('auth')?.value;
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
    await connectDb();
    // For admin, get all chat histories or filter by userId if needed
    const chatHistories = await ChatHistory.find({}).sort({ updatedAt: -1 });
    const formatted = chatHistories.map(chat => ({
      id: chat._id.toString(),
      title: chat.messages.length > 1 ? chat.messages[1].content.substring(0, 50) + '...' : 'New Chat',
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }));
    return NextResponse.json({ chat_histories: formatted });
  } catch (error) {
    console.error("Error fetching chat histories:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}