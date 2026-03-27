import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types/auth.js";
import { Analysis } from "../models/Analysis.js";
import { ActivityHistory } from "../models/ActivityHistory.js";
import mongoose from "mongoose";

const router = Router();

// GET /history — all analyses & activities for current user
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const [analyses, activities] = await Promise.all([
    Analysis.find({ userId: req.userId })
      .select("atsScore dimensions missingKeywords strengths improvements suggestions jobTitle createdAt")
      .lean(),
    ActivityHistory.find({ userId: req.userId })
      .lean()
  ]);

  const mappedAnalyses = analyses.map((a: any) => ({
    ...a,
    _id: a._id.toString(),
  }));

  const mappedActivities = activities.map((act: any) => {
    // Format the title to look like an analysis
    const formattedTitle = `[${act.featureType.toUpperCase().replace(/_/g, " ")}] ${act.title}`;
    return {
      _id: act._id.toString(),
      atsScore: 100, // Dummy score so it renders as a green badge in the UI
      jobTitle: formattedTitle,
      dimensions: { skillsMatch: 0, experienceMatch: 0, educationMatch: 0, keywordsMatch: 0, toneStyle: 0 },
      missingKeywords: [],
      strengths: [],
      improvements: [act.result],
      suggestions: [],
      createdAt: act.createdAt
    };
  });

  const combined = [...mappedAnalyses, ...mappedActivities];
  combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Return the combined array, matching what the frontend expects, limited to 50
  return res.json(combined.slice(0, 50));
});

// GET /history/stats — progress stats (Analyses ONLY)
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

// POST /history/activity — save an activity (called by frontend for things like Salary, LinkedIn)
router.post("/activity", requireAuth, async (req: AuthRequest, res) => {
  const { featureType, title, result } = req.body;
  if (!featureType || !title || !result) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const newActivity = await ActivityHistory.create({
    userId: req.userId,
    featureType,
    title,
    result
  });

  return res.status(201).json(newActivity);
});

// DELETE /history/:id — delete one analysis OR activity
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  
  // Try deleting from Analysis first
  let deleted = await Analysis.findOneAndDelete({ _id: id, userId: req.userId });
  if (!deleted) {
    // Try deleting from ActivityHistory
    deleted = await ActivityHistory.findOneAndDelete({ _id: id, userId: req.userId });
  }

  if (!deleted) {
    return res.status(404).json({ message: "Analysis/Activity not found" });
  }
  return res.json({ message: "Deleted successfully" });
});

export default router;
