import { NextResponse } from "next/server";
import JobDetail from "@/models/job_detail";
import connectDb from "@/app/lib/db";

export async function POST(_: Request) {
    await connectDb();
    const job = await JobDetail.find();
    return NextResponse.json({ success: true, data: job }, { status: 200 });
}