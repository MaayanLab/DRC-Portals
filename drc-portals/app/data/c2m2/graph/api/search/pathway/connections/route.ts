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

// TODO: Would be awesome if we could somehow guarantee that the ids passed in for a given pathway will be exactly the same every time
// that pathway is sent in the request. This would allow us to leverage the Neo4j query cache much more effectively.
export async function POST(request: NextRequest) {
  const body: { tree: string } = await request.json();
  let tree: PathwayNode;
  let treeParseResult: TreeParseResult;
  let pathwayElementsCountQuery: string;
  const connections = new Map<
    string,
    { node: NodeConnection; edge: EdgeConnection }
  >();

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

    const connectionColumns = [];
    for (const node of treeParseResult.nodes) {
      for (const [relationship, labels] of Array.from(
        OUTGOING_CONNECTIONS.get(node.label)?.entries() || []
      )) {
        for (const label of labels) {
          const connectedNodeId = v4();
          const connectedEdgeId = v4();

          connections.set(connectedNodeId, {
            node: {
              id: connectedNodeId,
              label: label,
            },
            edge: {
              id: connectedEdgeId,
              type: relationship,
              source: node.id,
              target: connectedNodeId,
              direction: Direction.OUTGOING,
            },
          });

          connectionColumns.push(
            `any(v IN collect(EXISTS {${createConnectionPattern(
              node.id,
              label,
              relationship,
              Direction.OUTGOING
            )} WHERE NOT r IN [${Array.from(treeParseResult.relIds)
              .map(escapeCypherString)
              .join(", ")}]}) WHERE v) AS \`${connectedNodeId}\``
          );
        }
      }

      for (const [relationship, labels] of Array.from(
        INCOMING_CONNECTIONS.get(node.label)?.entries() || []
      )) {
        for (const label of labels) {
          const connectedNodeId = v4();
          const connectedEdgeId = v4();

          connections.set(connectedNodeId, {
            node: {
              id: connectedNodeId,
              label: label,
            },
            edge: {
              id: connectedEdgeId,
              type: relationship,
              source: connectedNodeId,
              target: node.id,
              direction: Direction.INCOMING,
            },
          });

          connectionColumns.push(
            `any(v IN collect(EXISTS {${createConnectionPattern(
              node.id,
              label,
              relationship,
              Direction.INCOMING
            )} WHERE NOT r IN [${Array.from(treeParseResult.relIds)
              .map(escapeCypherString)
              .join(", ")}]}) WHERE v) AS \`${connectedNodeId}\``
          );
        }
      }
    }

    pathwayElementsCountQuery = `
  MATCH
  ${treeParseResult.patterns.join(",\n")}
  RETURN\n\t${Array.from(treeParseResult.nodeIds)
    .map(escapeCypherString)
    .concat(Array.from(treeParseResult.relIds).map(escapeCypherString))
    .map((id) => `count(DISTINCT ${id}) AS ${id}`)
    .concat(connectionColumns)
    .join(",\n\t")}
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

  let pathwayCounts: { [key: string]: number } = {};
  const connectedNodes: NodeConnection[] = [];
  const connectedEdges: EdgeConnection[] = [];
  try {
    const result = (
      await executeReadOne<{ [key: string]: number | boolean }>(
        getDriver(),
        pathwayElementsCountQuery
      )
    ).toObject();

    Array.from(Object.entries(result)).forEach(([id, countOrExists]) => {
      if (treeParseResult.nodeIds.has(id) || treeParseResult.relIds.has(id)) {
        pathwayCounts[id] = countOrExists as number;
      } else {
        const connection = connections.get(id);
        if (connection !== undefined && countOrExists) {
          connectedNodes.push(connection.node);
          connectedEdges.push(connection.edge);
        }
      }
    });
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

  return Response.json(
    {
      pathwayCounts,
      connectedNodes: connectedNodes,
      connectedEdges: connectedEdges,
    },
    { status: 200 }
  );
}
