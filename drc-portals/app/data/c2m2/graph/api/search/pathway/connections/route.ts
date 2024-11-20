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

    const connectionProps = [];
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

          connectionProps.push(
            `\`${connectedNodeId}\`: any(v IN collect(EXISTS {${createConnectionPattern(
              node.id,
              label,
              relationship,
              Direction.OUTGOING
            )} WHERE NOT r IN [${Array.from(treeParseResult.relIds)
              .map(escapeCypherString)
              .join(", ")}]}) WHERE v)`
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

          connectionProps.push(
            `\`${connectedNodeId}\`: any(v IN collect(EXISTS {${createConnectionPattern(
              node.id,
              label,
              relationship,
              Direction.INCOMING
            )} WHERE NOT r IN [${Array.from(treeParseResult.relIds)
              .map(escapeCypherString)
              .join(", ")}]}) WHERE v)`
          );
        }
      }
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
    } AS counts,
    {\n\t${connectionProps.join(",\n\t")}\n} AS exists
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
    const { counts, exists } = (
      await executeReadOne<{
        counts: { [key: string]: number };
        exists: { [key: string]: boolean };
      }>(getDriver(), pathwayElementsCountQuery)
    ).toObject();

    Array.from(Object.entries(exists)).forEach(([id, exists]) => {
      const connection = connections.get(id);
      if (connection !== undefined && exists) {
        connectedNodes.push(connection.node);
        connectedEdges.push(connection.edge);
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
