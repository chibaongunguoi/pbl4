import mongoose from "mongoose"

export default async function Home() {
  try {
    const conn = await mongoose.connect("mongodb://localhost:27017/");
    console.log(`MongoDB Connected ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
  return <h1>lmao</h1>;
}
