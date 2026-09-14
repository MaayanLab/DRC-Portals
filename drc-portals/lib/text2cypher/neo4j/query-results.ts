import type cytoscape from "cytoscape";

import { TEXT_2_CYPHER_NODE_LABEL } from "@/lib/text2cypher/constants/cy/styles/defaults";
import { getActiveSchemaDefinition } from "@/lib/text2cypher/schema/active";

export type QueryResultProperties = Record<string, unknown>;

export interface QueryResultNode {
  id: string;
  label: string;
  properties: QueryResultProperties;
}

export interface QueryResultEdge {
  type: string;
  source: string;
  target: string;
  properties: QueryResultProperties;
}

export interface QueryResultData {
  nodes: QueryResultNode[];
  edges: QueryResultEdge[];
}

export interface QueryResultMergeSummary {
  data: QueryResultData;
  finalNodeCount: number;
  wasTruncated: boolean;
  truncatedNodeCount: number;
  addedNodeCount: number;
}

export type QueryTableRow = Record<string, unknown>;

const EMPTY_RESULT_DATA: QueryResultData = {
  nodes: [],
  edges: [],
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asProperties = (value: unknown): QueryResultProperties =>
  isObject(value) ? value : {};

const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

const asArray = (value: unknown): unknown[] => (isArray(value) ? value : []);

const asString = (value: unknown): string | null => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return null;
};

const getNodeId = (
  entry: Record<string, unknown>,
  properties: QueryResultProperties,
  fallback: string,
) => {
  return (
    asString(entry.elementId) ??
    asString(entry.identity) ??
    asString(entry.id) ??
    asString(properties.id) ??
    asString(properties.local_id) ??
    asString(properties.name) ??
    fallback
  );
};

const getNodeLabel = (entry: Record<string, unknown>, fallback: string) => {
  return (
    (asArray(entry.labels).map(asString).filter(Boolean)[0] as string) ??
    entry.label ??
    fallback
  );
};

const normalizeNode = (
  value: unknown,
  index: number,
): QueryResultNode | null => {
  if (!isObject(value)) {
    return null;
  }

  const label = getNodeLabel(value, `Node${index}`);
  const properties = asProperties(value.properties);

  return {
    id: getNodeId(value, properties, `${label}:${index}`),
    label,
    properties,
  };
};

const normalizeEdge = (value: unknown): QueryResultEdge | null => {
  if (!isObject(value)) {
    return null;
  }

  const type = asString(value.type);
  const source = asString(value.startNodeElementId) ?? asString(value.source);
  const target = asString(value.endNodeElementId) ?? asString(value.target);

  // Type can be an empty string, but source and target must be present for a valid edge.
  if (type === null || !source || !target) {
    return null;
  }

  return {
    type,
    source,
    target,
    properties: asProperties(value.properties),
  };
};

export const normalizeGraphQueryResult = (
  rows: Record<string, unknown>[] | null | undefined,
): QueryResultData | null => {
  const activeSchema = getActiveSchemaDefinition();

  if (!rows || rows.length === 0) {
    return null;
  }

  const nodesById = new Map<string, QueryResultNode>();
  const edgesByKey = new Map<string, QueryResultEdge>();

  rows.forEach((row) => {
    const rawNodes = Array.isArray(row.nodes) ? row.nodes : [];
    const rawEdges = Array.isArray(row.edges) ? row.edges : [];

    rawNodes.forEach((node, index) => {
      const normalizedNode = normalizeNode(node, index);
      if (normalizedNode) {
        nodesById.set(normalizedNode.id, normalizedNode);
      }
    });

    rawEdges
      .filter(
        (edge) =>
          activeSchema.relationships.includes(asString(edge.type) ?? "") ||
          edge.isSynthetic === true,
      )
      .forEach((edge) => {
        const normalizedEdge = normalizeEdge(edge);
        if (normalizedEdge) {
          const key = `${normalizedEdge.source}:${normalizedEdge.type}:${normalizedEdge.target}:${JSON.stringify(normalizedEdge.properties)}`;
          edgesByKey.set(key, normalizedEdge);
        }
      });
  });

  if (nodesById.size === 0 && edgesByKey.size === 0) {
    return null;
  }

  return {
    nodes: Array.from(nodesById.values()),
    edges: Array.from(edgesByKey.values()),
  };
};

