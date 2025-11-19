import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { chat_history, chat_id } = await req.json();

    const body = { chat_history };
    if (chat_id) {
      body.chat_id = chat_id;
    }

    const response = await fetch("http://localhost:37002/api/upload", {
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