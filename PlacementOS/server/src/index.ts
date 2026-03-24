import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import analyzeRoutes from "./routes/analyze.js";
import historyRoutes from "./routes/history.js";
import jobsRoutes from "./routes/jobs.js";
import profileRoutes from "./routes/profile.js";
import adminRoutes from "./routes/admin.js";
import interviewRoutes from "./routes/interview.js";
import coverLetterRoutes from "./routes/coverLetter.js";
import resumeBuilderRoutes from "./routes/resumeBuilder.js";
import { roastRoutes } from "./routes/roast.js";
import { mockInterviewRoutes } from "./routes/mockInterview.js";
import { skillGapRoutes } from "./routes/skillGap.js";
import { jobTrackerRoutes } from "./routes/jobTracker.js";
import { campusRoutes } from "./routes/campus.js";
import roadmapRoutes from "./routes/roadmap.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import dsaRoutes from "./routes/dsa.js";
import companyRoutes from "./routes/companyResearch.js";
import referralRoutes from "./routes/referral.js";

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "4mb" }));

app.get("/", (_req, res) => {
  res.send("Welcome to AI Resume Checker API. Use /health to check status.");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, status: "ok" });
});

app.use("/analyze", analyzeRoutes);
app.use("/history", historyRoutes);
app.use("/jobs", jobsRoutes);
app.use("/profile", profileRoutes);
app.use("/admin", adminRoutes);
app.use("/interview", interviewRoutes);
app.use("/cover-letter", coverLetterRoutes);
app.use("/resume-builder", resumeBuilderRoutes);
app.use("/roast", roastRoutes);
app.use("/mock-interview", mockInterviewRoutes);
app.use("/skill-gap", skillGapRoutes);
app.use("/campus", campusRoutes);
app.use("/roadmap", roadmapRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/dsa", dsaRoutes);
app.use("/company-research", companyRoutes);
app.use("/referral", referralRoutes);
app.use("/jobs-tracker", jobTrackerRoutes);
app.use("/campus", campusRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.message);
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
