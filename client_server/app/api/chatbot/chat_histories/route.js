import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import ChatHistory from "@/models/ChatHistory";

export async function GET() {
  try {
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