import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email, password } = await req.json();
    console.log(email, password);

    return NextResponse.json({ success: true }, { status: 200 });
}