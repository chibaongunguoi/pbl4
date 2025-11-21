import { NextResponse } from "next/server";
import getConfigs from "@/app/lib/config";
import { verifyToken } from '@/app/lib/auth';

const configs = getConfigs();

export async function POST(req) {
  try {
    // Require admin token
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
    const { chat_history, chat_id } = await req.json();

    const body = { chat_history };
    if (chat_id) {
      body.chat_id = chat_id;
    }

    const response = await fetch(`http://${configs.CHATBOT_SYSTEM_HOST}:${configs.CHATBOT_SYSTEM_PORT}/api/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    // Create a readable stream from the backend response
    const stream = new ReadableStream({
      start(controller) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        function push() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(new TextEncoder().encode(chunk));
            push();
          }).catch(err => {
            controller.error(err);
          });
        }
        push();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Error in chatbot upload:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}