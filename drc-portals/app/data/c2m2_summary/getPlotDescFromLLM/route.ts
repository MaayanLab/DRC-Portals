import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { yAxis, xAxis, groupBy } = await req.json();

    if (!yAxis || !xAxis || !groupBy) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const prompt = `Generate a concise description of a bar chart with the following parameters:
- Y-axis: ${yAxis}
- X-axis: ${xAxis}
- Group by: ${groupBy}
Describe what kind of data this chart shows and what insights it might reveal.`;

    const response = await ai.models.generateContent({
      model: 'models/gemini-1.5-flash', // <-- Use a supported model!
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
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 });
  }
}
