import { NextRequest } from "next/server";

import { TERM_LABELS } from "@/lib/neo4j/constants";
import { filterTermBySynonyms } from "@/lib/neo4j/cypher";
import { executeRead, getDriver } from "@/lib/neo4j/driver";
import { PathwayNode, TreeParseResult } from "@/lib/neo4j/types";
import {
  escapeCypherString,
  getOptimizedMatches,
  isValidLucene,
  parsePathwayTree,
} from "@/lib/neo4j/utils";

const PATHWAY_TERMS_LIMIT = 10;

// TODO: Would be awesome if we could somehow guarantee that the ids passed in for a given pathway will be exactly the same every time
// that pathway is sent in the request. This would allow us to leverage the Neo4j query cache much more effectively.
export async function POST(request: NextRequest) {
  const body: { filter: string | null; nodeId: string; tree: string } =
    await request.json();
  let tree: PathwayNode;
  let treeParseResult: TreeParseResult;
  let nodeLabel: string;

  if (body === null) {
    return Response.json(
      {
        error: "Request body is empty.",
      },
      { status: 400 }
    );
  }

  try {
    tree = JSON.parse(atob(body.tree));

    // TODO: Add a schema for the pathway search query object (see /search/path/route.ts for zod example usage)
  } catch (e) {
    // If for any reason (decoding, parsing, etc.) we couldn't get the path object, return a 400 response instead
    return Response.json(
      {
        error: e,
        message:
          'Failed to parse object provided by the "tree" parameter in request body.',
      },
      { status: 400 }
    );
  }

  try {
    treeParseResult = parsePathwayTree(tree, true);
    const node = treeParseResult.nodes.find((v) => v.id === body.nodeId);
    if (node === undefined) {
      return Response.json(
        {
          message: `Node ID ${body.nodeId} does not exist in the provided tree.`,
        },
        { status: 422 }
      );
    } else {
      nodeLabel = node.label;
    }
  } catch (e) {
    return Response.json(
      {
        error: e,
        message: "An unknown error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }

  try {
    const queryStmts = getOptimizedMatches(treeParseResult, body.nodeId);
    const escapedNodeId = escapeCypherString(body.nodeId);
    const query = [...queryStmts];
    const driver = getDriver();
    let result;

    if (body.filter !== null && TERM_LABELS.includes(nodeLabel)) {
      const phrase = `"${body.filter}"`;
      const fuzzy = body.filter
        .split(" ")
        .map((tok) => `${tok}~`)
        .join(" ");

      if (!isValidLucene(phrase) && !isValidLucene(fuzzy)) {
        return Response.json(
          {
            error:
              "Query string is not valid. Query must parse as valid Lucene.",
            query,
          },
          { status: 400 }
        );
      }

      query.push(
        ...[
          filterTermBySynonyms(escapedNodeId),
          `RETURN DISTINCT term.name AS name`,
          `ORDER BY size(name) ASC`,
          "LIMIT $limit",
        ]
      );
      result = await executeRead<{ name: string }>(driver, query.join("\n"), {
        phrase,
        fuzzy,
        limit: PATHWAY_TERMS_LIMIT,
      });
    } else {
      query.push(
        ...[
          ...(body.filter === null
            ? []
            : [`WHERE lower(${escapedNodeId}.name) CONTAINS lower($filter)`]),
          `RETURN DISTINCT ${escapedNodeId}.name AS name`,
          "ORDER BY size(name) ASC",
          "LIMIT $limit",
        ]
      );
      result = await executeRead<{ name: string }>(driver, query.join("\n"), {
        filter: body.filter,
        limit: PATHWAY_TERMS_LIMIT,
      });
    }

    return Response.json(
      result.map((record) => record.toObject().name, { status: 200 })
    );
  } catch (error) {
    return Response.json(
      {
        message: "An error occurred during the search. Please try again later.",
        error,
        params: {
          tree,
        },
      },
      { status: 500 }
    );
  }
}
