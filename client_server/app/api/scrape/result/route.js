import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import JobDetail from "@/models/JobDetail";

export async function POST(req) {
  try {
    const res = await req.json();
    const data = res.data;
    console.log("Data:");
    console.log(data);
    await connectDb();
    await JobDetail.bulkWrite(
      data.map(record => ({ updateOne: { filter: { url: record.url }, update: { $set: record }, upsert: true } }))
    );
    return NextResponse.json({}, { status: 200 });
  }
  catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

