import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { url } = await req.json();
    console.log(`Received url: ${url}`);
    fetch("http://localhost:37222/api/scrape", {
      method: "POST",
      // headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: [url], callback_url: "http://localhost:3000/api/scrape/result" }),
    });

    return NextResponse.json({}, { status: 200 });
  }
  catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
