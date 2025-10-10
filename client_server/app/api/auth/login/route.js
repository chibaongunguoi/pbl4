import { NextResponse } from "next/server";
import User from "@/models/User"
import connectDb from "@/app/lib/db";
import { signToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    await connectDb();
    const { username, password } = await req.json();
    const user = await User.findOne({ username: username, password: password });
    if (!user) {
      return NextResponse.json({ error: "Bad credentials." }, { status: 401 });
    }

    const token = await signToken(username, user.role);
    const redirect = (() => {
      switch (user.role) {
        case "admin":
          return "/admin/profile"
        case "user":
          return "/user/profile"
        default:
          return "/"
      }
    })();
    
    // Tạo object user để trả về (không bao gồm password)
    const userInfo = {
      username: user.username,
      role: user.role,
      _id: user._id
    };
    
    const res = NextResponse.json({ 
      success: true, 
      redirect,
      user: userInfo 
    }, { status: 200 });
    res.cookies.set("auth", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/", maxAge: 60 * 60,
    });
    return res;
  }
  catch (e) {
    console.log(e); return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
