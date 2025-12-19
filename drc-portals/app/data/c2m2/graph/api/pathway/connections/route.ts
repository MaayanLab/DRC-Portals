import { Session } from "neo4j-driver";
import { NextRequest } from "next/server";

import { UNIQUE_TO_GENERIC_REL } from "@/lib/neo4j/constants";
import {
  closeSession,
  getDriver,
  getSession,
  sessionExecuteReadOne,
} from "@/lib/neo4j/driver";
import { Direction } from "@/lib/neo4j/enums";
import {
  EdgeConnection,
  NodeConnection,
  PathwayNode,
  TreeParseResult,
} from "@/lib/neo4j/types";
import {
  getSingleMatchConnectionQuery,
  parsePathwayTree,
} from "@/lib/neo4j/utils";

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
  const zippedQueries: string[][] = [];
  let treeParseResult: TreeParseResult;

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
        message: "An error occurred during the search. Please try again later.",
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

  let connectionQueryParams: { [key: string]: string } = {};
  try {
    treeParseResult = parsePathwayTree(tree, true);

    for (let i = 0; i < treeParseResult.nodes.length; i++) {
      const node = treeParseResult.nodes[i];
      if (targetNodeIds.has(node.id)) {
        const nodeIdParam = `nodeIdParam${i + 1}`;
        zippedQueries.push([
          getSingleMatchConnectionQuery(
            treeParseResult,
            node,
            nodeIdParam,
            false
          ),
          getSingleMatchConnectionQuery(
            treeParseResult,
            node,
            nodeIdParam,
            true
          ),
        ]);
        connectionQueryParams = {
          ...Object.fromEntries([[nodeIdParam, node.id]]),
          ...connectionQueryParams,
        };
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
      ...zippedQueries.map((queries) => {
        const querySessions: [string, Session][] = queries.map((query) => [
          query,
          getSession(driver),
        ]);
        return Promise.race(
          querySessions.map(([query, session]) =>
            sessionExecuteReadOne<{ result: ConnectionQueryRecord[] }>(
              session,
              query,
              connectionQueryParams
            )
          )
        )
          .then((result) => result)
          .finally(() => {
            // Regardless of which query finishes first, close all sessions
            querySessions.forEach(([_, session]) => closeSession(session));
          });
      }),
    ]);

    // There should be only one row per query
    connectionsResults
      .filter((result) => result !== undefined) // Filter out unmatched connections
      .forEach((result) => {
        const data = result.toObject();
        data.result
          .filter((connection) => connection.exists)
          .forEach((connection) => {
            connectedNodes.push({
              id: connection.nodeId,
              label: connection.label,
            });
            connectedEdges.push({
              id: connection.edgeId,
              type:
                // If the relationship is in the unique set map it to the general set, otherwise just use the general set
                UNIQUE_TO_GENERIC_REL.get(connection.type) || "Unknown",
              source: connection.source,
              target: connection.target,
              direction: connection.direction,
            });
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
        message: "An error occurred during the search. Please try again later.",
        error,
        params: {
          tree,
        },
      },
      { status: 500 }
    );
  }
}
