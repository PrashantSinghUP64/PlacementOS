import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types/auth.js";
import { Analysis } from "../models/Analysis.js";
import mongoose from "mongoose";

const router = Router();

// GET /history — all analyses for current user
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const history = await Analysis.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .select("atsScore dimensions missingKeywords strengths improvements suggestions jobTitle createdAt")
    .limit(50);
  return res.json(history);
});

// GET /history/stats — progress stats
router.get("/stats", requireAuth, async (req: AuthRequest, res) => {
  const analyses = await Analysis.find({ userId: req.userId })
    .sort({ createdAt: 1 })
    .select("atsScore createdAt");

  if (analyses.length === 0) {
    return res.json({
      averageScore: 0,
      bestScore: 0,
      totalAnalyses: 0,
      improvement: 0,
      scoreHistory: [],
    });
  }

  const scores = analyses.map((a) => a.atsScore);
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const bestScore = Math.max(...scores);
  const firstScore = scores[0];
  const lastScore = scores[scores.length - 1];
  const improvement = lastScore - firstScore;

  const scoreHistory = analyses.map((a) => ({
    score: a.atsScore,
    date: a.createdAt,
  }));

  return res.json({
    averageScore,
    bestScore,
    totalAnalyses: analyses.length,
    improvement,
    scoreHistory,
  });
});

// DELETE /history/:id — delete one analysis
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  const analysis = await Analysis.findOneAndDelete({ _id: id, userId: req.userId });
  if (!analysis) {
    return res.status(404).json({ message: "Analysis not found" });
  }
  return res.json({ message: "Deleted successfully" });
});

export default router;
