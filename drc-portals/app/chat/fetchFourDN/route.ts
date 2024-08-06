
import { NextRequest, NextResponse } from "next/server";

var ENDPOINT = "https://data.4dnucleome.org/browse/?";
const headers = {
  "Accept": "application/json"
};

export async function POST(req: NextRequest
) {
    const payload = await req.json();
    let fragment = ''
    for(const key in payload){
      if (payload.hasOwnProperty(key)){
        if (Array.isArray(payload[key])){
          for(const value of payload[key]){
            fragment += key + "=" + encodeURIComponent(value) + "&";
          }
        } else {
          fragment += key + "=" + encodeURIComponent(payload[key]) + "&";
        }
      }
    }
    fragment = fragment.slice(0, -1);    
    console.log(fragment)
    try {
        const response = await fetch(ENDPOINT+fragment, {headers});
    
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




