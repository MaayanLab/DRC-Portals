import { NextRequest } from "next/server";

import { getTermsCypher } from "@/lib/neo4j/cypher";
import { executeRead, getDriver } from "@/lib/neo4j/driver";
import { isValidLucene } from "@/lib/neo4j/utils";
import { CVTermsResult } from "@/lib/neo4j/types";

const PATHWAY_TERMS_LIMIT = 10;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const skipParam = searchParams.get("skip");
  let skip: number;

  if (!query || query.length === 0 || !skipParam) {
    const missingParams = [
      query === null ? "q" : null,
      skipParam === null ? "skip" : null,
    ].filter((x) => x !== null);
    return Response.json(
      {
        error: "Missing required search parameters",
        message: `The request is missing one or more required search parameters: [${missingParams}].`,
      },
      { status: 400 }
    );
  }

  try {
    skip = Number(skipParam);
  } catch {
    return Response.json(
      {
        error: "Invalid search parameter",
        message: `Param "skip" is not a number: ${skipParam}.`,
      },
      { status: 400 }
    );
  }

  const phrase = `"${query}"`;
  const substring = `*${query}*`;
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
        substring,
        fuzzy,
        skip,
        limit: PATHWAY_TERMS_LIMIT,
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
          "An error occurred searching CV terms. Please try again later.",
        error,
        params: { input: query },
      },
      { status: 500 }
    );
  }
}
