import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types/auth.js";
import { Analysis } from "../models/Analysis.js";
import { User } from "../models/User.js";
import Groq from "groq-sdk";
import { env } from "../config/env.js";

const router = Router();

/**
 * POST /analyze
 * Receives AI-generated analysis from frontend (Puter.js),
 * OR performs the analysis via backend Groq,
 * saves it to MongoDB, and returns the saved record.
 */
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    let { resumeText, jobDescription, jobTitle, analysis } = req.body as {
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
      try {
        console.log("[Backend Analyze Engine] Missing analysis object, calling Groq...");
        if (!process.env.GROQ_API_KEY && !env.groqApiKey) {
           throw new Error("GROQ_API_KEY is not configured in backend");
        }
        const groqApiKey = env.groqApiKey || process.env.GROQ_API_KEY;
        const groq = new Groq({ apiKey: groqApiKey });
        
        const prompt = `You are an expert ATS resume analyzer.
Analyze this SPECIFIC resume against this SPECIFIC job description.

RESUME TEXT:
${resumeText.slice(0, 3000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

Analyze carefully and return ONLY valid JSON. No markdown, no backticks, no extra text.
{
  "overallScore": 72,
  "breakdown": {
    "skills": 75,
    "experience": 68,
    "education": 80,
    "keywords": 65,
    "tone": 72
  },
  "missingKeywords": ["Docker", "AWS", "REST API"],
  "strengths": [
    "Good React experience mentioned",
    "Projects are relevant to the role"
  ],
  "improvements": [
    "Add cloud platform experience",
    "Quantify achievements with numbers"
  ],
  "suggestions": [
    "Add Docker containerization to skills section",
    "Mention any AWS or GCP projects you have done",
    "Change worked on to led, built, developed, designed",
    "Add GitHub profile link if not present",
    "Add metrics: increased performance by X%, reduced time by Y%"
  ],
  "atsScore": 68,
  "jobTitle": "Software Developer"
}`;
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000
        });
        const rawText = completion.choices[0].message.content || "";
        const cleanedText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
        analysis = JSON.parse(cleanedText);
        console.log("[Backend Analyze Engine] Groq text parsed successfully!");
      } catch (err: any) {
        console.error("[Backend Analyze Engine Error]", err);
        // Fallback behavior if backend fails: instruct frontend to use its fallback
        return res.status(500).json({ message: "Backend AI analysis failed. Please use frontend fallback." });
      }
    }

    const breakdown = analysis!.breakdown ?? {};
    const dimensions = {
      skillsMatch: Math.min(100, Math.max(0, Number(breakdown.skills) || 0)),
      experienceMatch: Math.min(100, Math.max(0, Number(breakdown.experience) || 0)),
      educationMatch: Math.min(100, Math.max(0, Number(breakdown.education) || 0)),
      keywordsMatch: Math.min(100, Math.max(0, Number(breakdown.keywords) || 0)),
      toneStyle: Math.min(100, Math.max(0, Number(breakdown.tone) || 0)),
    };

    const atsScore = Math.min(100, Math.max(0, Number(analysis!.atsScore ?? analysis!.overallScore) || 0));

    const saved = await Analysis.create({
      userId: req.userId,
      resumeText,
      jobDescription,
      jobTitle: analysis!.jobTitle || jobTitle || "",
      atsScore,
      dimensions,
      missingKeywords: Array.isArray(analysis!.missingKeywords) ? analysis!.missingKeywords : [],
      strengths: Array.isArray(analysis!.strengths) ? analysis!.strengths : [],
      improvements: Array.isArray(analysis!.improvements) ? analysis!.improvements : [],
      suggestions: Array.isArray(analysis!.suggestions) ? analysis!.suggestions : [],
      recommendations: [
        ...(Array.isArray(analysis!.improvements) ? analysis!.improvements : []),
        ...(Array.isArray(analysis!.suggestions) ? analysis!.suggestions.slice(0, 3) : []),
      ],
    });

    // Increment user's total analyses count
    await User.findByIdAndUpdate(req.userId, { $inc: { totalAnalyses: 1 } }).catch(() => {});
    
    console.log(`[Backend Analyze Engine] Successfully saved analysis to DB for user ${req.userId}. Analysis ID: ${saved.id}`);

    return res.status(201).json({
      id: saved.id,
      atsScore,
      overallScore: Number(analysis!.overallScore) || atsScore,
      dimensions,
      missingKeywords: saved.missingKeywords,
      strengths: saved.strengths,
      improvements: saved.improvements,
      suggestions: saved.suggestions,
      jobTitle: saved.jobTitle,
      createdAt: saved.createdAt,
    });
  } catch (error: any) {
    console.error("[Backend Analyze Route Error]", error);
    return res.status(500).json({ message: "An unexpected error occurred on the server." });
  }
});

export default router;
