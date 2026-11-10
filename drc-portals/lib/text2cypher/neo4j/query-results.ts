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

export type QueryResultRowCell = QueryResultNode | QueryResultEdge | null;

export interface QueryResultRow {
  [column: string]: QueryResultRowCell;
}

export interface QueryRowsParseResult {
  data: QueryResultData | null;
  rows: QueryResultRow[] | null;
  error: string | null;
}

export interface QueryResultMergeSummary {
  data: QueryResultData;
  finalNodeCount: number;
  wasTruncated: boolean;
  truncatedNodeCount: number;
  addedNodeCount: number;
}

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

const isEdgeLike = (value: unknown): value is Record<string, unknown> => {
  if (!isObject(value)) {
    return false;
  }

  const source =
    asString(value.startNodeElementId) ??
    asString(value.source) ??
    asString(value.start);
  const target =
    asString(value.endNodeElementId) ??
    asString(value.target) ??
    asString(value.end);

  return asString(value.type) !== null && Boolean(source) && Boolean(target);
};

export const isQueryResultEdgeCell = (
  value: QueryResultRowCell,
): value is QueryResultEdge => {
  return (
    value !== null &&
    typeof value === "object" &&
    "type" in value &&
    "source" in value &&
    "target" in value &&
    "properties" in value
  );
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
  return parseQueryRowsResult(rows).data;
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

export const getNodeDisplayLabel = (node: QueryResultNode) => {
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

const normalizeRowCell = (
  value: unknown,
  index: number,
): QueryResultRowCell | "invalid" => {
  if (value === null || value === undefined) {
    return null;
  }

  if (isEdgeLike(value)) {
    return normalizeEdge(value);
  }

  const normalizedNode = normalizeNode(value, index);
  if (normalizedNode) {
    return normalizedNode;
  }

  return "invalid";
};

const normalizeQueryResultRow = (value: unknown) => {
  if (!isObject(value)) {
    return {
      row: null,
      error: "rows must contain only object entries.",
    };
  }

  const row: QueryResultRow = {};

  Object.entries(value).forEach(([column, rawCell], index) => {
    const normalizedCell = normalizeRowCell(rawCell, index);

    if (normalizedCell === "invalid") {
      throw new Error(
        `rows contains an invalid value for column \"${column}\".`,
      );
    }

    row[column] = normalizedCell;
  });

  if (Object.keys(row).length === 0) {
    return {
      row: null,
      error: "rows must contain at least one column.",
    };
  }

  return {
    row,
    error: null,
  };
};

const dedupeQueryRowsEntities = (rows: QueryResultRow[]) => {
  const nodesById = new Map<string, QueryResultNode>();
  const edgesByKey = new Map<string, QueryResultEdge>();
  const nodeColumns = new Set<string>();

  rows.forEach((row) => {
    Object.entries(row).forEach(([column, cell]) => {
      if (!cell) {
        return;
      }

      if (isQueryResultEdgeCell(cell)) {
        edgesByKey.set(edgeIdentity(cell), cell);
        return;
      }

      nodesById.set(cell.id, cell);
      nodeColumns.add(column);
    });
  });

  return {
    data: {
      nodes: Array.from(nodesById.values()),
      edges: Array.from(edgesByKey.values()),
    },
    nodeColumns,
  };
};

const getRawQueryRows = (firstResultRow: Record<string, unknown>) => {
  if (isArray(firstResultRow.rows)) {
    return asArray(firstResultRow.rows);
  }

  if (isArray(firstResultRow.path_rows)) {
    return asArray(firstResultRow.path_rows);
  }

  return null;
};

export const getQueryResultRowColumns = (
  rows: QueryResultRow[] | null | undefined,
) => {
  const orderedColumns: string[] = [];
  const seen = new Set<string>();

  (rows ?? []).forEach((row) => {
    Object.keys(row).forEach((column) => {
      if (seen.has(column)) {
        return;
      }

      seen.add(column);
      orderedColumns.push(column);
    });
  });

  return orderedColumns;
};

export const getQueryResultRowNodeColumns = (
  rows: QueryResultRow[] | null | undefined,
) => {
  const allColumns = getQueryResultRowColumns(rows);
  const nodeColumns = new Set<string>();

  (rows ?? []).forEach((row) => {
    Object.entries(row).forEach(([column, cell]) => {
      if (cell !== null && !isQueryResultEdgeCell(cell)) {
        nodeColumns.add(column);
      }
    });
  });

  return allColumns.filter((column) => nodeColumns.has(column));
};

export const getQueryResultRowRelationshipColumns = (
  rows: QueryResultRow[] | null | undefined,
) => {
  const allColumns = getQueryResultRowColumns(rows);
  const relationshipColumns = new Set<string>();

  (rows ?? []).forEach((row) => {
    Object.entries(row).forEach(([column, cell]) => {
      if (isQueryResultEdgeCell(cell)) {
        relationshipColumns.add(column);
      }
    });
  });

  return allColumns.filter((column) => relationshipColumns.has(column));
};

export const queryResultRowsToGraphData = (
  rows: QueryResultRow[] | null | undefined,
): QueryResultData | null => {
  const normalizedRows = rows ?? [];

  if (normalizedRows.length === 0) {
    return EMPTY_RESULT_DATA;
  }

  const deduped = dedupeQueryRowsEntities(normalizedRows);
  return deduped.data.nodes.length === 0 && deduped.data.edges.length === 0
    ? null
    : deduped.data;
};

export const parseQueryRowsResult = (
  rows: Record<string, unknown>[] | null | undefined,
): QueryRowsParseResult => {
  if (!rows || rows.length === 0) {
    return {
      data: null,
      rows: null,
      error: "Query results must return rows.",
    };
  }

  const firstResultRow = rows[0];
  const rawQueryRows = firstResultRow ? getRawQueryRows(firstResultRow) : null;

  if (!rawQueryRows) {
    return {
      data: null,
      rows: null,
      error: "Query results must return rows as an array.",
    };
  }

  if (rawQueryRows.length === 0) {
    return {
      data: EMPTY_RESULT_DATA,
      rows: [],
      error: null,
    };
  }

  const normalizedRows: QueryResultRow[] = [];

  for (const rawRow of rawQueryRows) {
    try {
      const normalized = normalizeQueryResultRow(rawRow);
      if (normalized.error || !normalized.row) {
        return {
          data: null,
          rows: null,
          error: normalized.error,
        };
      }

      normalizedRows.push(normalized.row);
    } catch (error) {
      return {
        data: null,
        rows: null,
        error:
          error instanceof Error ? error.message : "Failed to normalize rows.",
      };
    }
  }

  const data = queryResultRowsToGraphData(normalizedRows);

  return {
    data,
    rows: normalizedRows,
    error: null,
  };
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
