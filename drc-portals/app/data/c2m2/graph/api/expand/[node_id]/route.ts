import { NextRequest } from "next/server";

import { getExpandNodeCypher } from "@/lib/neo4j/cypher";
import { executeReadOne, getDriver } from "@/lib/neo4j/driver";
import { SubGraph } from "@/lib/neo4j/interfaces";

export async function GET(
  request: NextRequest,
  { params }: { params: { node_id: string } }
) {
  const searchParams = request.nextUrl.searchParams;
  const nodeLabel = searchParams.get("node_label");
  const direction = searchParams.get("direction");
  const relType = searchParams.get("rel_type");
  const limit = searchParams.get("limit");

  if (!nodeLabel || !direction || !relType) {
    return Response.json(
      {
        error: "Missing required search parameters",
        message:
          "The request is missing one or more required search parameters: [node_label, direction, rel_type, limit].",
        missingParams: [
          nodeLabel === null ? "node_label" : null,
          direction === null ? "direction" : null,
          relType === null ? "rel_type" : null,
          limit === null ? "limit" : null,
        ].filter((x) => x !== null),
      },
      { status: 400 }
    );
  }

  try {
    const result = await executeReadOne<SubGraph>(
      getDriver(),
      getExpandNodeCypher(nodeLabel, direction, relType),
      {
        nodeId: Number(params.node_id),
        limit: Number(limit),
      }
    );
    return Response.json(result.toObject(), { status: 200 });
  } catch (error) {
    return Response.json(
      {
        message:
          "An error occured trying to expand the node. Please try again later.",
        error,
        params: {
          nodeId: params.node_id,
          nodeLabel,
          direction,
          relType,
          limit,
        },
      },
      { status: 500 }
    );
  }
}
