import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const token = req.cookies.get("auth")?.value;

    if (!token) {
      return NextResponse.json({}, { status: 401 });
    }

    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({}, { status: 401 });
    }

    const res = NextResponse.json({ ...user }, { status: 200 })
    return res;
  }
  catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
