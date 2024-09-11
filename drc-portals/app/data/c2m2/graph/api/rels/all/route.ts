import { NextRequest } from "next/server";

import {
  getIncomingRelsCypher,
  getOutgoingRelsCypher,
} from "@/lib/neo4j/cypher";
import { executeRead, getDriver } from "@/lib/neo4j/driver";
import {
  NodeIncomingRelsResult,
  NodeOutgoingRelsResult,
} from "@/lib/neo4j/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const nodeId = searchParams.get("node_id");
  const hubLabel = searchParams.get("hub_label");

  if (!hubLabel) {
    return Response.json(
      {
        error: "Missing required search parameters",
        message:
          "The request is missing one or more required search parameters: [node_label, direction, rel_type, limit].",
        missingParams: [hubLabel === null ? "hub_label" : null].filter(
          (x) => x !== null
        ),
      },
      { status: 400 }
    );
  }

  try {
    const outgoingResults = await executeRead<NodeOutgoingRelsResult>(
      getDriver(),
      getOutgoingRelsCypher(hubLabel),
      { nodeId }
    );
    const incomingResults = await executeRead<NodeIncomingRelsResult>(
      getDriver(),
      getIncomingRelsCypher(hubLabel),
      { nodeId }
    );
    return Response.json(
      {
        outgoing: outgoingResults.map((record) => record.toObject()),
        incoming: incomingResults.map((record) => record.toObject()),
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        message:
          "An error occurred trying to find all relationships of the node. Please try again later.",
        error,
        params: {
          nodeId,
        },
      },
      { status: 500 }
    );
  }
}
