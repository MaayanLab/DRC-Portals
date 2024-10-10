import {
  BIOSAMPLE_RELATED_LABELS,
  DCC_LABEL,
  FILE_RELATED_LABELS,
  ID_NAMESPACE_LABEL,
  SUBJECT_RELATED_LABELS,
} from "@/lib/neo4j/constants";
import { getTermsFromLabelCypher } from "@/lib/neo4j/cypher";
import { executeReadOne, getDriver } from "@/lib/neo4j/driver";
import { CVTermsWithLabelResult } from "@/lib/neo4j/types";

const VALID_LABEL_MAP = new Map<string, string>([
  ...([
    DCC_LABEL,
    ID_NAMESPACE_LABEL,
    ...FILE_RELATED_LABELS,
    ...SUBJECT_RELATED_LABELS,
    ...BIOSAMPLE_RELATED_LABELS,
  ].map((term) => [term.toLowerCase(), term]) as [string, string][]),
]);

export async function GET(
  request: Request,
  { params }: { params: { label: string } }
) {
  const cypherLabel = VALID_LABEL_MAP.get(params.label.toLowerCase());
  if (cypherLabel === undefined) {
    return Response.json(
      {
        error: `Provided label is not valid. Label must be one of the following: [${Array.from(
          VALID_LABEL_MAP.values()
        ).join(", ")}]`,
        params: { label: params.label },
      },
      { status: 400 }
    );
  } else {
    try {
      const result = await executeReadOne<CVTermsWithLabelResult>(
        getDriver(),
        getTermsFromLabelCypher(cypherLabel)
      );
      return Response.json(result.toObject().names, { status: 200 });
    } catch (error) {
      return Response.json(
        {
          message:
            "An error occured trying to find incoming relationships of the node. Please try again later.",
          error,
          params: {
            label: params.label,
          },
        },
        { status: 500 }
      );
    }
  }
}
