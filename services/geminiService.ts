
"use client";

// This file provides the API service for Gemini AI integration
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME } from '@/constants';

const getApiKeyOrThrow = (): string => {
  // In Next.js, we use NEXT_PUBLIC_ prefix for client-side environment variables
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  }
  
  throw new Error("API Key not found. Please ensure NEXT_PUBLIC_GEMINI_API_KEY is configured in your .env.local file.");
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

    // Ensure response.text exists and handle null/undefined case
    let jsonStr = response.text?.trim() || "[]";
    
    // Remove markdown fences if present (without using 's' flag which requires es2018+)
    const fenceRegex = /^```(\w*)?\s*[\s\S]*?\s*```$/;
    const match = jsonStr.match(fenceRegex);
    if (match) {
      // Extract content between the backticks without using capture groups with 's' flag
      const startIndex = jsonStr.indexOf('\n', jsonStr.indexOf('```')) + 1;
      const endIndex = jsonStr.lastIndexOf('```');
      if (startIndex > 0 && endIndex > startIndex) {
        jsonStr = jsonStr.substring(startIndex, endIndex).trim();
      }
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
