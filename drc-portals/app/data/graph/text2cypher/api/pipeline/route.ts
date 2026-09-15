import { NextRequest, NextResponse } from "next/server";

import {
  PipelineRequest,
  PipelineResponse,
} from "@/lib/text2cypher/api/contracts/pipeline";
import { normalizeGraphQueryResult } from "@/lib/text2cypher/neo4j/query-results";
import { runPipeline } from "@/lib/text2cypher/services/pipeline";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) satisfies PipelineRequest;
    const { question, limit, offset } = body;

    const result = await runPipeline(question, {
      limit,
      offset,
    });

    let parsedResults: Record<string, unknown>[] = [];
    if (typeof result.results === "string" && result.results.trim()) {
      try {
        const parsed = JSON.parse(result.results) as unknown;
        if (Array.isArray(parsed)) {
          parsedResults = parsed as Record<string, unknown>[];
        }
      } catch {
        parsedResults = [];
      }
    }

    const response = {
      success: result.success,
      cypher: result.cypher,
      params: result.params,
      error: result.error,
      results: normalizeGraphQueryResult(parsedResults),
      limit: result.limit,
      offset: result.offset,
      totalRowCount: result.totalRowCount,
    } satisfies PipelineResponse;

    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Invalid pagination:")) {
      return NextResponse.json(
        {
          message: err.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
