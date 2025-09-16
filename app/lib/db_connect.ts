import mongoose from "mongoose";

export default async function connectDb() {
  try {
    const conn = await mongoose.connect("mongodb://localhost:27017/pbl4_db");
    console.log(`MongoDB Connected ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}
