// @ts-ignore
import parser from "lucene-query-parser";
import { v4 } from "uuid";

import {
  ALL_PROPERTY_NAMES,
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

const createPropPredicates = (
  varName: string,
  props: { [key: string]: any }
): string[] => {
  if (Object.keys(props).length === 0) {
    return [];
  }

  const predicates: string[] = [];

  Object.entries(props).forEach(([key, value]) => {
    if (!ALL_PROPERTY_NAMES.has(key)) {
      throw Error(
        `ValueError: property name ${key} is not a valid C2M2 Neo4j node filter.`
      );
    }
    if (Array.isArray(value)) {
      if (value.length > 0) {
        predicates.push(`${varName}.${key} IN ${JSON.stringify(value)}`);
      }
    } else {
      predicates.push(`${varName}.${key} = ${JSON.stringify(value)}`);
    }
  });
  return predicates;
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
  const filterMap = new Map<string, string[]>();
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

      currentPattern += `${relIsIncoming ? "<" : ""}-[${escapedRelId}:${type}]-${!relIsIncoming ? ">" : ""}`;

      if (node.parentRelationship.props !== undefined) {
        filterMap.set(
          node.parentRelationship.id,
          createPropPredicates(escapedRelId, node.parentRelationship.props)
        );
      }

      if (!relIsIncoming) {
        updateCnxns(parent.id, getSafeLabel(node.label), type, outgoingCnxns);
        updateCnxns(node.id, getSafeLabel(parent.label), type, incomingCnxns);
      } else if (relIsIncoming) {
        updateCnxns(parent.id, getSafeLabel(node.label), type, incomingCnxns);
        updateCnxns(node.id, getSafeLabel(parent.label), type, outgoingCnxns);
      }
    }

    const escapedNodeId = escapeCypherString(node.id);
    currentPattern += `(${escapedNodeId}:${getSafeLabel(node.label)})`;

    if (node.props !== undefined) {
      filterMap.set(node.id, createPropPredicates(escapedNodeId, node.props));
    }

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
    filterMap,
    nodeIds,
    relIds,
    nodes,
    outgoingCnxns,
    incomingCnxns,
    usingJoinStmts: Array.from(outgoingCnxns.entries())
      .filter(
        ([_, cnxns]) =>
          Array.from(cnxns.values()).reduce(
            (prev, curr) => curr.length + prev,
            0
          ) > 1
      )
      .map(([key, _]) => `USING JOIN ON ${escapeCypherString(key)}`),
  };
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
  targetNodeId?: string
): string[] => {
  const relevantIdCounts = getRelevantIdCounts(treeParseResult, targetNodeId);
  const workingSet = new Set<string>();
  const queryStmts: string[] = [];

  const decrementIdCount = (id: string) => {
    if (id === targetNodeId && !workingSet.has(id)) {
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
    const patternMatchFilters: string[] = [];
    pattern
      .match(UUID_REGEX)
      ?.filter((match) => !relevantIdCounts.has(match))
      .forEach((irrelevantId) => {
        trimmedPattern = trimmedPattern.replace(`\`${irrelevantId}\``, "");
        patternMatchFilters.push(
          ...(treeParseResult.filterMap.get(irrelevantId) || [])
        );
      });
    const idMatches = trimmedPattern.match(UUID_REGEX) || [];

    if (idMatches.length === 1 && workingSet.size > 0) {
      // If there is only one id in the pattern, we can filter rows by using the count store on the relationship to the other node,
      // rather than a standard match
      const countPattern = trimmedPattern.replace(/\(:[a-zA-Z]+\)/, "()");
      queryStmts.push(`WHERE COUNT {${countPattern}} > 0`);
    } else {
      // Otherwise we have to perform a standard match

      // Make sure to add filters if they exist
      idMatches.forEach((match) => {
        // If we haven't already added the id to the working set, we need to apply its filters because we haven't seen it yet
        if (!workingSet.has(match)) {
          patternMatchFilters.push(
            ...(treeParseResult.filterMap.get(match) || [])
          );
        }
      });

      queryStmts.push(
        `MATCH ${trimmedPattern}`,
        ...(patternMatchFilters.length > 0
          ? ["WHERE", patternMatchFilters.join(" AND ")]
          : [])
      );
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
  nodeIdParam: string,
  targetCollectionAlias: string
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
    connectionObjects.push(
      [
        "\t\t{",
        `\t\texists: any(n IN ${targetCollectionAlias} ${whereCnxnStmt}),`,
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

export const getSingleMatchConnectionQuery = (
  treeParseResult: TreeParseResult,
  node: PathwayNode,
  targetNodeIdParam: string,
  usingJoin = false
): string => {
  const targetCollectionAlias = "coll";
  const usingJoinStmts = usingJoin ? treeParseResult.usingJoinStmts : [];
  return [
    "MATCH",
    `${treeParseResult.patterns.join(",\n")}`,
    ...usingJoinStmts,
    ...(treeParseResult.filterMap.size > 0
      ? ["WHERE", Array.from(treeParseResult.filterMap.values()).join(" AND ")]
      : []),
    `WITH collect(${escapeCypherString(node.id)}) AS ${targetCollectionAlias}`,
    `RETURN [`,
    [
      ...getCnxnQueryReturnObjects(
        treeParseResult,
        node,
        Direction.INCOMING,
        targetNodeIdParam,
        targetCollectionAlias
      ),
      ...getCnxnQueryReturnObjects(
        treeParseResult,
        node,
        Direction.OUTGOING,
        targetNodeIdParam,
        targetCollectionAlias
      ),
    ].join(",\n"),
    "] AS result",
  ].join("\n");
};
