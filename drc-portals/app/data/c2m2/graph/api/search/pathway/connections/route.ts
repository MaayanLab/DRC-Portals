import { NextRequest } from "next/server";
import { v4 } from "uuid";

import {
  UNIQUE_PAIR_INCOMING_CONNECTIONS,
  UNIQUE_PAIR_OUTGOING_CONNECTIONS,
  UNIQUE_TO_GENERIC_REL,
} from "@/lib/neo4j/constants";
import { createConnectionPattern } from "@/lib/neo4j/cypher";
import { executeReadOne, getDriver } from "@/lib/neo4j/driver";
import { Direction } from "@/lib/neo4j/enums";
import {
  EdgeConnection,
  NodeConnection,
  PathwayNode,
  TreeParseResult,
} from "@/lib/neo4j/types";
import { getOptimizedMatches, parsePathwayTree } from "@/lib/neo4j/utils";

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
  const body: { tree: string } = await request.json();
  let tree: PathwayNode;
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

    const addConnections = (node: PathwayNode, direction: Direction) => {
      const CONNECTIONS =
        direction === Direction.INCOMING
          ? UNIQUE_PAIR_INCOMING_CONNECTIONS
          : UNIQUE_PAIR_OUTGOING_CONNECTIONS;
      const filteredCnxns =
        direction === Direction.INCOMING
          ? treeParseResult.incomingCnxns
          : treeParseResult.outgoingCnxns;
      const queryStmts: string[] = getOptimizedMatches(
        treeParseResult,
        node.id
      );
      let whereCnxnIdx: number | undefined = undefined;

      // Find the first statement where node.id is present and save the index for later use
      queryStmts.forEach((stmt, idx) => {
        if (whereCnxnIdx === undefined && stmt.split(node.id).length > 1) {
          whereCnxnIdx = idx + 1;
        }
      });

      for (const [relationship, label] of Array.from(
        CONNECTIONS.get(node.label)?.entries() || []
      )) {
        // Skip this connection if it already exists for this node
        if (
          filteredCnxns
            .get(node.id)
            ?.get(UNIQUE_TO_GENERIC_REL.get(relationship) || "Unknown")
            ?.includes(label)
        ) {
          continue;
        }

        const queryStmtsCopy = [...queryStmts];
        if (whereCnxnIdx !== undefined) {
          const whereCnxnStmt = `WHERE COUNT {${createConnectionPattern(
            node.id,
            direction,
            undefined,
            relationship
          )}} > 0`;

          if (whereCnxnIdx === queryStmtsCopy.length) {
            queryStmtsCopy.push(whereCnxnStmt);
          } else {
            queryStmtsCopy.splice(whereCnxnIdx, 0, whereCnxnStmt);
          }
        }

        const connectedNodeId = v4();
        const connectedEdgeId = v4();
        connectionQueries.push(
          [
            ...queryStmtsCopy,
            "RETURN",
            `\t"${connectedNodeId}" AS nodeId, "${label}" AS label,`,
            `\t"${connectedEdgeId}" AS edgeId,`,
            `\t"${relationship}" AS type,`,
            `\t"${
              direction === Direction.INCOMING ? connectedNodeId : node.id
            }" AS source,`,
            `\t"${
              direction === Direction.INCOMING ? node.id : connectedNodeId
            }" AS target,`,
            `\t"${direction}" AS direction`,
            "LIMIT 1",
          ].join("\n")
        );
      }
    };

    for (const node of treeParseResult.nodes) {
      addConnections(node, Direction.OUTGOING);
      addConnections(node, Direction.INCOMING);
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
