// @ts-ignore
import parser from "lucene-query-parser";
import { v4 } from "uuid";

import {
  FILTER_LABELS,
  NODE_LABELS,
  RELATIONSHIP_TYPES,
  UNIQUE_PAIR_INCOMING_CONNECTIONS,
  UNIQUE_PAIR_OUTGOING_CONNECTIONS,
  UNIQUE_PAIR_RELATIONSHIP_TYPES,
  UNIQUE_TO_GENERIC_REL,
  UUID_REGEX,
} from "./constants";
import { createConnectionPattern } from "./cypher";
import {
  NodeResult,
  PathwayNode,
  RelationshipResult,
  TreeParseResult,
} from "./types";
import { Direction } from "./enums";

export const escapeCypherString = (input: string) => {
  // convert any \u0060 to literal backtick, then escape backticks, and finally wrap in single backticks
  return `\`${input.replace(/\\u0060/g, "`").replace(/`+/g, "``")}\``;
};

export const isValidLucene = (input: string) => {
  try {
    parser.parse(input);
  } catch {
    return false;
  }
  return true;
};

export const getSafeLabel = (label: string) => {
  if (NODE_LABELS.has(label)) {
    return label;
  } else {
    console.warn(
      `Cypher Query Warning: Attempted to use the nonexistent label "${label}", using empty string instead.`
    );
    return ""; // Not valid to use in Cypher, but it is "safe" in the sense that an empty node label in a query pattern will cause a syntax error
  }
};

export const getSafeType = (type: string) => {
  if (
    RELATIONSHIP_TYPES.has(type) ||
    UNIQUE_PAIR_RELATIONSHIP_TYPES.has(type)
  ) {
    return type;
  } else {
    console.warn(
      `Cypher Query Warning: Attempted to use the nonexistent type "${type}", using empty string instead.`
    );
    return ""; // Not valid to use in Cypher, but it is "safe" in the sense that an empty relationship type in a query pattern will cause a syntax error
  }
};

export const createNodeReprStr = (varName: string) => {
  return `{
    uuid: ${varName}._uuid,
    labels: labels(${varName}),
    properties: properties(${varName})
  }`;
};

export const createRelReprStr = (varName: string) => {
  return `{
    uuid: ${varName}._uuid,
    type: type(${varName}),
    properties: properties(${varName}),
    startUUID: startNode(${varName})._uuid,
    endUUID: endNode(${varName})._uuid
  }`;
};

// TODO: We'll want to parameterize these, otherwise Cypher injection may be possible
const createPropReprStr = (props: { [key: string]: any }) => {
  const propStrs: string[] = [];
  Object.entries(props).forEach(([key, value]) => {
    propStrs.push(`${key}: ${JSON.stringify(value)}`);
  });
  return `{${propStrs.join(", ")}}`;
};

export const isRelationshipResult = (
  element: NodeResult | RelationshipResult
): element is RelationshipResult => {
  return (element as RelationshipResult).type !== undefined;
};

const getUniqueTypeFromNodes = (source: string, dest: string) => {
  const uniqOutgoingCnxns = UNIQUE_PAIR_OUTGOING_CONNECTIONS.get(source);

  if (uniqOutgoingCnxns !== undefined) {
    return (
      Array.from(uniqOutgoingCnxns.entries())
        .filter(([_, d]) => d === dest)
        .map(([uniqType, _]) => uniqType)
        .shift() || "Unknown"
    );
  } else {
    return "Unknown";
  }
};

