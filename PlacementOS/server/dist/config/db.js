import mongoose from "mongoose";
import { env } from "./env.js";
export async function connectDb() {
    try {
        await mongoose.connect(env.mongoUri);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const hint = "\n\nMongoDB connection failed. Common fixes:\n" +
            "  • Start MongoDB locally, or set MONGO_URI in server/.env (e.g. MongoDB Atlas).\n" +
            `  • Current MONGO_URI: ${env.mongoUri}\n`;
        throw new Error(`${message}${hint}`);
    }
}
