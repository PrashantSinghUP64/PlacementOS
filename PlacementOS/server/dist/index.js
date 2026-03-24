import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import analyzeRoutes from "./routes/analyze.js";
import historyRoutes from "./routes/history.js";
import jobsRoutes from "./routes/jobs.js";
const app = express();
app.use(cors({
    origin: env.clientOrigin,
}));
app.use(express.json({ limit: "2mb" }));
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
app.use("/auth", authRoutes);
app.use("/analyze", analyzeRoutes);
app.use("/history", historyRoutes);
app.use("/jobs", jobsRoutes);
app.use((err, _req, res, _next) => {
    return res.status(500).json({ message: err.message || "Internal server error" });
});
async function bootstrap() {
    await connectDb();
    app.listen(env.port, () => {
        console.log(`API running on http://localhost:${env.port}`);
    });
}
bootstrap().catch((error) => {
    console.error("\n========== API FAILED TO START ==========\n");
    console.error(error instanceof Error ? error.message : error);
    console.error("\n==========================================\n");
    process.exit(1);
});