// TODO: Add leaf patterns first, and only once they are exhausted move on to branches
export const parsePathwayTree = (
  tree: PathwayNode,
  convertRelsToUniq = false
): TreeParseResult => {
  const patterns: string[] = [];
  const nodeIds = new Set<string>();
  const relIds = new Set<string>();
  const outgoingCnxns = new Map<string, Map<string, string[]>>();
  const incomingCnxns = new Map<string, Map<string, string[]>>();
  const nodes: PathwayNode[] = [];

  const updateCnxns = (
    key: string,
    label: string,
    type: string,
    allCnxns: Map<string, Map<string, string[]>>
  ) => {
    const keyCnxns = allCnxns.get(key);
    if (keyCnxns !== undefined) {
      const parentCnxnOnType = keyCnxns.get(type);
      if (parentCnxnOnType !== undefined) {
        parentCnxnOnType.push(label);
      } else {
        keyCnxns.set(type, [label]);
      }
    } else {
      allCnxns.set(key, new Map<string, string[]>([[type, [label]]]));
    }
  };

  const getQueryFromTree = (
    node: PathwayNode,
    currentPattern: string,
    parent: PathwayNode | undefined
  ) => {
    if (!nodeIds.has(node.id)) {
      nodeIds.add(node.id);
      nodes.push(node);
    }

    if (node.parentRelationship !== undefined && parent !== undefined) {
      const relIsIncoming =
        node.parentRelationship.direction === Direction.INCOMING;
      let type: string;

      if (convertRelsToUniq) {
        type = relIsIncoming
          ? getUniqueTypeFromNodes(node.label, parent.label)
          : getUniqueTypeFromNodes(parent.label, node.label);
      } else {
        type = getSafeType(node.parentRelationship.type);
      }

      const escapedRelId = escapeCypherString(node.parentRelationship.id);
      relIds.add(node.parentRelationship.id);

      currentPattern += `${relIsIncoming ? "<" : ""}-[${escapedRelId}:${type}${
        node.parentRelationship.props !== undefined &&
        Object.keys(node.parentRelationship.props).length > 0
          ? " " + createPropReprStr(node.parentRelationship.props)
          : ""
      }]-${!relIsIncoming ? ">" : ""}`;

      if (!relIsIncoming) {
        updateCnxns(parent.id, getSafeLabel(node.label), type, outgoingCnxns);
        updateCnxns(node.id, getSafeLabel(parent.label), type, incomingCnxns);
      } else if (relIsIncoming) {
        updateCnxns(parent.id, getSafeLabel(node.label), type, incomingCnxns);
        updateCnxns(node.id, getSafeLabel(parent.label), type, outgoingCnxns);
      }
    }

    const escapedNodeId = escapeCypherString(node.id);
    currentPattern += `(${escapedNodeId}:${getSafeLabel(node.label)}${
      node.props !== undefined && Object.keys(node.props).length > 0
        ? " " + createPropReprStr(node.props)
        : ""
    })`;

    if (node.children.length === 0) {
      patterns.push(currentPattern);
    } else if (node.children.length === 1) {
      patterns.push(currentPattern);
      getQueryFromTree(node.children[0], `(${escapedNodeId})`, node);
    } else {
      patterns.push(currentPattern);
      node.children
        // Parse children with the fewest children first
        .sort((a, b) => a.children.length - b.children.length)
        .forEach((child) => {
          getQueryFromTree(child, `(${escapedNodeId})`, node);
        });
    }
  };

  getQueryFromTree(tree, "", undefined);

  return {
    patterns,
    nodeIds,
    relIds,
    nodes,
    outgoingCnxns,
    incomingCnxns,
  };
};

