import { NextRequest, NextResponse } from "next/server";

import type {
  Neo4jTemplateRunRequest,
  Neo4jTemplateRunResponse,
  Neo4jTemplateParamValue,
} from "@/lib/text2cypher/api/contracts/neo4j";
import { normalizeGraphQueryResult } from "@/lib/text2cypher/neo4j/query-results";
import { runCypherQuery } from "@/lib/text2cypher/neo4j/queries";
import { getActiveSchemaDefinition } from "@/lib/text2cypher/schema/active";
import {
  asNonNegativeInteger,
  buildPaginationQueries,
  resolvePipelinePagination,
} from "@/lib/text2cypher/services/pipeline-pagination";
import type { Neo4jVarType } from "@/lib/text2cypher/neo4j/types";

const coerceParamValue = (
  value: Neo4jTemplateParamValue,
  type: "text" | "number",
): Neo4jVarType => {
  if (type === "number") {
    if (typeof value === "number") {
      return value;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new Error("Invalid number parameter value.");
    }
    return parsed;
  }

  if (value === null) {
    return "";
  }

  return String(value);
};

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const activeSchema = getActiveSchemaDefinition();
    const { id } = await context.params;
    const template = activeSchema.templates.find((entry) => entry.id === id);

    if (!template) {
      return NextResponse.json(
        { message: `Template not found: ${id}` },
        { status: 404 },
      );
    }

    const body = (await req.json()) as Neo4jTemplateRunRequest;
    const inputParams = body.params ?? {};
    const pagination = resolvePipelinePagination({
      limit: body.limit,
      offset: body.offset,
    });

    const allowedParamNames = new Set(
      template.params.map((param) => param.name),
    );
    const unknownParamName = Object.keys(inputParams).find(
      (name) => !allowedParamNames.has(name),
    );

    if (unknownParamName) {
      return NextResponse.json(
        { message: `Unknown template parameter: ${unknownParamName}` },
        { status: 400 },
      );
    }

    const queryParams: Record<string, Neo4jVarType> = {};

    for (const param of template.params) {
      const rawValue = inputParams[param.name];
      if (rawValue === undefined) {
        continue;
      }

      queryParams[param.name] = coerceParamValue(rawValue, param.type);
    }

    const queries = buildPaginationQueries(template.query, pagination);

    const [rawResults, countRows] = await Promise.all([
      runCypherQuery<Record<string, unknown>>(queries.pagedCypher, queryParams),
      runCypherQuery<{ total_row_count?: unknown }>(
        queries.countCypher,
        queryParams,
      ),
    ]);

    const totalRowCount = asNonNegativeInteger(countRows[0]?.total_row_count);
    if (totalRowCount === null) {
      throw new Error("Failed to compute total row count for template query.");
    }

    const response = {
      templateId: template.id,
      cypher: queries.pagedCypher,
      params: queryParams,
      results: normalizeGraphQueryResult(rawResults),
      limit: pagination.limit,
      offset: pagination.offset,
      totalRowCount,
    } satisfies Neo4jTemplateRunResponse;

    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Invalid pagination:")) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }

    console.error("Error running template:", err);
    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
