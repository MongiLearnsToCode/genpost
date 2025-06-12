
// NOTE: For this specific MVP, the Gemini API logic is directly within PostEditor.tsx
// to simplify the overall structure and reduce the number of files for the demonstration.
// This file is provided as an example of how a dedicated service might be structured.
// If you were to use this, you'd import it into PostEditor.tsx.

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';

const getApiKeyOrThrow = (): string => {
  // Attempt to get from a globally defined variable (e.g., set by an external script or build tool)
  if (typeof (window as any).GEMINI_API_KEY === 'string') {
    return (window as any).GEMINI_API_KEY;
  }
  
  // Fallback to process.env (useful if running in an environment where this is set, e.g. Node for testing or some bundlers)
  // For production browser deployment, this is unlikely to work without further setup.
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
     return process.env.API_KEY;
  }
  
  throw new Error("API Key not found. Please ensure GEMINI_API_KEY is configured either globally (window.GEMINI_API_KEY) or via process.env.API_KEY.");
};


export const generateCaptionsFromService = async (topic: string): Promise<string[]> => {
  const apiKey = getApiKeyOrThrow();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert social media copywriter. Generate 3 unique and engaging social media caption suggestions for a post about the following topic. Provide your output as a JSON array of strings. Topic: ${topic}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonStr = response.text.trim();
    // Remove markdown fences if present
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr);
    if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
      return parsedData;
    } else {
      console.error("AI response format error: expected array of strings, got:", parsedData);
      throw new Error("AI response was not in the expected format.");
    }
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    throw new Error(`Failed to generate captions: ${error.message}`);
  }
};
