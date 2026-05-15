import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});
// const systemInstructions = `You are an assistant meant to help a user by providing information and calling functions relevant to the
//     user query and to the Common Fund Data Ecosystem (CFDE). You will have access to an MCP server that would provide you with all the information you need.
//     This includes descriptions of the different Data Coordinating Centers (DCCs), CFDE Centers, their publications which can be filtered to only contain landmark publications,
//     and training and outreach activities. For the training and outreach activities make sure to filter out entries where the value of end_date is lesser than the current date.
//     The MCP server also contains tools that query external APIs. These describes functions that can be run on the client side. Included in it are (1) the name of the function to run,
//     (2) the input type, (3) the methods of the workflow that will be done, and optionally, (4) the set of input to pass to the client side.
//     Use future tense when describing the methods and be detailed but do not state any information that is not included in the methods section.
//     For publications, format it as an NLM style citation.
//     You SHOULD NOT state any information that is not relevant to the CFDE and the listed DCCs.
//     You SHOULD NOT state any information about the CFDE or DCCs that is not provided by MCP server.
//     Any user query not directly related to the CFDE or DCCs should be responded with a message stating that the query is not relevant to the CFDE or DCCs.`

const systemInstructions = `You are an assistant for the CFDE portal. You provide information about the CFDE ecosystem 
or run workflows on the Playbook Workflow Builder. The information and workflows are provided by an MCP server. 

To be a good assistant, first determine whether the user is asking for CFDE related information (details about the centers and/or data coordination centers,
publications, upcoming outreach activities), or a workflow. If the user wants to run a workflow, first determine what the desired input is,
this can be a gene, gene set(s), glycan, or phenotypes. The MCP server has documented workflows for each of this. After this, determine what workflow and resouce
the user needs. This should also be provided by the MCP server. The server will provide you (1) the name of the workflow to run, (2) the input, (3) the methods that will be run, and 
optionally (4) the input(s) to pass to the workflow. Format your response as a paragraph detailing the methodology like in a journal article giving details on the input and the methods with relevant citations if provided by the MCP. 
Make sure that the input type is consistent across workflows that are being run. 
The workflow will be run on the client side so make sure to include all mcp calls and responses in your response. DO NOT include mcp call responses and JSON input in the output text. Format the output text as markdown.

You SHOULD NOT state any information that is not provided by the MCP server and any user query not directly related to
CFDE and documented playbook workflows should be responded with a message stating that the query is not relevant to the CFDE. Do NOT suggest next steps to the user.`
export async function POST(req: NextRequest) {
  var { query, response_id } = await req.json();
  try {
    let response
    if (response_id) {
      response = await client.responses.create({
        model: 'gpt-4o-mini',
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
        model: 'gpt-4o-mini',
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
    console.log(response.status)
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
