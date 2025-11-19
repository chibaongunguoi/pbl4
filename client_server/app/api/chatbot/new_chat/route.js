import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import ChatHistory from "@/models/ChatHistory";

const DEFAULT_USER_ID = process.env.CHATBOT_DEFAULT_USER ?? "admin";

const normalizeMessage = (message) => ({
  role: message?.role ?? "system",
  content: message?.content ?? "",
  timestamp: message?.timestamp ? new Date(message.timestamp) : new Date(),
});

async function fetchInitialHistory(request) {
  const url = new URL("/api/chatbot/new_chat_history", request.url);
  const response = await fetch(url, { method: "POST" });

  if (!response.ok) {
    throw new Error(`Backend responded with ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload?.chat_history)) {
    throw new Error("Invalid chat history payload");
  }

  return payload.chat_history;
}

export async function POST(request) {
  try {
    const initialChatHistory = await fetchInitialHistory(request);

    await connectDb();
    const newChat = await ChatHistory.create({
      userId: DEFAULT_USER_ID,
      messages: initialChatHistory.map(normalizeMessage),
    });

    return NextResponse.json({
      chat_id: newChat._id.toString(),
      chat_history: initialChatHistory,
    });
  } catch (error) {
    console.error("Error creating new chat:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong." },
      { status: 500 }
    );
  }
}