import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL_NAME } from '@/constants';

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();
    
    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert social media copywriter. Generate 3 unique and engaging social media caption suggestions for a post about the following topic. Provide your output as a JSON array of strings. Topic: ${topic}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    // Safely handle the response
    let jsonStr = response.text?.trim() || "[]";
    
    // Extract content between markdown fences if present
    if (jsonStr.includes('```')) {
      const startIndex = jsonStr.indexOf('\n', jsonStr.indexOf('```')) + 1;
      const endIndex = jsonStr.lastIndexOf('```');
      if (startIndex > 0 && endIndex > startIndex) {
        jsonStr = jsonStr.substring(startIndex, endIndex).trim();
      }
    }

    try {
      const parsedData = JSON.parse(jsonStr);
      if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
        return NextResponse.json({ captions: parsedData });
      } else {
        return NextResponse.json(
          { error: "AI response was not in the expected format" }, 
          { status: 500 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Error generating captions:", error);
    return NextResponse.json(
      { error: `Failed to generate captions: ${error.message}` },
      { status: 500 }
    );
  }
}
