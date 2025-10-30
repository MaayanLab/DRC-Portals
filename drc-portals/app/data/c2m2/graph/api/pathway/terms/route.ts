import { NextRequest } from "next/server";

import { NAME_FILTER_LABELS } from "@/lib/neo4j/constants";
import { filterTermBySynonyms } from "@/lib/neo4j/cypher";
import { executeRead, getDriver } from "@/lib/neo4j/driver";
import { PathwayNode, TreeParseResult } from "@/lib/neo4j/types";
import {
  escapeCypherString,
  getTermMatchBaseQuery,
  parsePathwayTree,
} from "@/lib/neo4j/utils";

const PATHWAY_TERMS_LIMIT = 10;
const MAX_ALLOWABLE_LIMIT = 1000;

// TODO: Would be awesome if we could somehow guarantee that the ids passed in for a given pathway will be exactly the same every time
// that pathway is sent in the request. This would allow us to leverage the Neo4j query cache much more effectively.
export async function POST(request: NextRequest) {
  const body: {
    filter: string | null;
    nodeId: string;
    tree: string;
    skip?: number;
    limit?: number;
  } = await request.json();
  let tree: PathwayNode;
  let treeParseResult: TreeParseResult;
  let nodeLabel: string;
  const skip = body.skip;
  const limit = body.limit || PATHWAY_TERMS_LIMIT;

  if (body === null) {
    return Response.json(
      {
        error: "Request body is empty.",
      },
      { status: 400 }
    );
  }

  if (limit > MAX_ALLOWABLE_LIMIT) {
    return Response.json(
      {
        error: `Requested limit is greater than the maximum of ${MAX_ALLOWABLE_LIMIT}.`,
      },
      { status: 422 }
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

  if (!NAME_FILTER_LABELS.has(nodeLabel)) {
    return Response.json(
      {
        message: `Cannot filter node with label ${nodeLabel} on name property.`,
      },
      { status: 422 }
    );
  }

  try {
    const queryStmts = getTermMatchBaseQuery(treeParseResult, body.nodeId);
    const escapedNodeId = escapeCypherString(body.nodeId);
    const query = [...queryStmts];
    const driver = getDriver();
    let result;

    const phrase = body.filter;
    const substring = `.*${body.filter}.*`;

    if (phrase) {
      query.push(
        filterTermBySynonyms(escapedNodeId),
        `WITH DISTINCT ${escapedNodeId}.name AS name, collect(s.name)[0] AS synonym`
      );
    } else {
      query.push(
        `WITH DISTINCT ${escapedNodeId}.name AS name, NULL AS synonym`
      );
    }

    query.push(
      "RETURN name, synonym",
      phrase ? "ORDER BY toLower(synonym)" : "ORDER BY toLower(name) ASC",
      `${skip === undefined ? "// " : ""}SKIP $skip`,
      "LIMIT $limit"
    );
    result = await executeRead<{ name: string; synonym: string | null }>(
      driver,
      query.join("\n"),
      {
        phrase,
        substring,
        limit,
        skip,
      }
    );

    return Response.json(
      result.map((record) => record.toObject()),
      { status: 200 }
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
