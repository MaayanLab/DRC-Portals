import { NextRequest } from "next/server";

import { getSearchCypher } from "@/lib/neo4j/cypher";
import { executeReadOne, getDriver } from "@/lib/neo4j/driver";
import { SubGraph } from "@/lib/neo4j/interfaces";

const getListParamOrEmptyList = (param: string | null) =>
  (param || "").split(",").filter((n) => n !== "");

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const coreLabels = getListParamOrEmptyList(
    searchParams.get("as_core_labels")
  );
  const dccAbbrevs = getListParamOrEmptyList(searchParams.get("as_dccs"));
  const subjectGenders = getListParamOrEmptyList(searchParams.get("as_subg"));
  const subjectRaces = getListParamOrEmptyList(searchParams.get("as_subr"));

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
    const result = await executeReadOne<SubGraph>(
      getDriver(),
      getSearchCypher(coreLabels),
      {
        query,
        synLimit: 10,
        termLimit: 10,
        collectionLimit: 1,
        coreLimit: 1,
        dccAbbrevs,
        subjectGenders,
        subjectRaces,
      }
    );
    return Response.json(result.toObject(), { status: 200 });
  } catch (error) {
    return Response.json(
      {
        message: "An error occured during the search. Please try again later.",
        error,
        params: {
          query,
          synLimit: 10,
          termLimit: 10,
          collectionLimit: 1,
          coreLimit: 1,
          dccAbbrevs,
          subjectGenders,
          subjectRaces,
        },
      },
      { status: 500 }
    );
  }
}
