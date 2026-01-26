import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import singleton from '@/lib/singleton';

const ai = singleton('gemini-ai-client',  () => {
  try {
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  } catch (e) {
    return
  }
});

export async function POST(req: NextRequest) {
  console.log("In getPlotDescFromLLM");
  if (!ai) return NextResponse.json({ error: 'Gemini access is not currently available.' }, { status: 500 });
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'models/gemini-2.5-flash',
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
