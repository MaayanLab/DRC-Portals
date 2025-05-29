import { NextRequest } from "next/server";

import { getTermsCypher } from "@/lib/neo4j/cypher";
import { executeRead, getDriver } from "@/lib/neo4j/driver";
import { isValidLucene } from "@/lib/neo4j/utils";
import { CVTermsResult } from "@/lib/neo4j/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return Response.json(
      {
        error: "Missing required search parameters",
        message:
          "The request is missing one or more required search parameters: [q].",
        missingParams: [query === null ? "q" : null].filter((x) => x !== null),
      },
      { status: 400 }
    );
  }

  const phrase = `"${query}"`;
  const fuzzy = query
    .split(" ")
    .map((tok) => `${tok}~`)
    .join(" ");

  if (!isValidLucene(phrase) && !isValidLucene(fuzzy)) {
    return Response.json(
      {
        error: "Query string is not valid. Query must parse as valid Lucene.",
        query,
      },
      { status: 400 }
    );
  }

  try {
    const results = await executeRead<CVTermsResult>(
      getDriver(),
      getTermsCypher(),
      {
        phrase,
        fuzzy,
        limit: 10,
      }
    );
    return Response.json(
      results.map((record) => record.toObject()),
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        message:
          "An error occurred trying to expand the node. Please try again later.",
        error,
        params: { input: query },
      },
      { status: 500 }
    );
  }
}
