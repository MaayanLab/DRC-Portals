
import { NextRequest, NextResponse } from "next/server";

const ENDPOINT = 'https://api.openai.com/v1/audio/transcriptions';

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();

        const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: data,
        })
        if (res.ok) {
            const transcription = await res.json();
            return new NextResponse(
              JSON.stringify(transcription), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              });
          } else {
            // Handle error here, log or throw an appropriate exception
            console.error('OpenAI API request failed:', res.status, await res.text());
            return new NextResponse(JSON.stringify('OpenAI API request failed'), {
                status: res.status,
                headers: { "Content-Type": "application/json" },
              });
          }
    } catch (error) {
        console.log(error)
        return new NextResponse(JSON.stringify({
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });

    }
}




