import { NextRequest } from "next/server";
import { v4 } from "uuid";

import {
  RELATIONSHIP_TYPES,
  UNIQUE_PAIR_INCOMING_CONNECTIONS,
  UNIQUE_PAIR_OUTGOING_CONNECTIONS,
  UNIQUE_TO_GENERIC_REL,
} from "@/lib/neo4j/constants";
import { createConnectionPattern, parsePathwayTree } from "@/lib/neo4j/cypher";
import { executeReadOne, getDriver } from "@/lib/neo4j/driver";
import { Direction } from "@/lib/neo4j/enums";
import {
  EdgeConnection,
  NodeConnection,
  PathwayNode,
  TreeParseResult,
} from "@/lib/neo4j/types";
import { escapeCypherString } from "@/lib/neo4j/utils";

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
    treeParseResult = parsePathwayTree(tree);

    const addConnections = (node: PathwayNode, direction: Direction) => {
      const CONNECTIONS =
        direction === Direction.INCOMING
          ? UNIQUE_PAIR_INCOMING_CONNECTIONS
          : UNIQUE_PAIR_OUTGOING_CONNECTIONS;
      const filteredCnxns =
        direction === Direction.INCOMING
          ? treeParseResult.incomingCnxns
          : treeParseResult.outgoingCnxns;

      // Get all the ids which are used more than once across all patterns
      const relevantIdCounts = new Map<string, number>([
        ...Array.from(treeParseResult.nodeIds)
          .map(
            (nodeId) =>
              [
                nodeId,
                Math.max(
                  treeParseResult.patterns.join().split(nodeId).length - 1,
                  0
                ),
              ] as [string, number]
          )
          .filter(([_, count]) => count > 1),
      ]);

      const workingSet = new Set<string>();
      const queryStmts: string[] = [];
      let whereStmtIdx: number | undefined = undefined;
      treeParseResult.patterns.forEach((pattern) => {
        queryStmts.push(`MATCH ${pattern}`);

        if (whereStmtIdx === undefined && pattern.split(node.id).length > 1) {
          queryStmts.push("");
          whereStmtIdx = queryStmts.length - 1;
        }

        pattern
          .match(
            /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g
          )
          ?.forEach((matchedId) => {
            const currentCount = relevantIdCounts.get(matchedId);
            if (currentCount !== undefined) {
              const newCount = currentCount - 1;
              relevantIdCounts.set(matchedId, newCount);

              if (newCount > 0) {
                workingSet.add(matchedId);
              } else {
                workingSet.delete(matchedId);
              }
            }
          });

        if (workingSet.size > 0) {
          queryStmts.push(
            `WITH DISTINCT ${Array.from(workingSet)
              .map(escapeCypherString)
              .join(", ")}`
          );
        }
      });

      for (const [relationship, labels] of Array.from(
        CONNECTIONS.get(node.label)?.entries() || []
      )) {
        for (const label of labels) {
          // Skip this connection if it already exists for this node
          if (
            filteredCnxns
              .get(node.id)
              ?.get(
                // If the relationship is in the unique set map it to the general set, otherwise just use the general set
                UNIQUE_TO_GENERIC_REL.get(relationship) ||
                  (RELATIONSHIP_TYPES.has(relationship)
                    ? relationship
                    : "Unknown")
              )
              ?.includes(label)
          ) {
            continue;
          }

          const connectedNodeId = v4();
          const connectedEdgeId = v4();

          if (whereStmtIdx !== undefined) {
            queryStmts[whereStmtIdx] = `WHERE COUNT {${createConnectionPattern(
              node.id,
              direction,
              undefined,
              relationship
            )}} > 0`;
          }

          connectionQueries.push(
            [
              ...queryStmts,
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
      ...connectionQueries.map((q, i) =>
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
            UNIQUE_TO_GENERIC_REL.get(data.type) ||
            (RELATIONSHIP_TYPES.has(data.type) ? data.type : "Unknown"),
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
