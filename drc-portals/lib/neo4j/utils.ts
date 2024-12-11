// @ts-ignore
import parser from "lucene-query-parser";
import { v4 } from "uuid";

import { UNIQUE_PAIR_OUTGOING_CONNECTIONS, UUID_REGEX } from "./constants";
import {
  PathElement,
  PathwayNode,
  PathwayRelationship,
  RelationshipPathElement,
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

export const neo4jSafeUUID = () => {
  let uuid = v4();
  const alphabets = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ";

  if (/^\d/.test(uuid)) {
    const randomAlphabet =
      alphabets[Math.floor(Math.random() * alphabets.length)];
    uuid = randomAlphabet + uuid.slice(1);
  }

  return uuid.replace(/\-/g, "_");
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

export const createPropReprStr = (props: { [key: string]: any }) => {
  const propStrs: string[] = [];
  Object.entries(props).forEach(([key, value]) => {
    propStrs.push(`${key}: ${JSON.stringify(value)}`);
  });
  return `{${propStrs.join(", ")}}`;
};

export const isRelationshipElement = (
  option: PathElement
): option is RelationshipPathElement => {
  return (option as RelationshipPathElement).direction !== undefined;
};

export const getParamsForBrowser = (params: Object) => {
  return `:param [{${Object.keys(params).join(
    ", "
  )}}] => { RETURN ${Object.entries(params)
    .map(([key, value]) => {
      if (typeof value === "number") {
        return `${value} AS ${key}`;
      } else if (typeof value === "string") {
        return `"${value}" AS ${key}`;
      } else if (Array.isArray(value)) {
        return `[${value
          .map((v) => {
            if (typeof v === "number") {
              return `${v}`;
            } else if (typeof v === "string") {
              return `"${value}"`;
            }
          })
          .join(", ")}] AS ${key}`;
      }
    })
    .join(", ")} }`;
};

export const isPathwayRelationshipElement = (
  element: PathwayNode | PathwayRelationship
): element is PathwayRelationship => {
  return (element as PathwayRelationship).direction !== undefined;
};

export const getUniqueTypeFromNodes = (source: string, dest: string) => {
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

export const parsePathwayTree = (tree: PathwayNode): TreeParseResult => {
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
      const uniqType = relIsIncoming
        ? getUniqueTypeFromNodes(node.label, parent.label)
        : getUniqueTypeFromNodes(parent.label, node.label);
      const escapedRelId = escapeCypherString(node.parentRelationship.id);
      relIds.add(node.parentRelationship.id);

      currentPattern += `${
        relIsIncoming ? "<" : ""
      }-[${escapedRelId}:${uniqType}${
        node.parentRelationship.props !== undefined &&
        Object.keys(node.parentRelationship.props).length > 0
          ? " " + createPropReprStr(node.parentRelationship.props)
          : ""
      }]-${!relIsIncoming ? ">" : ""}`;

      if (!relIsIncoming) {
        updateCnxns(parent.id, node.label, uniqType, outgoingCnxns);
        updateCnxns(
          node.id,
          parent.label,
          node.parentRelationship.type,
          incomingCnxns
        );
      } else if (relIsIncoming) {
        updateCnxns(
          parent.id,
          node.label,
          node.parentRelationship.type,
          incomingCnxns
        );
        updateCnxns(
          node.id,
          parent.label,
          node.parentRelationship.type,
          outgoingCnxns
        );
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
      node.children.forEach((child) => {
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

export const getRelevantIdCounts = (
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
