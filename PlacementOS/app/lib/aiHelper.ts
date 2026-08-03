// ================================================
// GROQ AI HELPER — Centralized backend AI calls
// ================================================
import { getApiBase } from "./api";
import { getMockFallback } from "./mockData";

/**
 * Send a prompt to the backend Groq AI endpoint.
 * Replaces all previous window.puter.ai.chat calls.
 */
export async function callAI(prompt: string, fallbackText?: string): Promise<string> {
  try {
    const res = await fetch(`${getApiBase()}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });

    if (!res.ok) {
      let errMsg = `AI request failed with status ${res.status}`;
      try {
        const body = await res.json();
        errMsg = body.error ?? errMsg;
      } catch {}
      console.error(errMsg);
      throw new Error(errMsg);
    }

    const data = await res.json();
    if (!data.text) throw new Error("Empty response from AI");
    
    // The backend sometimes returns this string on a 200 OK when rate limited.
    // We throw it so the try/catch in individual routes can use their custom fallback logic.
    if (data.text.includes("Something went wrong") || data.text.includes("service is currently busy")) {
      throw new Error("AI service unavailable (Rate Limited or Error)");
    }
    
    return data.text as string;
  } catch (error: any) {
    console.error(error);
    if (fallbackText) {
      console.warn(`AI failed, using fallback text: ${fallbackText}`);
      return fallbackText;
    }
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
export async function callAIForJSON(prompt: string, fallbackType?: string): Promise<any> {
  try {
    const text = await callAI(prompt);
    
    // Check for standard error messages from backend
    if (text.includes("service is currently busy") || text.includes("Something went wrong")) {
      if (fallbackType) return getMockFallback(fallbackType);
      throw new Error("AI service unavailable.");
    }
    
    const parsed = parseAIJSON(text);
    if (!parsed) {
      if (fallbackType) return getMockFallback(fallbackType);
      throw new Error("Could not parse AI response as JSON");
    }
    return parsed;
  } catch (err) {
    if (fallbackType) {
      console.warn(`AI failed, using fallback for ${fallbackType}`, err);
      return getMockFallback(fallbackType);
    }
    throw err;
  }
}