export const getCountsQueryFromTree = (tree: PathwayNode) => {
  const statements: string[] = [];
  const queryContext = new Set<string>();
  const termContext = new Set<string>();

  const getDistinctTermSubqueries = (root: PathwayNode) => {
    const bts = (node: PathwayNode) => {
      if (FILTER_LABELS.has(node.label) && node.props?.name !== undefined) {
        const escapedNodeId = escapeCypherString(node.id);
        const nodeCountId = escapeCypherString(node.id + "-count");
        queryContext.add(nodeCountId);
        termContext.add(escapedNodeId);
        statements.push(
          [
            "CALL {",
            // We know this node label is safe because we just checked it in the if statement above
            `\tMATCH (${escapedNodeId}:${node.label} ${createPropReprStr(
              node.props
            )})`,
            `\tRETURN ${escapedNodeId}, 1 AS ${nodeCountId}`,
            "}",
            `WITH ${Array.from(termContext).join(", ")}, ${Array.from(
              queryContext
            ).join(", ")}`,
          ].join("\n")
        );
      }

      if (node.children.length > 0) {
        node.children.forEach((child) => bts(child));
      }
    };
    bts(root);
  };

  const getFilterTree = (root: PathwayNode): string => {
    const expressions: string[] = [];

    const getExpression = (
      currentExpression: string,
      node: PathwayNode,
      parent?: PathwayNode
    ) => {
      let pattern = "";
      if (node.parentRelationship !== undefined && parent !== undefined) {
        const relIsIncoming =
          node.parentRelationship.direction === Direction.INCOMING;
        const type = relIsIncoming
          ? getUniqueTypeFromNodes(node.label, parent.label)
          : getUniqueTypeFromNodes(parent.label, node.label);
        pattern = `${relIsIncoming ? "<" : ""}-[:${type}${
          node.parentRelationship.props !== undefined &&
          Object.keys(node.parentRelationship.props).length > 0
            ? " " + createPropReprStr(node.parentRelationship.props)
            : ""
        }]-${!relIsIncoming ? ">" : ""}`;

        const escapedNodeId = escapeCypherString(node.id);
        if (termContext.has(escapedNodeId)) {
          pattern += `(${escapedNodeId})`;
        } else {
          pattern += `(:${getSafeLabel(node.label)}${
            node.props !== undefined && Object.keys(node.props).length > 0
              ? " " + createPropReprStr(node.props)
              : ""
          })`;
        }
      }

      if (node.children.length > 0) {
        node.children.forEach((child) =>
          getExpression(currentExpression + pattern, child, node)
        );
      } else {
        expressions.push(currentExpression + pattern);
      }
    };
    getExpression(`\t\t(${escapeCypherString(root.id)})`, root);
    return expressions.join(" AND\n");
  };

  const getSubqueryFromNode = (
    node: PathwayNode,
    parent: PathwayNode | undefined
  ) => {
    let subquery = ["CALL {"];
    const escapedNodeId = escapeCypherString(node.id);
    const nodeCollectionId = escapeCypherString(node.id + "-coll");
    const nodeCountId = escapeCypherString(node.id + "-count");
    let matchStmt = "\tMATCH ";
    let withVars: string[] = [];
    let returnVars: string[] = [];

    // This should always be true since we effectively skip the root node, and it would be the only node without a parent
    if (node.parentRelationship !== undefined && parent !== undefined) {
      const escapedParentId = escapeCypherString(parent.id);
      const parentCollectionId = escapeCypherString(parent.id + "-coll");
      const relIsIncoming =
        node.parentRelationship.direction === Direction.INCOMING;
      const type = relIsIncoming
        ? getUniqueTypeFromNodes(node.label, parent.label)
        : getUniqueTypeFromNodes(parent.label, node.label);
      const escapedRelId = escapeCypherString(node.parentRelationship.id);
      const relCountId = escapeCypherString(
        node.parentRelationship.id + "-count"
      );

      // This case is only true for the child of the root node of the tree, since we prevent expansion from all other term nodes
      if (termContext.has(escapedParentId)) {
        subquery.push(`\tWITH ${Array.from(termContext).join(", ")}`);
      } else {
        subquery.push(
          `\tWITH ${parentCollectionId}, ${Array.from(termContext).join(", ")}`,
          `\tUNWIND ${parentCollectionId} AS ${escapedParentId}`
        );
      }
      queryContext.add(relCountId);
      matchStmt += `(${escapedParentId})${
        relIsIncoming ? "<" : ""
      }-[${escapedRelId}:${type}${
        node.parentRelationship.props !== undefined &&
        Object.keys(node.parentRelationship.props).length > 0
          ? " " + createPropReprStr(node.parentRelationship.props)
          : ""
      }]-${!relIsIncoming ? ">" : ""}`;
      withVars.push(`collect(DISTINCT ${escapedRelId}) AS ${escapedRelId}`);
      returnVars.push(`size(${escapedRelId}) AS ${relCountId}`);
    }

    if (termContext.has(escapedNodeId)) {
      matchStmt += `(${escapedNodeId})`;
    } else {
      matchStmt += `(${escapedNodeId}:${getSafeLabel(node.label)}${
        node.props !== undefined && Object.keys(node.props).length > 0
          ? " " + createPropReprStr(node.props)
          : ""
      })`;
      withVars.push(
        `collect(DISTINCT ${escapedNodeId}) AS ${nodeCollectionId}`
      );
      returnVars.push(`size(${nodeCollectionId}) AS ${nodeCountId}`);
    }

    subquery.push(matchStmt);
    queryContext.add(nodeCountId);

    if (node.children.length > 0) {
      queryContext.add(nodeCollectionId);
      subquery.push("\tWHERE");
      subquery.push(getFilterTree(node));
      returnVars.push(`${nodeCollectionId}`);
    }

    subquery.push(
      "\tWITH " + withVars.join(", "),
      "\tRETURN " + returnVars.join(", "),
      "}"
    );

    subquery.push(
      `WITH ${Array.from(termContext).join(", ")}` +
        (queryContext.size > 0
          ? `, ${Array.from(queryContext).join(", ")}`
          : "")
    );
    statements.push(subquery.join("\n"));

    if (node.children.length > 0) {
      node.children.forEach((child, idx) => {
        // We don't need this node's collection once we've reached its last child, so free up the query context
        if (idx === node.children.length - 1) {
          queryContext.delete(nodeCollectionId);
        }
        getSubqueryFromNode(child, node);
      });
    }
  };

  getDistinctTermSubqueries(tree);
  // The root node of the tree -- which is always a term node -- should have either one or zero children. Since we pre-fetch all terms in
  // the tree, start building the rest of the query from the root node's child if it has one.
  if (tree.children.length > 0) {
    getSubqueryFromNode(tree.children[0], tree);
  }
  statements.push(
    "RETURN {",
    Array.from(queryContext)
      .filter((val) => val.endsWith("-count`"))
      .map((val) => `\t${val.split("-count`")[0]}\`: ${val}`)
      .join(",\n"),
    `} AS counts`
  );
  return statements.join("\n");
};

const getRelevantIdCounts = (
  treeParseResult: TreeParseResult,
  targetNodeId?: string
) => {
  const idCounts = new Map<string, number>();
  treeParseResult.patterns.forEach((pattern) => {
    (
      pattern
        .match(UUID_REGEX)
        ?.filter((match) => treeParseResult.nodeIds.has(match)) || []
    ).forEach((nodeIdMatch) => {
      const currCount = idCounts.get(nodeIdMatch);
      if (currCount !== undefined) {
        idCounts.set(nodeIdMatch, currCount + 1);
      } else {
        idCounts.set(nodeIdMatch, 1);
      }
    });
  });
  return new Map<string, number>([
    ...Array.from(idCounts.entries()).filter(
      ([id, count]) => id === targetNodeId || count > 1
    ),
  ]);
};

export const getOptimizedMatches = (
  treeParseResult: TreeParseResult,
  targetNodeId?: string,
  keepTargetInWorkingSet = false
): string[] => {
  const relevantIdCounts = getRelevantIdCounts(treeParseResult, targetNodeId);
  const workingSet = new Set<string>();
  const queryStmts: string[] = [];

  const decrementIdCount = (id: string) => {
    if (keepTargetInWorkingSet && id === targetNodeId && !workingSet.has(id)) {
      workingSet.add(id);
      return;
    }

    const currentCount = relevantIdCounts.get(id);
    if (currentCount !== undefined) {
      const newCount = currentCount - 1;
      relevantIdCounts.set(id, newCount);

      if (newCount > 0) {
        workingSet.add(id);
      } else {
        relevantIdCounts.delete(id);
        workingSet.delete(id);
      }
    }
  };

  treeParseResult.patterns.forEach((pattern) => {
    let trimmedPattern = pattern;
    pattern
      .match(UUID_REGEX)
      ?.filter((match) => !relevantIdCounts.has(match))
      .forEach((irrelevantId) => {
        trimmedPattern = trimmedPattern.replace(`\`${irrelevantId}\``, "");
      });
    const idMatches = trimmedPattern.match(UUID_REGEX) || [];
    const countable = !trimmedPattern.includes("{"); // Can't use COUNT efficiently if the pattern uses filters

    if (countable && idMatches.length === 1 && workingSet.size > 0) {
      // If there is only one id in the pattern, we can filter rows by using the count store on the relationship to the other node,
      // rather than a standard match
      const countPattern = trimmedPattern.replace(/\(:[a-zA-Z]+\)/, "()");
      queryStmts.push(`WHERE COUNT {${countPattern}} > 0`);
    } else {
      // Otherwise we have to perform a standard match
      queryStmts.push(`MATCH ${trimmedPattern}`);
    }

    idMatches.forEach(decrementIdCount);

    if (workingSet.size > 0) {
      queryStmts.push(
        `WITH DISTINCT ${Array.from(workingSet)
          .map(escapeCypherString)
          .join(", ")}`
      );
    }
  });

  return queryStmts;
};

const getCnxnQueryReturnObjects = (
  treeParseResult: TreeParseResult,
  node: PathwayNode,
  direction: Direction,
  nodeIdParam: string
) => {
  const connectionObjects: string[] = [];
  const CONNECTIONS =
    direction === Direction.INCOMING
      ? UNIQUE_PAIR_INCOMING_CONNECTIONS
      : UNIQUE_PAIR_OUTGOING_CONNECTIONS;
  const filteredCnxns =
    direction === Direction.INCOMING
      ? treeParseResult.incomingCnxns
      : treeParseResult.outgoingCnxns;

  for (const [relationship, label] of Array.from(
    CONNECTIONS.get(node.label)?.entries() || []
  )) {
    // Skip this connection if it already exists for this node
    if (
      // filteredCnxns can be a mix of unique and non-unique relationship types
      filteredCnxns.get(node.id)?.get(relationship)?.includes(label) ||
      filteredCnxns
        .get(node.id)
        ?.get(UNIQUE_TO_GENERIC_REL.get(relationship) || "Unknown")
        ?.includes(label)
    ) {
      continue;
    }

    const whereCnxnStmt = `WHERE COUNT {${createConnectionPattern(
      "n", // Just use a placeholder var name since this WHERE clause is going to be used as an `any` predicate below
      direction,
      undefined,
      relationship
    )}} > 0`;

    const connectedNodeId = v4();
    const connectedEdgeId = v4();
    const escapedNodeId = escapeCypherString(node.id);
    connectionObjects.push(
      [
        "\t\t{",
        `\t\texists: any(n IN collect(${escapedNodeId}) ${whereCnxnStmt}),`,
        `\t\tnodeId: "${connectedNodeId}",`,
        `\t\tlabel: "${label}",`,
        `\t\tedgeId: "${connectedEdgeId}",`,
        `\t\ttype: "${relationship}",`,
        `\t\tsource: ${
          direction === Direction.INCOMING
            ? `"${connectedNodeId}"`
            : `$${nodeIdParam}`
        },`,
        `\t\ttarget: ${
          direction === Direction.INCOMING
            ? `$${nodeIdParam}`
            : `"${connectedNodeId}"`
        },`,
        `\t\tdirection: "${direction}"`,
        "\t}",
      ].join("\n\t")
    );
  }

  return connectionObjects;
};

export const getConnectionQueryFromTree = (
  treeParseResult: TreeParseResult,
  tree: PathwayNode,
  targetNode: PathwayNode,
  targetNodeIdParam: string
) => {
  const statements: string[] = [];
  const queryContext = new Set<string>();

  const getFilterTree = (root: PathwayNode): string => {
    const expressions: string[] = [];

    const getExpression = (
      currentExpression: string,
      node: PathwayNode,
      parent?: PathwayNode
    ) => {
      let pattern = "";
      if (node.parentRelationship !== undefined && parent !== undefined) {
        const relIsIncoming =
          node.parentRelationship.direction === Direction.INCOMING;
        const type = relIsIncoming
          ? getUniqueTypeFromNodes(node.label, parent.label)
          : getUniqueTypeFromNodes(parent.label, node.label);
        pattern = `${relIsIncoming ? "<" : ""}-[:${type}${
          node.parentRelationship.props !== undefined &&
          Object.keys(node.parentRelationship.props).length > 0
            ? " " + createPropReprStr(node.parentRelationship.props)
            : ""
        }]-${!relIsIncoming ? ">" : ""}(:${getSafeLabel(node.label)}${
          node.props !== undefined && Object.keys(node.props).length > 0
            ? " " + createPropReprStr(node.props)
            : ""
        })`;
      }

      if (node.children.length > 0) {
        node.children.forEach((child) =>
          getExpression(currentExpression + pattern, child, node)
        );
      } else {
        expressions.push(currentExpression + pattern);
      }
    };
    getExpression(`\t\t(${escapeCypherString(root.id)})`, root);
    return expressions.join(" AND\n");
  };

  const getSubqueryFromNode = (
    node: PathwayNode,
    parent: PathwayNode | undefined
  ): boolean => {
    if (node.children.length === 0 && node.id !== targetNode.id) {
      return false;
    }

    let subquery = ["CALL {"];
    const escapedNodeId = escapeCypherString(node.id);
    const nodeCollectionId = escapeCypherString(node.id + "-coll");
    let matchStmt = "\tMATCH ";

    if (node.parentRelationship !== undefined && parent !== undefined) {
      const parentCollectionId = escapeCypherString(parent.id + "-coll");
      const escapedParentId = escapeCypherString(parent.id);
      const relIsIncoming =
        node.parentRelationship.direction === Direction.INCOMING;
      const type = relIsIncoming
        ? getUniqueTypeFromNodes(node.label, parent.label)
        : getUniqueTypeFromNodes(parent.label, node.label);

      subquery.push(
        `\tWITH ${parentCollectionId}`,
        `\tUNWIND ${parentCollectionId} AS ${escapedParentId}`
      );
      matchStmt += `(${escapedParentId})${relIsIncoming ? "<" : ""}-[:${type}${
        node.parentRelationship.props !== undefined &&
        Object.keys(node.parentRelationship.props).length > 0
          ? " " + createPropReprStr(node.parentRelationship.props)
          : ""
      }]-${!relIsIncoming ? ">" : ""}`;
    }

    matchStmt += `(${escapedNodeId}:${getSafeLabel(node.label)}${
      node.props !== undefined && Object.keys(node.props).length > 0
        ? " " + createPropReprStr(node.props)
        : ""
    })`;
    subquery.push(matchStmt);

    if (node.children.length > 0) {
      subquery.push("\tWHERE");
      subquery.push(getFilterTree(node));
    }

    // Target node returns a final result distinct from intermediate nodes
    if (node.id === targetNode.id) {
      subquery.push(
        `\tRETURN [`,
        [
          ...getCnxnQueryReturnObjects(
            treeParseResult,
            node,
            Direction.INCOMING,
            targetNodeIdParam
          ),
          ...getCnxnQueryReturnObjects(
            treeParseResult,
            node,
            Direction.OUTGOING,
            targetNodeIdParam
          ),
        ].join(",\n"),
        "\t] AS result",
        "}"
      );
      statements.unshift(subquery.join("\n"));
      return true;
    } else {
      // At this point we know that:
      // - This node has children
      // - It isn't the target
      queryContext.add(nodeCollectionId);
      subquery.push(
        `\tWITH collect(DISTINCT ${escapedNodeId}) AS ${nodeCollectionId}`,
        `\tRETURN ${nodeCollectionId}`,
        "}"
      );

      if (queryContext.size > 0) {
        subquery.push(`WITH ${Array.from(queryContext).join(", ")}`);
      }

      let foundTarget = false;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];

        // We don't need this node's collection once we've reached its last child, so free up the query context
        if (i === node.children.length - 1) {
          queryContext.delete(nodeCollectionId);
        }

        foundTarget = getSubqueryFromNode(child, node);

        if (foundTarget) {
          statements.unshift(subquery.join("\n"));
          return true; // Early exit if we found the target node among this node's descendants
        }
      }
      return false; // The target node was never found
    }
  };

  getSubqueryFromNode(tree, undefined);
  statements.push("RETURN result");
  return statements.join("\n");
};
