import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});
const systemInstructions = `You are an assistant meant to help a user by providing information and calling functions relevant to the
    user query and to the Common Fund Data Ecosystem (CFDE). You will have access to a file with descriptions of the Data Coordinating Centers (DCCs) and their relevant data.
    Additionally you will be provided with a list of functions that be called to process specific types of data such as Gene, Gene Set, Metabolite, Glycan etc...
    You SHOULD NOT state any information that is not relevant to the CFDE and the listed DCCs.
    You SHOULD NOT state any information about the CFDE or DCCs that is not present in the provided file.
    Any user query not directly related to the CFDE or DCCs should be responded with a message stating that the query is not relevant to the CFDE or DCCs.`

export async function POST(req: NextRequest) {
  var { query } = await req.json();
  try {
    
    const response = await client.responses.create({
      model: 'gpt-4o',
      instructions: systemInstructions,
      input: query,
      tools: [
        {
          type: "mcp",
          server_label: "cfde-mcp",
          server_description: "MCP Server For CFDE Portal",
          server_url: "https://mcp.cfde.cloud/mcp",
          require_approval: "never",
          authorization: process.env.MCP_API_KEY,
        },
      ]
    });
    if (response.status === "completed") {
      return new NextResponse(
        JSON.stringify(response),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      return new NextResponse(
        JSON.stringify({
          error:
            "There was an error when calling the OpenAI assistants API",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (e) {
    return new NextResponse(
      JSON.stringify({
        error:
          "There was an error when calling the OpenAI assistants API: " + e,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
