import { NextResponse } from "next/server";
import User from "@/models/user"
import connectDb from "@/app/lib/db";
import { signToken } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDb();
    const { username, password } = await req.json();
    const user = await User.findOne({ username: username, password: password });
    if (!user) {
      return NextResponse.json({ error: "Bad credentials." }, { status: 401 });
    }

    const token = await signToken(username, user.role);
    const res = NextResponse.json({ success: true }, { status: 200 })
    res.cookies.set("auth", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/", maxAge: 60 * 60,
    });
    return res;
  }
  catch (e) {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
