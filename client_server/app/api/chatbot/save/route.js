import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import ChatHistory from "@/models/ChatHistory";

export async function POST(req) {
  try {
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