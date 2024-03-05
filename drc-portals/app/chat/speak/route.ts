
import { NextRequest, NextResponse } from "next/server";

const ENDPOINT = 'https://api.openai.com/v1/audio/speech';

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify(data),
        })
        const voice = await res.blob()
        return new NextResponse(
            voice, {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.log(error)
        return new NextResponse(JSON.stringify({
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });

    }
}




