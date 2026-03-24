import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types/auth.js";
import { Analysis } from "../models/Analysis.js";
import { User } from "../models/User.js";

const router = Router();

/**
 * POST /analyze
 * Receives AI-generated analysis from frontend (Puter.js),
 * saves it to MongoDB, and returns the saved record.
 */
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { resumeText, jobDescription, jobTitle, analysis } = req.body as {
    resumeText?: string;
    jobDescription?: string;
    jobTitle?: string;
    analysis?: {
      overallScore?: number;
      breakdown?: {
        skills?: number;
        experience?: number;
        education?: number;
        keywords?: number;
        tone?: number;
      };
      missingKeywords?: string[];
      strengths?: string[];
      improvements?: string[];
      suggestions?: string[];
      atsScore?: number;
      jobTitle?: string;
    };
  };

  if (!resumeText || !jobDescription) {
    return res.status(400).json({ message: "resumeText and jobDescription are required" });
  }
  if (!analysis) {
    return res.status(400).json({ message: "analysis object is required" });
  }

  const breakdown = analysis.breakdown ?? {};
  const dimensions = {
    skillsMatch: Math.min(100, Math.max(0, Number(breakdown.skills) || 0)),
    experienceMatch: Math.min(100, Math.max(0, Number(breakdown.experience) || 0)),
    educationMatch: Math.min(100, Math.max(0, Number(breakdown.education) || 0)),
    keywordsMatch: Math.min(100, Math.max(0, Number(breakdown.keywords) || 0)),
    toneStyle: Math.min(100, Math.max(0, Number(breakdown.tone) || 0)),
  };

  const atsScore = Math.min(100, Math.max(0, Number(analysis.atsScore ?? analysis.overallScore) || 0));

  const saved = await Analysis.create({
    userId: req.userId,
    resumeText,
    jobDescription,
    jobTitle: analysis.jobTitle || jobTitle || "",
    atsScore,
    dimensions,
    missingKeywords: Array.isArray(analysis.missingKeywords) ? analysis.missingKeywords : [],
    strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
    improvements: Array.isArray(analysis.improvements) ? analysis.improvements : [],
    suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions : [],
    recommendations: [
      ...(Array.isArray(analysis.improvements) ? analysis.improvements : []),
      ...(Array.isArray(analysis.suggestions) ? analysis.suggestions.slice(0, 3) : []),
    ],
  });

  // Increment user's total analyses count
  await User.findByIdAndUpdate(req.userId, { $inc: { totalAnalyses: 1 } }).catch(() => {});

  return res.status(201).json({
    id: saved.id,
    atsScore,
    overallScore: Number(analysis.overallScore) || atsScore,
    dimensions,
    missingKeywords: saved.missingKeywords,
    strengths: saved.strengths,
    improvements: saved.improvements,
    suggestions: saved.suggestions,
    jobTitle: saved.jobTitle,
    createdAt: saved.createdAt,
  });
});

export default router;
