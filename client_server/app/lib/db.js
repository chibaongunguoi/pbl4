import mongoose from "mongoose";
import getConfigs from "./config";

const MONGODB_URI = getConfigs().MONGODB_URI;

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
