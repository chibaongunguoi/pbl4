import { NextResponse } from "next/server";
import JobDetail from "@/models/JobDetail";
import connectDb from "@/app/lib/db";

export async function POST() {
  await connectDb();
  const job = await JobDetail.find();
  return NextResponse.json({ success: true, data: job }, { status: 200 });
}
