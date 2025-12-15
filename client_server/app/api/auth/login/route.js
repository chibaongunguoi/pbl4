import { NextResponse } from "next/server";
import User from "@/models/User"
import connectDb from "@/app/lib/db";
import { signToken } from "@/app/lib/auth";
import { verifyPassword } from "@/app/lib/passwordUtil";

export async function POST(req) {
  try {
    await connectDb();
    const { username, password } = await req.json();
    const user = await User.findOne({ username: username });
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: "Bad credentials." }, { status: 401 });
    }

    const token = await signToken(username, user.role, user._id.toString());
    const redirect = (() => {
      switch (user.role) {
        case "admin":
          return "/admin"
        case "user":
          return "/"
        default:
          return "/"
      }
    })();
    

    const res = NextResponse.json({ 
      success: true, 
      redirect,
    }, { status: 200 });
    res.cookies.set("auth", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: "/", maxAge: 600 * 600,
    }); 
    return res;
  }
  catch (e) {
    console.log(e); return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
