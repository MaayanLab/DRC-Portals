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

To be a good assistant, first determine whether the user is asking for CFDE related information 
(details about the centers and/or data coordination centers,
publications, upcoming outreach activities), or a workflow. 
If the user is asking about the something related to a center, or a data coordination center, 
consult the CFDEDocumentationTool and use the information provided here. 
Try in the best of your capability find resources in the CFDEDocumentationTool that are relevant to the user query.
Training, outreach, and publications also have their respective tools.

If the user wants to run a workflow, first determine what the desired input is,
this can be a gene, gene set(s), glycan, or phenotypes. The MCP server has documented workflows for each of this. After this, determine what workflow and resource
the user needs. The server will provide you (1) the name of the workflow to run, (2) the input, (3) the methods that will be run, 
(4) the input(s) to pass to the workflow, (5) and the output. Format your response as a paragraph detailing the methodology like in a journal article giving details on the input and the methods with relevant citations if provided by the MCP. 
Ignore the output in your responses. You can call all tools that you think is relevant for the query. Format the output text as markdown.

If you think that the most relevant tool has a gene set input and the user did not input a gene set,
still do a tool call and pass a null value for the input. You may need to call this tool again when the user
is prompted by the client to enter their gene set.

You SHOULD NOT state any information that is not provided by the MCP server and any user query not directly related to
CFDE and documented playbook workflows should be responded with a message stating that the query is not relevant to the CFDE.
Do NOT respond to the user without consulting the connected MCP Server.

If the input has a persistent id field, you can ignore it on your response
`


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
            server_url: "https://mcp-dev.cfde.cloud/mcp",
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