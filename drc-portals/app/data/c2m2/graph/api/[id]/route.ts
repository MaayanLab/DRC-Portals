import { NextRequest } from "next/server";

import { getNodeByIdAndLabelCypher } from "@/lib/neo4j/cypher";
import { executeReadOne, getDriver } from "@/lib/neo4j/driver";
import { NodeResult } from "@/lib/neo4j/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const searchParams = request.nextUrl.searchParams;
  const labels = searchParams.get("labels");

  if (!labels) {
    return Response.json(
      {
        error: "Missing required search parameters",
        message: "The request is missing required search parameter: labels",
      },
      { status: 400 }
    );
  }

  const labelRegex = /^(:[A-Za-z]+)+$/;
  if (!labels.match(labelRegex)) {
    return Response.json(
      {
        error: "Invalid parameter",
        message: "The request contains an invalid value for parameter: labels",
      },
      { status: 400 }
    );
  }

  try {
    const result = await executeReadOne<{ node: NodeResult }>(
      getDriver(),
      getNodeByIdAndLabelCypher(labels),
      { id }
    );
    return Response.json(result.toObject().node, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      {
        message:
          "An error occurred searching CV terms. Please try again later.",
        error,
      },
      { status: 500 }
    );
  }
}
