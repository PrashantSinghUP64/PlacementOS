import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

const router = express.Router();

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!env.geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please add it to server/.env");
    }
    genAI = new GoogleGenerativeAI(env.geminiApiKey);
  }
  return genAI;
}

/**
 * POST /api/ai/chat
 * Centralized AI endpoint — used by all frontend features.
 * Body: { prompt: string }
 * Returns: { text: string }
 * No authentication required.
 */
router.post("/chat", async (req, res) => {
  try {
    const prompt = (req.body.message || req.body.prompt) as string | undefined;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "prompt is required and must be a non-empty string" });
    }

    if (prompt.length > 30000) {
      return res.status(400).json({ error: "prompt too long (max 30,000 characters)" });
    }

    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return res.json({ text });
  } catch (err: any) {
    console.error("[AI Route] Error:", err?.message ?? err);

    // Give a user-friendly error without leaking internals
    const message =
      err?.message?.includes("API_KEY") || err?.message?.includes("not configured")
        ? "Gemini API key is missing or invalid. Please configure it properly."
        : err?.message?.includes("quota") || err?.message?.includes("RESOURCE_EXHAUSTED")
        ? "AI service quota exceeded. Please try again later."
        : "AI request failed. Please try again.";

    // Provide a fallback response if API fails
    return res.json({ text: `[Fallback Response] I am currently unable to process your request. ${message}` });
  }
});

export default router;
