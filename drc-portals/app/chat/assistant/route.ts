import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

export async function POST(req: NextRequest) {
  var { query, threadId } = await req.json();

  try {
    if (!threadId) {
      const thread = await client.beta.threads.create();
      threadId = thread.id;
    }

    await client.beta.threads.messages.create(threadId, {
      role: "user",
      content: query,
    });

    var run = await client.beta.threads.runs.create(threadId, {
      assistant_id: process.env["ASSISTANT_ID"] || "",
    });
    const runId = run.id;
    while (run.status == "queued" || run.status == "in_progress") {
      run = await client.beta.threads.runs.retrieve(threadId, runId);
      await new Promise<void>((resolve, reject) => {setTimeout(() => {resolve()}, 1000)})
    }
    const messages = await client.beta.threads.messages.list(threadId);
    if (run.status == "failed") {
        return new NextResponse(
            JSON.stringify({
              error: "There was an issue communicating with the OpenAI API. Please try again later.",
              threadId: threadId,
              messages: messages.data,
              functionCall: null
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
    } else if (run.status == "requires_action") {
        if ((run.required_action?.submit_tool_outputs.tool_calls.length ?? 0) > 0) {
            const toolCallId = run.required_action?.submit_tool_outputs.tool_calls?.[0]?.id ?? "";
            const toolCallName = run.required_action?.submit_tool_outputs.tool_calls?.[0]?.function.name ?? "";
        
            await client.beta.threads.runs.submitToolOutputs(
                threadId,
                runId,
                {
                tool_outputs: [
                    {
                    tool_call_id: toolCallId,
                    output: `${toolCallName} result was returned to the user.`,
                    }
                ],
                }
            );
        }

        return new NextResponse(
            JSON.stringify({
              messages: messages.data,
              threadId: threadId,
              functionCall: run.required_action,
              error: null
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );

    } else if (run.status == "completed") {

      run = await client.beta.threads.runs.retrieve(threadId, runId);

      const messages = await client.beta.threads.messages.list(threadId);

      return new NextResponse(
        JSON.stringify({
          messages: messages.data,
          threadId: threadId,
          error: null,
          functionCall: null
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  else {
    return new NextResponse(
      JSON.stringify({
        error: "There was an issue communicating with the OpenAI API. Please try again later.",
        threadId: threadId,
        messages: messages.data,
        functionCall: null
      }),
      {
        status: 200,
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
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
