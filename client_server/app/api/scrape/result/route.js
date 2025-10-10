import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();
    console.log("Received data:");
    console.log(data);
    return NextResponse.json({}, { status: 200 });
  }
  catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

