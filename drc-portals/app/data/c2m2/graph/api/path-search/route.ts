import { NextRequest } from "next/server";

import { createSchemaSearchCypher } from "@/lib/neo4j/cypher";
import { executeReadOne, getDriver } from "@/lib/neo4j/driver";
import { SubGraph } from "@/lib/neo4j/types";
import { CypherParamSchema, SearchPathSchema } from "@/lib/neo4j/validation";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pathsRepr = searchParams.get("q");
  let paths = [];
  const cypherParamsRepr = searchParams.get("cy_params");
  let cypherParams = undefined;

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
      throw TypeError("Decoded schema search value was not an array.");
    }

    // If this succeeds without throwing, then we certainly have a valid schema search value
    paths.forEach((path) => SearchPathSchema.parse(path));
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

  if (cypherParamsRepr) {
    try {
      cypherParams = JSON.parse(atob(cypherParamsRepr));

      // If this succeeds without throwing, then we certainly have valid cypher params
      CypherParamSchema.parse(cypherParams);
    } catch (e) {
      // If for any reason (decoding, parsing, etc.) we couldn't get the params, return a 400 response instead
      return Response.json(
        {
          error: e,
          message: 'Failed to parse object provided by the "cy_params" param.',
        },
        { status: 400 }
      );
    }
  }

  try {
    const result = await executeReadOne<SubGraph>(
      getDriver(),
      createSchemaSearchCypher(paths),
      cypherParams
    );
    return Response.json(result.toObject(), { status: 200 });
  } catch (error) {
    return Response.json(
      {
        message: "An error occured during the search. Please try again later.",
        error,
        params: {
          paths,
          cypherParams,
        },
      },
      { status: 500 }
    );
  }
}
