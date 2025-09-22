import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import connectDb from "../app/lib/db.ts";
import User from "../models/User.ts";
import JobDetail from "../models/JobDetail.ts";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seed() {
  await connectDb();

  const user_filepath = path.join(__dirname, "../data/User.json");
  const user_data = fs.readFileSync(user_filepath, "utf-8");
  const users = JSON.parse(user_data);
  await User.deleteMany({});
  await User.insertMany(users);

  const job_detail_filepath = path.join(__dirname, "../data/JobDetail.json");
  const job_detail_data = fs.readFileSync(job_detail_filepath, "utf-8");
  const job_details = JSON.parse(job_detail_data);
  await JobDetail.deleteMany({});
  await JobDetail.insertMany(job_details);

  console.log("Database seeded from JSON!");
}

await seed().catch((err) => {
  console.error("Seeding failed:", err);
});

// const user = await User.findOne({ role: "user" });
// console.log(user);

mongoose.connection.close();
