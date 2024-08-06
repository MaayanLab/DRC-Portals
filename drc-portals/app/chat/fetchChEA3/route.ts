
import { NextRequest, NextResponse } from "next/server";

const ENDPOINT = 'https://maayanlab.cloud/chea3/api/enrich/';

export async function POST(req: NextRequest
) {
    const payload = await req.json();

    try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return new NextResponse(
            JSON.stringify({'data': data}), {
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




