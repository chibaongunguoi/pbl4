import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import connectDb from "../app/lib/db.ts";
import User from "../models/user.ts";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seed() {
  await connectDb();

  const filePath = path.join(__dirname, "../data/user.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const users = JSON.parse(rawData);

  await User.deleteMany({});
  await User.insertMany(users);

  console.log("Database seeded from JSON!");
}

await seed().catch((err) => {
  console.error("Seeding failed:", err);
});

const user = await User.findOne({role: "user"});
console.log(user);

mongoose.connection.close();