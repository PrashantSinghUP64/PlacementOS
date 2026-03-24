// ============================================
// PUTER.JS AI HELPER — USE THIS IN ALL FEATURES
// ============================================

// Main function to call Puter.js AI
export async function callAI(prompt: string): Promise<string> {
  try {
    // Wait for puter to load
    if (!(window as any).puter?.ai?.chat) {
      // Basic polling if puter is not immediately available
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if ((window as any).puter?.ai?.chat) break;
      }
    }
    
    if (!(window as any).puter?.ai?.chat) {
      throw new Error("Puter.js AI is not available");
    }
    
    const response = await (window as any).puter.ai.chat(prompt);
    
    // Handle ALL possible response formats from Puter.js
    if (typeof response === 'string') {
      return response;
    }
    
    if (response?.message?.content) {
      const content = response.message.content;
      if (Array.isArray(content)) {
        return content.map((c: any) => c.text || c.content || '').join('');
      }
      return String(content);
    }
    
    if (response?.choices?.[0]?.message?.content) {
      return response.choices[0].message.content;
    }
    
    if (response?.text) return response.text;
    if (response?.content) return String(response.content);
    if (response?.result) return String(response.result);
    
    // Last resort
    return JSON.stringify(response);
    
  } catch (error: any) {
    console.error('AI Error:', error);
    throw new Error('AI call failed: ' + error.message);
  }
}

// Parse JSON from AI response safely
export function parseAIJSON(text: string): any {
  try {
    // Remove markdown code blocks if present
    let cleaned = text
      .replace(/```json\n?/ig, '')
      .replace(/```\n?/g, '')
      .trim();
    
    // Find JSON object or array
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('JSON parse failed, raw text:', text, err);
    return null;
  }
}

// Call AI and get JSON response
export async function callAIForJSON(prompt: string): Promise<any> {
  const text = await callAI(prompt);
  const parsed = parseAIJSON(text);
  if (!parsed) {
    throw new Error('Could not parse AI response as JSON');
  }
  return parsed;
}
