import cytoscape from "cytoscape";

import { getNodeColor, DEFAULT_NODE_BADGE_COLOR } from "./styles";

export interface CytoscapeOverviewNodeCount {
  label: string;
  count: number;
  color?: string;
}

export interface CytoscapeOverviewRelationshipCount {
  type: string;
  count: number;
}

export interface CytoscapeInfoDrawerOverview {
  nodeLabels: CytoscapeOverviewNodeCount[];
  relationshipTypes: CytoscapeOverviewRelationshipCount[];
  totalNodes: number;
  totalRelationships: number;
}

export interface CytoscapeLegendNodeItem {
  label: string;
  color: string;
}

export interface CytoscapeLegendAggregation {
  nodeItems: CytoscapeLegendNodeItem[];
  hasEdges: boolean;
}

const asObject = (value: unknown): Record<string, unknown> | null => {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
};

const asNonEmptyString = (value: unknown): string | null => {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
};

const compareAlphabetically = (left: string, right: string) =>
  left.localeCompare(right, undefined, {
    sensitivity: "base",
    numeric: true,
  });

const getNodeLabel = (data: Record<string, unknown>): string | null => {
  return asNonEmptyString(data.label);
};

const getRelationshipType = (data: Record<string, unknown>): string | null => {
  return asNonEmptyString(data.type);
};

const isRelationshipElement = (data: Record<string, unknown>): boolean => {
  return (
    asNonEmptyString(data.source) !== null &&
    asNonEmptyString(data.target) !== null
  );
};

export const buildOverviewFromElements = (
  elements: cytoscape.ElementDefinition[],
): CytoscapeInfoDrawerOverview => {
  const nodeCounts = new Map<string, number>();
  const nodeColors = new Map<string, string>();
  const relationshipCounts = new Map<string, number>();

  elements.forEach((element) => {
    const data = asObject(element.data);
    if (data === null) {
      return;
    }

    if (isRelationshipElement(data)) {
      const relationshipType = getRelationshipType(data);
      if (relationshipType !== null) {
        relationshipCounts.set(
          relationshipType,
          (relationshipCounts.get(relationshipType) ?? 0) + 1,
        );
      }
      return;
    }

    const nodeLabel = getNodeLabel(data);
    if (nodeLabel === null) {
      return;
    }

    nodeCounts.set(nodeLabel, (nodeCounts.get(nodeLabel) ?? 0) + 1);

    if (!nodeColors.has(nodeLabel)) {
      nodeColors.set(nodeLabel, getNodeColor(element));
    }
  });

  const nodeLabels = Array.from(nodeCounts.entries())
    .sort(([labelA], [labelB]) => compareAlphabetically(labelA, labelB))
    .map(([label, count]) => ({
      label,
      count,
      color: nodeColors.get(label) ?? DEFAULT_NODE_BADGE_COLOR,
    }));

  const relationshipTypes = Array.from(relationshipCounts.entries())
    .sort(([typeA], [typeB]) => compareAlphabetically(typeA, typeB))
    .map(([type, count]) => ({ type, count }));

  return {
    nodeLabels,
    relationshipTypes,
    totalNodes: nodeLabels.reduce((sum, item) => sum + item.count, 0),
    totalRelationships: relationshipTypes.reduce(
      (sum, item) => sum + item.count,
      0,
    ),
  };
};

export const buildLegendFromElements = (
  elements: cytoscape.ElementDefinition[],
): CytoscapeLegendAggregation => {
  const seenNodeLabels = new Set<string>();
  const nodeItems: CytoscapeLegendNodeItem[] = [];
  let hasEdges = false;

  elements.forEach((element) => {
    const data = asObject(element.data);
    if (data === null) {
      return;
    }

    if (isRelationshipElement(data)) {
      hasEdges = true;
      return;
    }

    const label = getNodeLabel(data);
    if (label === null || seenNodeLabels.has(label)) {
      return;
    }

    seenNodeLabels.add(label);
    nodeItems.push({ label, color: getNodeColor(element) });
  });

  return { nodeItems, hasEdges };
};
