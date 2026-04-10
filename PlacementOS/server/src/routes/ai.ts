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
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return res.json({ text });
  } catch (err: any) {
    console.error("[AI Route] Error:", err?.message ?? err);

    const isRateLimit =
      err?.status === 429 ||
      err?.message?.includes("429") ||
      err?.message?.includes("RESOURCE_EXHAUSTED") ||
      err?.message?.includes("quota");

    let message = "🔧 Something went wrong. Please try again in a moment.";
    if (isRateLimit) {
      message = "⏳ AI service is currently busy. Please wait a moment and try again.";
    }

    return res.json({ text: message });
  }
});

export default router;
