import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = await fetch("http://localhost:37002/api/new_chat_history", {
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