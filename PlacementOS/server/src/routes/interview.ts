import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types/auth.js";
import { Interview } from "../models/Interview.js";

const router = Router();

/**
 * POST /interview/generate
 * Save newly generated interview questions from the frontend AI
 */
router.post("/generate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { jobRole, resumeText, questions } = req.body;

    if (!jobRole || !resumeText || !questions) {
      return res.status(400).json({ message: "jobRole, resumeText, and questions are required" });
    }

    const saved = await Interview.create({
      userId: req.userId,
      jobRole,
      resumeText,
      questions,
    });

    res.status(201).json(saved);
  } catch (error) {
    console.error("Error saving interview questions:", error);
    res.status(500).json({ message: "Failed to save interview questions" });
  }
});

/**
 * GET /interview/history
 * Get all past interview questions for the user
 * (Frontend doesn't need to pass :userId in URL if we use the auth token, 
 * but since prompt requested /history/:userId we will support it, though auth is safer)
 */
router.get("/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const history = await Interview.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error("Error fetching interview history:", error);
    res.status(500).json({ message: "Failed to fetch interview history" });
  }
});

router.get("/history/:userId", requireAuth, async (req: AuthRequest, res) => {
  try {
    // Only allow fetching own history
    if (req.params.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const history = await Interview.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error("Error fetching interview history:", error);
    res.status(500).json({ message: "Failed to fetch interview history" });
  }
});

export default router;
