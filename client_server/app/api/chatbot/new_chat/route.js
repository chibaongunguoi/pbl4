import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import ChatHistory from "@/models/ChatHistory";
import getConfigs from "@/app/lib/config";
import { verifyToken } from '@/app/lib/auth';

const configs = getConfigs();

const normalizeMessage = (message) => ({
  role: message?.role ?? "system",
  content: message?.content ?? "",
  timestamp: message?.timestamp ? new Date(message.timestamp) : new Date(),
});

async function fetchInitialHistory() {
  const response = await fetch(`http://${configs.CHATBOT_SYSTEM_HOST}:${configs.CHATBOT_SYSTEM_PORT}/api/new_chat_history`, {
    method: "POST",
  });

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
    // require admin token
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
    const initialChatHistory = await fetchInitialHistory();

    await connectDb();
    const newChat = await ChatHistory.create({
      userId: decoded.userId,
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