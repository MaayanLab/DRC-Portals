import { NextRequest, NextResponse } from "next/server";

import type {
  PipelineRepaginateRequest,
  PipelineRepaginateResponse,
} from "@/lib/text2cypher/api/contracts/pipeline";
import { normalizeGraphQueryResult } from "@/lib/text2cypher/neo4j/query-results";
import { runCypherQuery } from "@/lib/text2cypher/neo4j/queries";
import {
  asNonNegativeInteger,
  buildPaginationQueries,
  resolvePipelinePagination,
  toNeo4jParams,
} from "@/lib/text2cypher/services/pipeline-pagination";

const isClientValidationError = (message: string) => {
  return (
    message.startsWith("Invalid pagination:") ||
    message.startsWith("Unsupported query shape for pagination:") ||
    message.startsWith("Invalid repagination request:")
  );
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PipelineRepaginateRequest;

    if (typeof body.cypher !== "string" || body.cypher.trim().length === 0) {
      throw new Error("Invalid repagination request: cypher is required.");
    }

    const pagination = resolvePipelinePagination({
      limit: body.limit,
      offset: body.offset,
    });

    const params = toNeo4jParams(body.params);
    const queries = buildPaginationQueries(body.cypher, pagination);

    const [pageRows, countRows] = await Promise.all([
      runCypherQuery<Record<string, unknown>>(queries.pagedCypher, params),
      runCypherQuery<{ total_row_count?: unknown }>(
        queries.countCypher,
        params,
      ),
    ]);

    const totalRowCount = asNonNegativeInteger(countRows[0]?.total_row_count);
    if (totalRowCount === null) {
      throw new Error("Failed to compute total row count for paginated query.");
    }

    const response = {
      success: true,
      cypher: queries.pagedCypher,
      params,
      results: normalizeGraphQueryResult(pageRows),
      limit: pagination.limit,
      offset: pagination.offset,
      totalRowCount,
    } satisfies PipelineRepaginateResponse;

    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof Error && isClientValidationError(err.message)) {
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
