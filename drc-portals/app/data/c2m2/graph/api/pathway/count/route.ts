import { Session } from "neo4j-driver";
import { NextRequest } from "next/server";

import { getSingleMatchCountsQuery } from "@/lib/neo4j/cypher";
import {
  closeSession,
  getDriver,
  getSession,
  sessionExecuteReadOne,
} from "@/lib/neo4j/driver";
import { PathwayNode, TreeParseResult } from "@/lib/neo4j/types";
import { getMultiCallCountsQuery, parsePathwayTree } from "@/lib/neo4j/utils";

interface CountsQueryRecord {
  total: number;
  counts: {
    [key: string]: number;
  };
}

export async function POST(request: NextRequest) {
  const body: { tree: string } = await request.json();
  let tree: PathwayNode;
  let treeParseResult: TreeParseResult;

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
    treeParseResult = parsePathwayTree(tree, true);
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
    const querySessions: [string, Session][] = [
      [getSingleMatchCountsQuery(treeParseResult, true), getSession(driver)],
      [getSingleMatchCountsQuery(treeParseResult), getSession(driver)],
      [getMultiCallCountsQuery(tree), getSession(driver)],
    ];
    const pathwaySearchResultCount = await Promise.race(
      querySessions.map(([query, session]) =>
        sessionExecuteReadOne<CountsQueryRecord>(session, query)
      )
    )
      .then((result) => result)
      .finally(() => {
        // Regardless of which query finishes first, close all sessions
        querySessions.forEach(([_, session]) => closeSession(session));
      });

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
