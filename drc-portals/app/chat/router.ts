import { procedure, router } from '@/lib/trpc'
import { z } from 'zod'
import EventEmitter, { on } from 'node:events';
import { tracked } from '@trpc/server';
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

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


export default router({
  chat: procedure
    .input(
      z.object({
        // lastEventId is the last event id that the client has received
        // On the first call, it will be whatever was passed in the initial setup
        // If the client reconnects, it will be the last event id that the client received
        // The id is the createdAt of the post
        query: z.string(),
		response_id: z.string().optional(),
      }),
    )
    .subscription(async function* (props) {
      // `props.signal` is an AbortSignal that will be aborted when the client disconnects.
      const {query, response_id} = props.input
	  const opts = response_id ? {previous_response_id: response_id}: {}
	  const stream = await client.responses.create({
        model: 'gpt-5',
        instructions: systemInstructions,
        input: query,
		stream: true,
        ...opts,
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
	  for await (const event of stream) {
		if(props.signal!.aborted) return
		const event_type = event.type
		yield tracked(JSON.stringify(event), event);
	  }
	  return
    }),
});