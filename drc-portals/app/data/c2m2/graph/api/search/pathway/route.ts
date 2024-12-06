import { NextRequest } from "next/server";

import {
  createPathwaySearchDistinctSetCypher,
  createPathwaySearchAllPathsCypher,
  parsePathwayTree,
} from "@/lib/neo4j/cypher";
import { executeReadOne, getDriver } from "@/lib/neo4j/driver";
import { PathwayNode, SubGraph, TreeParseResult } from "@/lib/neo4j/types";

const PATHWAY_SEARCH_LIMIT = 100;

export async function POST(request: NextRequest) {
  const body: { tree: string } = await request.json();
  let treeParseResult: TreeParseResult;
  let tree: PathwayNode;

  if (body === null) {
    return Response.json(
      {
        error: "Request body is empty",
      },
      { status: 400 }
    );
  }

  try {
    tree = JSON.parse(atob(body.tree));
    treeParseResult = parsePathwayTree(tree);
    // TODO: Add a schema for the pathway search query object (see /search/path/route.ts for zod example usage)
  } catch (e) {
    // If for any reason (decoding, parsing, etc.) we couldn't get the path object, return a 400 response instead
    return Response.json(
      {
        error: e,
        message: 'Failed to parse object provided by the "tree" param.',
      },
      { status: 400 }
    );
  }

  try {
    const [limitExceededResult, pathwaySearchResult] = await Promise.all([
      executeReadOne(
        getDriver(),
        createPathwaySearchAllPathsCypher(treeParseResult),
        { limit: 1, skip: PATHWAY_SEARCH_LIMIT }
      ),
      executeReadOne<SubGraph>(
        getDriver(),
        createPathwaySearchDistinctSetCypher(treeParseResult),
        { limit: PATHWAY_SEARCH_LIMIT, skip: 0 }
      ),
    ]);
    const limitExceeded = limitExceededResult !== undefined;

    return Response.json(
      {
        graph: pathwaySearchResult.toObject(),
        limit: PATHWAY_SEARCH_LIMIT,
        limitExceeded,
      },
      { status: limitExceeded ? 206 : 200 }
    );
  } catch (error) {
    return Response.json(
      {
        message: "An error occured during the search. Please try again later.",
        error,
        params: {
          treeParseResult,
        },
      },
      { status: 500 }
    );
  }
}
