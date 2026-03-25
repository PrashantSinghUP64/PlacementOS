// ================================================
// GEMINI AI HELPER — Centralized backend AI calls
// ================================================
import { getApiBase } from "./api";

/**
 * Send a prompt to the backend Gemini AI endpoint.
 * Replaces all previous window.puter.ai.chat calls.
 */
export async function callAI(prompt: string): Promise<string> {
  try {
    const res = await fetch(`${getApiBase()}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      let errMsg = "AI request failed";
      try {
        const body = await res.json();
        errMsg = body.error ?? errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    const data = await res.json();
    if (!data.text) throw new Error("Empty response from AI");
    return data.text as string;
  } catch (error: any) {
    console.error("AI Error:", error);
    throw new Error("AI call failed: " + (error.message ?? "Unknown error"));
  }
}

// Parse JSON from AI response safely
export function parseAIJSON(text: string): any {
  try {
    // Remove markdown code blocks if present
    let cleaned = text
      .replace(/```json\n?/ig, "")
      .replace(/```\n?/g, "")
      .trim();

    // Find JSON object or array
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON parse failed, raw text:", text, err);
    return null;
  }
}

// Call AI and get JSON response
export async function callAIForJSON(prompt: string): Promise<any> {
  const text = await callAI(prompt);
  const parsed = parseAIJSON(text);
  if (!parsed) {
    throw new Error("Could not parse AI response as JSON");
  }
  return parsed;
}

