import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  console.log("In getPlotDescFromLLM");
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'models/gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json({ error: 'No description returned from Gemini.' }, { status: 500 });
    }

    return NextResponse.json({ description: text.trim() });
  } catch (error: any) {
    // Gracefully handle Gemini 503 'model overloaded' errors
    const errorMsg = error?.error?.message || error?.message || '';
    if (
      error?.error?.code === 503 ||
      errorMsg.includes('The model is overloaded') ||
      errorMsg.includes('503')
    ) {
      return NextResponse.json(
        {
          error: 'Gemini is temporarily overloaded. Please try again in a few moments.'
        },
        { status: 503 }
      );
    }

    // Log and handle unexpected errors
    console.error('Gemini API error:', error);
    return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 });
  }
}
