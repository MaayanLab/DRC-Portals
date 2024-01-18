
import { NextRequest, NextResponse } from "next/server";

const ENDPOINT = 'https://playbook-workflow-builder.cloud';

export async function POST(req: NextRequest
) {
    try {
        const data = await req.json();

        const res = await fetch(ENDPOINT + '/api/db/fpl', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        const id = await res.json()
        const resOutput = await fetch(ENDPOINT + '/api/db/fpl/' + id + '/output')
 
        const output = await resOutput.json() 

        return new NextResponse(
            JSON.stringify({'data': output, 'id': id}), {
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




