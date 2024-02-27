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
      setTimeout(() => {}, 1000);
    }

    run = await client.beta.threads.runs.retrieve(threadId, runId);

    const messages = await client.beta.threads.messages.list(threadId);

    return new NextResponse(
        JSON.stringify({
          messages: messages,
          threadId: threadId
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
    );
  } catch {
    return new NextResponse(
      JSON.stringify({
        error:
          "There was an issue comminicating with the OpenAI API. Please try again later.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
