import { Direction } from "@/lib/neo4j/enums";
import { PathwayNode } from "@/lib/neo4j/types";

import { NODE_CLASS_MAP } from "../constants/shared";
import {
  PathwaySearchEdge,
  PathwaySearchEdgeData,
  PathwaySearchNode,
  PathwaySearchNodeData,
} from "../interfaces/pathway-search";
import { PathwaySearchElement } from "../types/pathway-search";

export const isPathwaySearchEdgeElement = (
  element: PathwaySearchElement
): element is PathwaySearchEdge => {
  return (element as PathwaySearchEdge).data.type !== undefined;
};

export const createTree = (elements: PathwaySearchElement[]) => {
  if (elements.length === 0) {
    return undefined;
  }

  if (elements.length === 1) {
    if (isPathwaySearchEdgeElement(elements[0])) {
      console.error(
        "GraphPathway Error: Could not find root node of the pathway."
      );
      return undefined;
    } else {
      const root = elements[0];
      return {
        id: root.data.id,
        label: root.data.dbLabel,
        props:
          root.data.displayLabel === root.data.dbLabel
            ? undefined
            : {
                name: root.data.displayLabel,
              },
        parentRelationship: undefined,
        children: [],
      };
    }
  }

  const sources = new Set<string>();
  const targets = new Set<string>();
  elements
    .filter((el) => isPathwaySearchEdgeElement(el))
    .forEach((edge) => {
      sources.add(edge.data.source);
      targets.add(edge.data.target);
    });
  const rootNodes = sources.difference(targets);

  if (rootNodes.size !== 1) {
    console.error(
      "GraphPathway Error: Could not find root node of the pathway."
    );
    return undefined;
  }

  const root = elements.find(
    (el) => el.data.id === Array.from(rootNodes)[0]
  ) as PathwaySearchNode | undefined;

  if (root === undefined) {
    console.error(
      "GraphPathway Error: Could not find root node of the pathway."
    );
    return undefined;
  }

  const createTreeFromRoot = (root: PathwaySearchNode): PathwayNode => {
    let parentEdge: PathwaySearchEdge | undefined = undefined;
    const childIds = new Set<string>();

    for (const edge of elements.filter((el) =>
      isPathwaySearchEdgeElement(el)
    )) {
      if (edge.data.target === root.data.id) {
        parentEdge = edge;
      }
      if (edge.data.source === root.data.id) {
        childIds.add(edge.data.target);
      }
    }

    return {
      id: root.data.id,
      label: root.data.dbLabel,
      props:
        root.data.displayLabel === root.data.dbLabel
          ? undefined
          : {
              name: root.data.displayLabel,
            },
      parentRelationship:
        parentEdge === undefined
          ? undefined
          : {
              id: parentEdge.data.id,
              type: parentEdge.data.type,
              direction: (parentEdge.classes || []).includes(
                "source-arrow-only"
              )
                ? Direction.INCOMING
                : Direction.OUTGOING,
            },
      children: (
        elements.filter(
          (el) =>
            childIds.has(el.data.id) && // el is a child of the root
            !isPathwaySearchEdgeElement(el) && // el is not an edge
            el.classes?.includes("path-element") // el is part of the path
        ) as PathwaySearchNode[]
      )
        .map((node) => createTreeFromRoot(node))
        .filter((tree) => tree !== undefined),
    };
  };
  return createTreeFromRoot(root);
};

export const createPathwaySearchNode = (
  data: PathwaySearchNodeData,
  classes?: string[]
): PathwaySearchNode => {
  return {
    data,
    classes: [NODE_CLASS_MAP.get(data.dbLabel) || "", ...(classes || [])],
  };
};

export const createPathwaySearchEdge = (
  data: PathwaySearchEdgeData,
  classes?: string[]
): PathwaySearchEdge => {
  return {
    data,
    classes,
  };
};

export const deepCopyPathwaySearchNode = (
  node: PathwaySearchNode,
  data?: Partial<PathwaySearchNodeData>,
  classesToAdd?: string[],
  classesToRemove?: string[]
): PathwaySearchNode => ({
  classes: Array.from(
    new Set([...(node.classes || []), ...(classesToAdd || [])])
  ).filter((c) => {
    return classesToRemove === undefined || !classesToRemove.includes(c);
  }),
  data: { ...node.data, ...data },
});

export const deepCopyPathwaySearchEdge = (
  edge: PathwaySearchEdge,
  data?: Partial<PathwaySearchEdgeData>,
  classesToAdd?: string[],
  classesToRemove?: string[]
): PathwaySearchEdge => ({
  classes: Array.from(
    new Set([...(edge.classes || []), ...(classesToAdd || [])])
  ).filter(
    (c) => classesToRemove === undefined || !classesToRemove.includes(c)
  ),
  data: { ...edge.data, ...data },
});