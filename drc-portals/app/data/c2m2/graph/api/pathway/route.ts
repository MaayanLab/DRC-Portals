import { NextRequest } from "next/server";

import { createPathwaySearchAllPathsCypher } from "@/lib/neo4j/cypher";
import { executeRead, getDriver } from "@/lib/neo4j/driver";
import {
  NodeResult,
  PathwayNode,
  PathwaySearchResultRow,
  RelationshipResult,
  TreeParseResult,
} from "@/lib/neo4j/types";
import { parsePathwayTree } from "@/lib/neo4j/utils";

const MAX_LIMIT = 1000;

export async function POST(request: NextRequest) {
  const body: {
    tree: string;
    page?: number;
    limit?: number;
    orderByKey?: string;
    orderByProp?: string;
    order?: "asc" | "desc";
  } = await request.json();
  let treeParseResult: TreeParseResult;
  let tree: PathwayNode;
  let page: number | undefined = undefined;
  let limit: number | undefined = undefined;
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

  if (body.page !== undefined && typeof body.page === "number") {
    page = body.page;
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

  if (body.limit !== undefined && typeof body.limit === "number") {
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
    const skip =
      limit !== undefined && page !== undefined
        ? limit * (page - 1) // Page is 1-indexed!
        : undefined;

    const pathwaySearchResult = await executeRead<{
      [key: string]: NodeResult | RelationshipResult;
    }>(
      driver,
      createPathwaySearchAllPathsCypher(
        treeParseResult,
        skip !== undefined,
        limit !== undefined,
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

    return Response.json(
      {
        paths,
      },
      { status: 200 }
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
