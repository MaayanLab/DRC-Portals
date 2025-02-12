import { NextRequest } from "next/server";

import {
  createPathwaySearchAllPathsCountCypher,
  createPathwaySearchAllPathsCypher,
} from "@/lib/neo4j/cypher";
import { executeRead, executeReadOne, getDriver } from "@/lib/neo4j/driver";
import {
  NodeResult,
  PathwayNode,
  PathwaySearchResultRow,
  RelationshipResult,
  TreeParseResult,
} from "@/lib/neo4j/types";
import { parsePathwayTree } from "@/lib/neo4j/utils";

const PATHWAY_SEARCH_LIMIT = 10;

export async function POST(request: NextRequest) {
  const body: { tree: string; page?: number; limit?: number } =
    await request.json();
  let treeParseResult: TreeParseResult;
  let tree: PathwayNode;
  let page: number; // Note that this is 1-indexed!
  let limit: number;

  if (body === null) {
    return Response.json(
      {
        error: "Request body is empty",
      },
      { status: 400 }
    );
  }

  if (body.page === undefined || typeof body.page !== "number") {
    page = 1;
  } else {
    page = body.page;
  }

  if (body.limit === undefined || typeof body.limit !== "number") {
    limit = PATHWAY_SEARCH_LIMIT;
  } else {
    limit = body.limit;
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
    const driver = getDriver();
    const skip = limit * (page - 1); // Page is 1-indexed!
    const [pathwaySearchResultCount, pathwaySearchResult] = await Promise.all([
      executeReadOne<{ count: number }>(
        driver,
        createPathwaySearchAllPathsCountCypher(treeParseResult)
      ),
      executeRead<{ [key: string]: NodeResult | RelationshipResult }>(
        driver,
        createPathwaySearchAllPathsCypher(treeParseResult),
        {
          limit,
          skip,
        }
      ),
    ]);

    const count = pathwaySearchResultCount.get("count");
    const partialContent = skip + limit < count;
    const paths: PathwaySearchResultRow[] = pathwaySearchResult.map((record) =>
      Object.values(record.toObject())
    );

    return Response.json(
      {
        paths,
        count,
      },
      { status: partialContent ? 206 : 200 }
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
