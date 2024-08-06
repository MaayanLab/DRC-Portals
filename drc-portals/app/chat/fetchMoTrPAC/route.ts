import { NextRequest, NextResponse } from "next/server";

const ENDPOINT = 'https://search.motrpac-data.org/search/api';
export async function POST(req: NextRequest
) {
    const payload = await req.json();
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            'authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb3RycGFjX2RhdGFfaHViIiwiZXhwIjoxNzIzNzYzMjI0fQ.xkcA3NpHmenchUlFHTZ6_B_iBClSL-uhIdrelOpg0SA',
            'content-type': 'application/json',
            'origin': 'https://motrpac-data.org',
            'priority': 'u=1, i',
            'referer': 'https://motrpac-data.org/',
            'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
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


