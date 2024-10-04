import { NextRequest } from "next/server";

import { createPathwaySearchCypher } from "@/lib/neo4j/cypher";
import { executeReadOne, getDriver } from "@/lib/neo4j/driver";
import { SubGraph } from "@/lib/neo4j/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pathsRepr = searchParams.get("q");
  let paths = [];

  if (!pathsRepr) {
    return Response.json(
      {
        error: "Missing required search parameters",
        message:
          "The request is missing one or more required search parameters: [q].",
        missingParams: [pathsRepr === null ? "q" : null].filter(
          (x) => x !== null
        ),
      },
      { status: 400 }
    );
  }

  try {
    paths = JSON.parse(atob(pathsRepr));

    if (!Array.isArray(paths)) {
      throw TypeError("Decoded pathway search value was not an array.");
    }

    // TODO: Add a schema for the pathway search query object (see /search/path/route.ts for zod example usage)
  } catch (e) {
    // If for any reason (decoding, parsing, etc.) we couldn't get the path object, return a 400 response instead
    return Response.json(
      {
        error: e,
        message: 'Failed to parse object provided by the "q" param.',
      },
      { status: 400 }
    );
  }

  try {
    const result = await executeReadOne<SubGraph>(
      getDriver(),
      createPathwaySearchCypher(paths)
    );
    return Response.json(result.toObject(), { status: 200 });
  } catch (error) {
    return Response.json(
      {
        message: "An error occured during the search. Please try again later.",
        error,
        params: {
          paths,
        },
      },
      { status: 500 }
    );
  }
}
