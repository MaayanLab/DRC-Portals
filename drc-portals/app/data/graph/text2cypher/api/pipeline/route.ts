import { NextRequest, NextResponse } from "next/server";

import {
  PipelineRequest,
  PipelineResponse,
} from "@/lib/text2cypher/api/contracts/pipeline";
import { parseQueryRowsResult } from "@/lib/text2cypher/neo4j/query-results";
import { runPipeline } from "@/lib/text2cypher/services/pipeline";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) satisfies PipelineRequest;
    const { question, limit, offset } = body;

    const result = await runPipeline(question, {
      limit,
      offset,
    });

    let parsedResults: Record<string, unknown>[] | null = null;
    let parserError: string | null = null;

    if (result.success) {
      if (typeof result.results !== "string" || !result.results.trim()) {
        parserError = "Pipeline did not return query results.";
      } else {
        try {
          const parsed = JSON.parse(result.results) as unknown;
          if (Array.isArray(parsed)) {
            parsedResults = parsed as Record<string, unknown>[];
          } else {
            parserError = "Pipeline returned invalid query results.";
          }
        } catch {
          parserError = "Pipeline returned invalid query results.";
        }
      }
    }

    const parsed =
      result.success && parserError === null && parsedResults !== null
        ? parseQueryRowsResult(parsedResults)
        : {
            rows: null,
            error: null,
          };

    const error = result.error || parserError || parsed.error || null;

    const response = {
      success: result.success,
      cypher: result.cypher,
      params: result.params,
      error,
      rows: error ? null : parsed.rows,
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
