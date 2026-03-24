import { Router } from "express";
import { User } from "../models/User.js";
import { Analysis } from "../models/Analysis.js";

const router = Router();

// GET /admin/stats — aggregate stats (no auth needed for demo)
router.get("/stats", async (_req, res) => {
  const [totalUsers, totalAnalyses, analyses] = await Promise.all([
    User.countDocuments(),
    Analysis.countDocuments(),
    Analysis.find().select("atsScore missingKeywords createdAt").sort({ createdAt: -1 }).limit(500),
  ]);

  const avgScore = analyses.length
    ? Math.round(analyses.reduce((a, b) => a + b.atsScore, 0) / analyses.length)
    : 0;

  // Most common missing keywords
  const keywordCount: Record<string, number> = {};
  for (const a of analyses) {
    for (const kw of a.missingKeywords || []) {
      keywordCount[kw] = (keywordCount[kw] || 0) + 1;
    }
  }
  const topMissingSkills = Object.entries(keywordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));

  // Daily usage last 7 days
  const now = new Date();
  const dailyUsage: Array<{ date: string; count: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = analyses.filter((a) => {
      const aDate = new Date(a.createdAt!).toISOString().split("T")[0];
      return aDate === dateStr;
    }).length;
    dailyUsage.push({ date: dateStr, count });
  }

  return res.json({ totalUsers, totalAnalyses, avgScore, topMissingSkills, dailyUsage });
});

export default router;
