import express from "express";
import Groq from "groq-sdk";
import { env } from "../config/env.js";

const router = express.Router();

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = env.groqApiKey || process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not configured. Please add it to server/.env");
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
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

    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000
    });
    
    const text = completion.choices[0].message.content || "";

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
