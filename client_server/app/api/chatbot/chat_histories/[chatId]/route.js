import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import ChatHistory from "@/models/ChatHistory";

export async function GET(req, { params }) {
  try {
    const { chatId } = await params;
    if (!chatId) {
      return NextResponse.json({ error: "Missing chatId" }, { status: 400 });
    }

    await connectDb();

    const chat = await ChatHistory.findById(chatId);
    if (!chat) {
      return NextResponse.json({ error: "Chat history not found" }, { status: 404 });
    }

    return NextResponse.json({ chat_history: chat.messages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { chatId } = await params;
    if (!chatId) {
      return NextResponse.json({ error: "Missing chatId" }, { status: 400 });
    }

    await connectDb();

    await ChatHistory.findByIdAndDelete(chatId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat history:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