export const getEmptyQueryResultData = (): QueryResultData => EMPTY_RESULT_DATA;

const edgeIdentity = (edge: QueryResultEdge) => {
  return `${edge.source}:${edge.type}:${edge.target}:${JSON.stringify(edge.properties)}`;
};

export const mergeQueryResultDataWithNodeLimit = (
  existing: QueryResultData | null | undefined,
  incoming: QueryResultData | null | undefined,
  maxNodes: number,
): QueryResultMergeSummary => {
  const existingData = existing ?? EMPTY_RESULT_DATA;
  const incomingData = incoming ?? EMPTY_RESULT_DATA;

  const boundedMaxNodes = Math.max(0, Math.floor(maxNodes));
  const existingNodes = existingData.nodes;
  const incomingNodes = incomingData.nodes;

  const keptNodes: QueryResultNode[] = [];
  const keptNodeIds = new Set<string>();

  for (const node of existingNodes) {
    if (keptNodeIds.has(node.id) || keptNodes.length >= boundedMaxNodes) {
      continue;
    }

    keptNodes.push(node);
    keptNodeIds.add(node.id);
  }

  let addedNodeCount = 0;
  let truncatedNodeCount = 0;

  for (const node of incomingNodes) {
    if (keptNodeIds.has(node.id)) {
      continue;
    }

    if (keptNodes.length >= boundedMaxNodes) {
      truncatedNodeCount += 1;
      continue;
    }

    keptNodes.push(node);
    keptNodeIds.add(node.id);
    addedNodeCount += 1;
  }

  const dedupedEdgesById = new Map<string, QueryResultEdge>();

  [...existingData.edges, ...incomingData.edges].forEach((edge) => {
    if (!keptNodeIds.has(edge.source) || !keptNodeIds.has(edge.target)) {
      return;
    }

    dedupedEdgesById.set(edgeIdentity(edge), edge);
  });

  return {
    data: {
      nodes: keptNodes,
      edges: Array.from(dedupedEdgesById.values()),
    },
    finalNodeCount: keptNodes.length,
    wasTruncated: truncatedNodeCount > 0,
    truncatedNodeCount,
    addedNodeCount,
  };
};

export const queryResultDataToTableRows = (
  data: QueryResultData | null | undefined,
): QueryTableRow[] => {
  if (!data) {
    return [];
  }

  return [
    ...data.nodes.map((node) => ({
      kind: "node",
      id: node.id,
      label: node.label,
      properties: node.properties,
    })),
    ...data.edges.map((edge) => ({
      kind: "edge",
      type: edge.type,
      source: edge.source,
      target: edge.target,
      properties: edge.properties,
    })),
  ];
};

const getNodeDisplayLabel = (node: QueryResultNode) => {
  const activeSchema = getActiveSchemaDefinition();
  let displayProperty = activeSchema.displayPropertyMap.get(node.label);

  if (
    displayProperty === undefined &&
    node.label === TEXT_2_CYPHER_NODE_LABEL
  ) {
    displayProperty = "value";
  }

  const displayValue = displayProperty
    ? node.properties[displayProperty]
    : undefined;

  return asString(displayValue) ?? node.label;
};

export const queryResultDataToCytoscapeElements = (
  data: QueryResultData | null | undefined,
): cytoscape.ElementDefinition[] => {
  const activeSchema = getActiveSchemaDefinition();

  if (!data) {
    return [];
  }

  return [
    ...data.nodes.map((node) => ({
      classes: [activeSchema.nodeClassMap.get(node.label) || ""].filter(
        Boolean,
      ),
      data: {
        id: node.id,
        label: node.label,
        displayLabel: getNodeDisplayLabel(node),
        properties: node.properties,
      },
    })),
    ...data.edges.map((edge) => ({
      data: {
        type: edge.type,
        source: edge.source,
        target: edge.target,
        properties: edge.properties,
      },
    })),
  ];
};
