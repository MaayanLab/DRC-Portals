import { NextRequest } from "next/server";
import { v4 } from "uuid";

import {
  INCOMING_CONNECTIONS,
  OUTGOING_CONNECTIONS,
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

interface CountsQueryRecord {
  counts: {
    [key: string]: number;
  };
}

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
  let pathwayElementsCountQuery: string;
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
          ? INCOMING_CONNECTIONS
          : OUTGOING_CONNECTIONS;
      const filteredCnxns =
        direction === Direction.INCOMING
          ? treeParseResult.incomingCnxns
          : treeParseResult.outgoingCnxns;
      for (const [relationship, labels] of Array.from(
        CONNECTIONS.get(node.label)?.entries() || []
      )) {
        for (const label of labels) {
          // Skip this connection if it already exists for this node
          if (filteredCnxns.get(node.id)?.get(relationship)?.includes(label)) {
            continue;
          }

          const connectedNodeId = v4();
          const connectedEdgeId = v4();

          connectionQueries.push(
            `RETURN
              EXISTS {
                ${[
                  ...treeParseResult.patterns,
                  createConnectionPattern(
                    node.id,
                    label,
                    relationship,
                    direction
                  ),
                ].join(",\n\t")}
              } AS exists,
              "${connectedNodeId}" AS nodeId,
              "${label}" AS label,
              "${connectedEdgeId}" AS edgeId,
              "${relationship}" AS type,
              "${
                direction === Direction.INCOMING ? connectedNodeId : node.id
              }" AS source,
              "${
                direction === Direction.INCOMING ? node.id : connectedNodeId
              }" AS target,
              "${direction}" AS direction
            `
          );
        }
      }
    };

    for (const node of treeParseResult.nodes) {
      addConnections(node, Direction.OUTGOING);
      addConnections(node, Direction.INCOMING);
    }

    pathwayElementsCountQuery = `
  MATCH
    ${treeParseResult.patterns.join(",\n\t")}
  RETURN
    {\n\t${Array.from(treeParseResult.nodeIds)
      .map(escapeCypherString)
      .concat(Array.from(treeParseResult.relIds).map(escapeCypherString))
      .map((id) => `${id}: count(DISTINCT ${id})`)
      .join(",\n\t")}
    } AS counts
  `;
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
    const [countsResult, ...connectionsResults] = await Promise.all([
      executeReadOne<CountsQueryRecord>(driver, pathwayElementsCountQuery),
      ...connectionQueries.map((q, i) =>
        executeReadOne<ConnectionQueryRecord>(driver, q)
      ),
    ]);

    // This should never happen with the current query, but it doesn't hurt to check!
    if (countsResult.length !== 1) {
      throw Error(
        `Unexpected row count in counts query. Expected 1 row, instead returned: ${countsResult.length}`
      );
    }

    const { counts } = countsResult.toObject();
    // There should be only one row per query
    connectionsResults.forEach((result) => {
      const data = result.toObject();
      if (data.exists) {
        connectedNodes.push({
          id: data.nodeId,
          label: data.label,
        });
        connectedEdges.push({
          id: data.edgeId,
          type: data.type,
          source: data.source,
          target: data.target,
          direction: data.direction,
        });
      }
    });
    return Response.json(
      {
        counts,
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
