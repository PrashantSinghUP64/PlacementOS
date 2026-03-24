import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types/auth.js";
import { CoverLetter } from "../models/CoverLetter.js";

const router = Router();

router.post("/save", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { companyName, jobDescription, resumeText, content, tone, wordCount } = req.body;

    if (!companyName || !jobDescription || !resumeText || !content || !tone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const saved = await CoverLetter.create({
      userId: req.userId,
      companyName,
      jobDescription,
      resumeText,
      content,
      tone,
      wordCount: wordCount || content.split(/\s+/).length,
    });

    res.status(201).json(saved);
  } catch (error) {
    console.error("Error saving cover letter:", error);
    res.status(500).json({ message: "Failed to save cover letter" });
  }
});

router.get("/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const history = await CoverLetter.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error("Error fetching cover letters:", error);
    res.status(500).json({ message: "Failed to fetch cover letters" });
  }
});

router.get("/history/:userId", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.params.userId !== req.userId) return res.status(403).json({ message: "Forbidden" });
    const history = await CoverLetter.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error("Error fetching cover letters:", error);
    res.status(500).json({ message: "Failed to fetch cover letters" });
  }
});

export default router;
