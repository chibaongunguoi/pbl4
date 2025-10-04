import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/pbl4_db";

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
  return cache.conn;
}

export default connectDb;
