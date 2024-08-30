import { NextRequest } from "next/server";

import { getSynonymsCypher } from "@/lib/neo4j/cypher";
import { executeRead, getDriver } from "@/lib/neo4j/driver";
import { SynoynmsResult } from "@/lib/neo4j/interfaces";

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

  try {
    const results = await executeRead<SynoynmsResult>(
      getDriver(),
      getSynonymsCypher(),
      {
        input: query,
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
          "An error occured trying to expand the node. Please try again later.",
        error,
        params: { input: query },
      },
      { status: 500 }
    );
  }
}
