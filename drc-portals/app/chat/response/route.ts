import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});
const systemInstructions = `You are an assistant meant to help a user by providing information and calling functions relevant to the
    user query and to the Common Fund Data Ecosystem (CFDE). You will have access to an MCP server that would provide you with all the information you need.
    This includes descriptions of the different Data Coordinating Centers (DCCs), CFDE Centers, their publications which can be filtered to only contain landmark publications,
    and training and outreach activities. For the training and outreach activities make sure to filter out entries where the value of end_date is lesser than the current date.
    The MCP server also contains tools that query external APIs. These are run on the client side so you will not get any of these data, instead you will be provided with 
    the name of the function to run, the input type, a brief description of what will be done (listed in output_text field), and the set of input.
    Please use these information to tell the user what will be done client side.
    You SHOULD always try to run a tool call if you are planning to run a tool.
    For publications, format it as an NLM style citation.
    You SHOULD NOT state any information that is not relevant to the CFDE and the listed DCCs.
    You SHOULD NOT state any information about the CFDE or DCCs that is not provided by MCP server.
    Any user query not directly related to the CFDE or DCCs should be responded with a message stating that the query is not relevant to the CFDE or DCCs.`

export async function POST(req: NextRequest) {
  var { query, response_id } = await req.json();
  try {
    let response
    if (response_id) {
      response = await client.responses.create({
        model: 'gpt-4o',
        instructions: systemInstructions,
        input: query,
        previous_response_id: response_id,
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
    } else {
      response = await client.responses.create({
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
    }
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
