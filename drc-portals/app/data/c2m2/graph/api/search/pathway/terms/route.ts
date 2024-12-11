import { NextRequest } from "next/server";

import { executeRead, getDriver } from "@/lib/neo4j/driver";
import { PathwayNode, TreeParseResult } from "@/lib/neo4j/types";
import {
  escapeCypherString,
  getOptimizedMatches,
  parsePathwayTree,
} from "@/lib/neo4j/utils";

const PATHWAY_TERMS_LIMIT = 10;

// TODO: Would be awesome if we could somehow guarantee that the ids passed in for a given pathway will be exactly the same every time
// that pathway is sent in the request. This would allow us to leverage the Neo4j query cache much more effectively.
export async function POST(request: NextRequest) {
  const body: { filter: string | null; nodeId: string; tree: string } =
    await request.json();
  let tree: PathwayNode;
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
    treeParseResult = parsePathwayTree(tree, false);

    if (!treeParseResult.nodeIds.has(body.nodeId)) {
      return Response.json(
        {
          message: `Node ID ${body.nodeId} does not exist in the provided tree.`,
        },
        { status: 422 }
      );
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

  try {
    const queryStmts = getOptimizedMatches(treeParseResult, body.nodeId, true);
    const escapedNodeId = escapeCypherString(body.nodeId);
    const query = [
      ...queryStmts,
      ...(body.filter === null
        ? []
        : [`WHERE lower(${escapedNodeId}.name) CONTAINS $filter`]),
      `RETURN DISTINCT ${escapedNodeId}.name AS name`,
      "ORDER BY size(name) ASC",
      "LIMIT $limit",
    ].join("\n");
    const driver = getDriver();
    const result = await executeRead<{ name: string }>(driver, query, {
      filter: body.filter,
      limit: PATHWAY_TERMS_LIMIT,
    });

    return Response.json(
      result.map((record) => record.toObject().name, { status: 200 })
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
