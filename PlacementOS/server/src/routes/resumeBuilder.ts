import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types/auth.js";
import { ResumeBuilder } from "../models/ResumeBuilder.js";

const router = Router();

/**
 * POST /resume-builder/save
 * Save or update the user's resume builder data
 */
router.post("/save", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { personalInfo, experience, education, skills, projects } = req.body;

    // We can keep one draft per user, or allow multiple. 
    // Let's just upsert one main resume per user to keep it simple, 
    // or create a new one. The prompt implies just getting their resume.
    // Let's do an upsert so they always have their latest draft.
    const saved = await ResumeBuilder.findOneAndUpdate(
      { userId: req.userId },
      {
        personalInfo: personalInfo || {},
        experience: experience || [],
        education: education || [],
        skills: skills || [],
        projects: projects || [],
      },
      { new: true, upsert: true } // Create if doesn't exist
    );

    res.status(200).json(saved);
  } catch (error) {
    console.error("Error saving resume builder data:", error);
    res.status(500).json({ message: "Failed to save resume data" });
  }
});

/**
 * GET /resume-builder
 * GET /resume-builder/:userId
 * Fetch the user's resume builder data
 */
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const resume = await ResumeBuilder.findOne({ userId: req.userId });
    res.json(resume || null);
  } catch (error) {
    console.error("Error fetching resume data:", error);
    res.status(500).json({ message: "Failed to fetch resume data" });
  }
});

router.get("/:userId", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.params.userId !== req.userId) return res.status(403).json({ message: "Forbidden" });
    const resume = await ResumeBuilder.findOne({ userId: req.userId });
    res.json(resume || null);
  } catch (error) {
    console.error("Error fetching resume data:", error);
    res.status(500).json({ message: "Failed to fetch resume data" });
  }
});

export default router;
