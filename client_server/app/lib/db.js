import mongoose from "mongoose";
import initDb from "./init_db";

const MONGODB_URI = process.env.DB_CONNECTION_STRING || "mongodb://db:27017/pbl4_db";

let cache = global.mongoose;

if (!cache) {
  cache = global.mongoose = { conn: null, promise: null };
}

async function connectDb() {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    mongoose.pluralize(null);
    cache.promise = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }

  cache.conn = await cache.promise;
  await initDb();
  return cache.conn;
}

export default connectDb;
