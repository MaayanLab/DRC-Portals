import { NextRequest, NextResponse } from "next/server";

import type {
  Neo4jExpandNodeRequest,
  Neo4jExpandNodeResponse,
} from "@/lib/text2cypher/api/contracts/neo4j";
import { normalizeGraphQueryResult } from "@/lib/text2cypher/neo4j/query-results";
import { runCypherQuery } from "@/lib/text2cypher/neo4j/queries";

const DEFAULT_EXPAND_DEPTH = 1;
const MAX_EXPAND_DEPTH = 5;

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const parseDepth = (value: unknown): number | null => {
  if (value === undefined || value === null) {
    return DEFAULT_EXPAND_DEPTH;
  }

  const depth = Number(value);
  if (!Number.isInteger(depth)) {
    return null;
  }

  if (depth < 1 || depth > MAX_EXPAND_DEPTH) {
    return null;
  }

  return depth;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<Neo4jExpandNodeRequest>;

    const nodeUuid = asNonEmptyString(body.nodeUuid);
    if (!nodeUuid) {
      return NextResponse.json(
        { message: "nodeUuid is required." },
        { status: 400 },
      );
    }

    const nodeLabel = asNonEmptyString(body.nodeLabel);
    if (!nodeLabel) {
      return NextResponse.json(
        { message: "nodeLabel is required." },
        { status: 400 },
      );
    }

    const depth = parseDepth(body.depth);
    if (depth === null) {
      return NextResponse.json(
        {
          message: `depth must be an integer between 1 and ${MAX_EXPAND_DEPTH}.`,
        },
        { status: 400 },
      );
    }

    const rawResults = await runCypherQuery<Record<string, unknown>>(
      `
      MATCH (seed:${nodeLabel} {_uuid: $nodeUuid})
      OPTIONAL MATCH path = (seed)-[*1..${depth}]-(neighbor)
      WITH seed, collect(DISTINCT neighbor) AS neighbors, collect(path) AS paths
      CALL {
        WITH paths
        UNWIND paths AS candidatePath
        WITH candidatePath
        WHERE candidatePath IS NOT NULL
        UNWIND relationships(candidatePath) AS rel
        RETURN collect(DISTINCT rel) AS edges
      }
      RETURN [seed] + neighbors AS nodes, edges
      `,
      {
        nodeUuid,
      },
    );

    if (rawResults.length === 0) {
      return NextResponse.json(
        { message: `Node not found for _uuid: ${nodeUuid}` },
        { status: 404 },
      );
    }

    const response = {
      nodeUuid,
      nodeLabel,
      depth,
      results: normalizeGraphQueryResult(rawResults),
    } satisfies Neo4jExpandNodeResponse;

    return NextResponse.json(response);
  } catch (err) {
    console.error("Error expanding node neighbors:", err);

    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
