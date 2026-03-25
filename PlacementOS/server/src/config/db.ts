import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDb() {
  try {
    if (!env.mongoUri) {
      console.warn("MONGO_URI is not defined in environment variables. Proceeding without DB.");
      return;
    }
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected successfully");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`MongoDB connection failed: ${message}`);
    console.warn("App will continue running, but database features will be unavailable.");
  }
}
