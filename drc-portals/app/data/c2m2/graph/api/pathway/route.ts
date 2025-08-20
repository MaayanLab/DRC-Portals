import { NextRequest } from "next/server";

import { createPathwaySearchAllPathsCypher, createUpperPageBoundCypher } from "@/lib/neo4j/cypher";
import { executeRead, executeReadOne, getDriver } from "@/lib/neo4j/driver";
import {
  NodeResult,
  PathwayNode,
  PathwaySearchResultRow,
  RelationshipResult,
  TreeParseResult,
} from "@/lib/neo4j/types";
import { parsePathwayTree } from "@/lib/neo4j/utils";

const MAX_LIMIT = 1000;
const MAX_PAGE_SIBLINGS = 9;

export async function POST(request: NextRequest) {
  const body: {
    tree: string;
    page: number;
    limit: number;
    orderByKey?: string;
    orderByProp?: string;
    order?: "asc" | "desc";
  } = await request.json();
  let treeParseResult: TreeParseResult;
  let tree: PathwayNode;
  let page: number;
  let limit: number;
  let orderByKey: string | undefined = undefined;
  let orderByProp: string | undefined = undefined;
  let order: "asc" | "desc" | undefined = undefined;

  if (body === null) {
    return Response.json(
      {
        error: "Request body is empty",
      },
      { status: 400 }
    );
  }

  if (body.page === undefined || typeof body.page !== "number") {
    return Response.json(
      {
        error: `There was no page number provided in your request payload. Please provide a page number.`,
      },
      { status: 400 }
    );
  } else {
    page = body.page;
  }

  if (body.limit === undefined || typeof body.limit !== "number") {
    return Response.json(
      {
        error: `There was no limit provided in your request payload. Please provide a limit.`,
      },
      { status: 400 }
    );
  } else {
    limit = body.limit;

    if (limit > MAX_LIMIT) {
      return Response.json(
        {
          error: `The provided limit exceeds the maximum allowed value of ${MAX_LIMIT}. Please provide a lower limit.`,
        },
        { status: 400 }
      );
    }
  }

  if (body.orderByKey !== undefined && typeof body.orderByKey === "string") {
    orderByKey = body.orderByKey;
  }

  if (body.orderByProp !== undefined && typeof body.orderByProp === "string") {
    orderByProp = body.orderByProp;
  }

  if (body.order !== undefined && typeof body.order === "string") {
    order = body.order;
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
    const skip = limit * (page - 1) // Assume page is 1-indexed!

    const pathwaySearchResult = await executeRead<{
      [key: string]: NodeResult | RelationshipResult;
    }>(
      driver,
      createPathwaySearchAllPathsCypher(
        treeParseResult,
        orderByKey,
        orderByProp,
        order
      ),
      {
        limit,
        skip,
      }
    );

    const paths: PathwaySearchResultRow[] = pathwaySearchResult.map((record) =>
      Object.values(record.toObject())
    );

    let lowerPageBound = Math.max(page - Math.ceil(MAX_PAGE_SIBLINGS / 2), 1)
    const upperPageBound = (await executeReadOne<{ upperPageBound: number; }>(
      driver,
      createUpperPageBoundCypher(treeParseResult),
      {
        limit,
        skip: skip + limit, // Start counting from the page after the current page
        maxSiblings: MAX_PAGE_SIBLINGS,
        lowerPageBound
      }
    )).toObject().upperPageBound;

    // If we reach the end of the table, we can fix the lower bound to maintain a constant number of page items
    const greaterSiblings = upperPageBound - page;
    if (greaterSiblings < Math.floor(MAX_PAGE_SIBLINGS / 2)) {
      lowerPageBound = Math.max(page - (MAX_PAGE_SIBLINGS - greaterSiblings), 1)
    }

    return Response.json(
      {
        paths,
        lowerPageBound,
        upperPageBound
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        message: "An error occurred during the search. Please try again later.",
        error,
        params: {
          treeParseResult,
        },
      },
      { status: 500 }
    );
  }
}
