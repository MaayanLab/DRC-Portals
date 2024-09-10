import { NextRequest } from "next/server";

import { getExpandNodeCypher } from "@/lib/neo4j/cypher";
import { executeReadOne, getDriver } from "@/lib/neo4j/driver";
import { SubGraph } from "@/lib/neo4j/types";

const MAX_LIMIT = 1000;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const nodeId = searchParams.get("node_id");
  const hubLabel = searchParams.get("hub_label");
  const spokeLabel = searchParams.get("spoke_label");
  const direction = searchParams.get("direction");
  const relType = searchParams.get("rel_type");
  const limit = searchParams.get("limit");

  if (!hubLabel || !spokeLabel || !direction || !relType || !limit) {
    return Response.json(
      {
        error: "Missing required search parameters",
        message:
          "The request is missing one or more required search parameters: [node_label, direction, rel_type, limit].",
        missingParams: [
          hubLabel === null ? "hub_label" : null,
          spokeLabel === null ? "spoke_label" : null,
          direction === null ? "direction" : null,
          relType === null ? "rel_type" : null,
          limit === null ? "limit" : null,
        ].filter((x) => x !== null),
      },
      { status: 400 }
    );
  }

  if (!(1 <= Number(limit) && Number(limit) <= MAX_LIMIT)) {
    return Response.json(
      {
        error: "Invalid search parameter",
        message: "The 'limit' parameter must be between 1 and 1000.",
        limit,
      },
      { status: 400 }
    );
  }

  try {
    const result = await executeReadOne<SubGraph>(
      getDriver(),
      getExpandNodeCypher(hubLabel, spokeLabel, direction, relType),
      {
        nodeId,
        limit: Number(limit),
      }
    );
    return Response.json(result.toObject(), { status: 200 });
  } catch (error) {
    return Response.json(
      {
        message:
          "An error occurred trying to expand the node. Please try again later.",
        error,
        params: {
          nodeId,
          hubLabel,
          spokeLabel,
          direction,
          relType,
          limit,
        },
      },
      { status: 500 }
    );
  }
}
