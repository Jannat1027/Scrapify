// Connects to MongoDB (Atlas or a local server) using MONGO_URI from .env.
import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  await mongoose.connect(env.mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
