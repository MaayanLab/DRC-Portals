// @ts-ignore
import parser from "lucene-query-parser";
import { v4 } from "uuid";

import {
  UNIQUE_PAIR_INCOMING_CONNECTIONS,
  UNIQUE_PAIR_OUTGOING_CONNECTIONS,
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
  // convert any \u0060 to literal backtick, then escape backticks, and finally wrap in single quotes and backticks
  return `\`${input.replace(/\\u0060/g, "`").replace(/`/g, "``")}\``;
};

export const isValidLucene = (input: string) => {
  try {
    parser.parse(input);
  } catch {
    return false;
  }
  return true;
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
        type = node.parentRelationship.type;
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
        updateCnxns(parent.id, node.label, type, outgoingCnxns);
        updateCnxns(node.id, parent.label, type, incomingCnxns);
      } else if (relIsIncoming) {
        updateCnxns(parent.id, node.label, type, incomingCnxns);
        updateCnxns(node.id, parent.label, type, outgoingCnxns);
      }
    }

    const escapedNodeId = escapeCypherString(node.id);
    currentPattern += `(${escapedNodeId}:${node.label}${
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

export const getConnectionQueries = (
  treeParseResult: TreeParseResult,
  node: PathwayNode,
  direction: Direction
) => {
  const connectionQueries: string[] = [];
  const CONNECTIONS =
    direction === Direction.INCOMING
      ? UNIQUE_PAIR_INCOMING_CONNECTIONS
      : UNIQUE_PAIR_OUTGOING_CONNECTIONS;
  const filteredCnxns =
    direction === Direction.INCOMING
      ? treeParseResult.incomingCnxns
      : treeParseResult.outgoingCnxns;
  const queryStmts: string[] = getOptimizedMatches(treeParseResult, node.id);
  let whereCnxnIdx: number | undefined = undefined;

  // Find the first statement where node.id is present and save the index for later use
  queryStmts.forEach((stmt, idx) => {
    if (whereCnxnIdx === undefined && stmt.split(node.id).length > 1) {
      whereCnxnIdx = idx + 1;
    }
  });

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

    const queryStmtsCopy = [...queryStmts];
    if (whereCnxnIdx !== undefined) {
      const whereCnxnStmt = `WHERE COUNT {${createConnectionPattern(
        node.id,
        direction,
        undefined,
        relationship
      )}} > 0`;

      if (whereCnxnIdx === queryStmtsCopy.length) {
        queryStmtsCopy.push(whereCnxnStmt);
      } else {
        queryStmtsCopy.splice(whereCnxnIdx, 0, whereCnxnStmt);
      }
    }

    const connectedNodeId = v4();
    const connectedEdgeId = v4();
    connectionQueries.push(
      [
        ...queryStmtsCopy,
        "RETURN",
        `\t"${connectedNodeId}" AS nodeId, "${label}" AS label,`,
        `\t"${connectedEdgeId}" AS edgeId,`,
        `\t"${relationship}" AS type,`,
        `\t"${
          direction === Direction.INCOMING ? connectedNodeId : node.id
        }" AS source,`,
        `\t"${
          direction === Direction.INCOMING ? node.id : connectedNodeId
        }" AS target,`,
        `\t"${direction}" AS direction`,
        "LIMIT 1",
      ].join("\n")
    );
  }
  return connectionQueries;
};
