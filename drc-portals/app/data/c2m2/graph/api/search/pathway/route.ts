import { NextRequest } from "next/server";

import {
  createPathwaySearchCypher,
  createPathwaySearchPathsCountCypher,
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
    const [allPathsCountResult, pathwaySearchResult] = await Promise.all([
      executeReadOne<{ count: number }>(
        getDriver(),
        createPathwaySearchPathsCountCypher(treeParseResult)
      ),
      executeReadOne<SubGraph>(
        getDriver(),
        createPathwaySearchCypher(treeParseResult),
        { limit: PATHWAY_SEARCH_LIMIT }
      ),
    ]);
    const allPathsCount = allPathsCountResult.toObject().count;

    return Response.json(
      {
        graph: pathwaySearchResult.toObject(),
        returnedPathsCount:
          allPathsCount <= PATHWAY_SEARCH_LIMIT
            ? allPathsCount
            : PATHWAY_SEARCH_LIMIT,
        allPathsCount: allPathsCount,
      },
      { status: allPathsCount <= PATHWAY_SEARCH_LIMIT ? 200 : 206 }
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
