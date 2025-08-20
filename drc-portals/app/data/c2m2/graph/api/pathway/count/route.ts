import { NextRequest } from "next/server";

import { executeReadOne, getDriver } from "@/lib/neo4j/driver";
import { PathwayNode } from "@/lib/neo4j/types";
import { getCountsQueryFromTree } from "@/lib/neo4j/utils";

interface CountsQueryRecord {
  total: number;
  counts: {
    [key: string]: number;
  };
}

export async function POST(request: NextRequest) {
  const body: { tree: string } = await request.json();
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
    const pathwaySearchResultCount = await executeReadOne<CountsQueryRecord>(
      driver,
      getCountsQueryFromTree(tree)
    );

    const counts = pathwaySearchResultCount.get("counts");

    return Response.json(
      {
        counts,
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
