import { NextRequest, NextResponse } from "next/server";

import type {
  Neo4jTemplateRunRequest,
  Neo4jTemplateRunResponse,
  Neo4jTemplateParamValue,
} from "@/lib/text2cypher/api/contracts/neo4j";
import { normalizeGraphQueryResult } from "@/lib/text2cypher/neo4j/query-results";
import { runCypherQuery } from "@/lib/text2cypher/neo4j/queries";
import { getActiveSchemaDefinition } from "@/lib/text2cypher/schema/active";
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

    const rawResults = await runCypherQuery<Record<string, unknown>>(
      template.query,
      queryParams,
    );

    const response = {
      templateId: template.id,
      results: normalizeGraphQueryResult(rawResults),
    } satisfies Neo4jTemplateRunResponse;

    return NextResponse.json(response);
  } catch (err) {
    console.error("Error running template:", err);
    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
