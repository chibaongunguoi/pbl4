import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import ChatHistory from "@/models/ChatHistory";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    await connectDb();
    const chat = await ChatHistory.findById(id);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    return NextResponse.json({ chat_history: chat.messages });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    await connectDb();
    await ChatHistory.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}