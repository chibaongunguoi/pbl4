import { NextResponse } from "next/server";
import getConfigs from "@/app/lib/config";

const configs = getConfigs();

export async function POST() {
  try {
    const response = await fetch(`http://${configs.CHATBOT_SYSTEM_HOST}:${configs.CHATBOT_SYSTEM_PORT}/api/new_chat_history`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in new_chat_history:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
