import { NextRequest } from "next/server";

import { UNIQUE_TO_GENERIC_REL } from "@/lib/neo4j/constants";
import { executeReadOne, getDriver } from "@/lib/neo4j/driver";
import { Direction } from "@/lib/neo4j/enums";
import {
  EdgeConnection,
  NodeConnection,
  PathwayNode,
  TreeParseResult,
} from "@/lib/neo4j/types";
import { getConnectionQueries, parsePathwayTree } from "@/lib/neo4j/utils";

interface ConnectionQueryRecord {
  exists: boolean;
  nodeId: string;
  label: string;
  edgeId: string;
  type: string;
  source: string;
  target: string;
  direction: Direction;
}

// TODO: Would be awesome if we could somehow guarantee that the ids passed in for a given pathway will be exactly the same every time
// that pathway is sent in the request. This would allow us to leverage the Neo4j query cache much more effectively.
export async function POST(request: NextRequest) {
  const body: { tree: string; targetNodeIds: string[] } = await request.json();
  let tree: PathwayNode;
  const targetNodeIds = new Set<string>();
  let treeParseResult: TreeParseResult;
  const connectionQueries: string[] = [];

  if (body === null) {
    return Response.json(
      {
        error: "Request body is empty.",
      },
      { status: 400 }
    );
  }

  try {
    if (body.targetNodeIds === undefined) {
      return Response.json(
        {
          error: 'Request body missing required property "targetNodeIds"',
        },
        { status: 400 }
      );
    } else if (!Array.isArray(body.targetNodeIds)) {
      return Response.json(
        {
          error: `Property "nodeId" in request body had invalid type ${typeof body.targetNodeIds}. Must be "array".`,
        },
        { status: 400 }
      );
    } else {
      body.targetNodeIds.forEach((id) => targetNodeIds.add(id));
    }
  } catch (e) {
    return Response.json(
      {
        error: e,
        message: "An error occured during the search. Please try again later.",
      },
      { status: 400 }
    );
  }

  try {
    tree = JSON.parse(atob(body.tree));

    // TODO: Add a schema for the pathway search query object (see /search/path/route.ts for zod example usage)
  } catch (e) {
    // If for any reason (decoding, parsing, etc.) we couldn't get the path object, return a 400 response instead
    return Response.json(
      {
        error: e,
        message:
          'Failed to parse object provided by the "tree" parameter in request body.',
      },
      { status: 400 }
    );
  }

  try {
    treeParseResult = parsePathwayTree(tree, true);

    for (const node of treeParseResult.nodes) {
      if (targetNodeIds.has(node.id)) {
        connectionQueries.push(
          ...getConnectionQueries(treeParseResult, node, Direction.OUTGOING)
        );
        connectionQueries.push(
          ...getConnectionQueries(treeParseResult, node, Direction.INCOMING)
        );
      }
    }
  } catch (e) {
    return Response.json(
      {
        error: e,
        message: "An unknown error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }

  const connectedNodes: NodeConnection[] = [];
  const connectedEdges: EdgeConnection[] = [];
  try {
    const driver = getDriver();
    const [...connectionsResults] = await Promise.all([
      ...connectionQueries.map((q) =>
        executeReadOne<ConnectionQueryRecord>(driver, q)
      ),
    ]);

    // There should be only one row per query
    connectionsResults
      .filter((result) => result !== undefined) // Filter out unmatched connections
      .forEach((result) => {
        const data = result.toObject();
        connectedNodes.push({
          id: data.nodeId,
          label: data.label,
        });
        connectedEdges.push({
          id: data.edgeId,
          type:
            // If the relationship is in the unique set map it to the general set, otherwise just use the general set
            UNIQUE_TO_GENERIC_REL.get(data.type) || "Unknown",
          source: data.source,
          target: data.target,
          direction: data.direction,
        });
      });
    return Response.json(
      {
        connectedNodes,
        connectedEdges,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        message: "An error occured during the search. Please try again later.",
        error,
        params: {
          tree,
        },
      },
      { status: 500 }
    );
  }
}
