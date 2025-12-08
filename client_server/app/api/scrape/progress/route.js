import { NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import ScrapeJob from "@/models/ScrapeJob";

export async function POST(req) {
  try {
    const { jobId, processedUrls, currentUrl, progress } = await req.json();

    console.log(`Progress update for job ${jobId}: ${processedUrls} processed, current: ${currentUrl}, progress: ${progress}%`);

    await connectDb();

    // Update the ScrapeJob progress
    await ScrapeJob.findByIdAndUpdate(jobId, {
      processedUrls,
      currentUrl,
      progress,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  }
  catch (e) {
    console.error("Error updating progress:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}