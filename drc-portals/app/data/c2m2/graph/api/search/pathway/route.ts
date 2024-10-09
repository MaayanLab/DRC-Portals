import { NextRequest } from "next/server";

import { createPathwaySearchCypher } from "@/lib/neo4j/cypher";
import { executeReadOne, getDriver } from "@/lib/neo4j/driver";
import { SubGraph } from "@/lib/neo4j/types";

export async function POST(request: NextRequest) {
  const body: { paths: string } = await request.json();
  let paths = [];

  if (body === null) {
    return Response.json(
      {
        error: "Request body is empty",
      },
      { status: 400 }
    );
  }

  try {
    paths = JSON.parse(atob(body.paths));

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
