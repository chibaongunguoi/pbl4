import mongoose from "mongoose"
import JobDetail from "@/models/job_detail.model";

export default async function Home() {
  try {
    const conn = await mongoose.connect("mongodb://localhost:27017/pbl4_db");
    console.log(`MongoDB Connected ${conn.connection.host}`);

    const job = await JobDetail.findOne();
    console.log(job)

  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }

  return <h1>lmao</h1>;
}
