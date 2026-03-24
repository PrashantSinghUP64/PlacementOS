import dotenv from "dotenv";
dotenv.config();
export const env = {
    port: Number(process.env.PORT ?? 5000),
    mongoUri: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/resume-analyzer",
    jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
    clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
};
