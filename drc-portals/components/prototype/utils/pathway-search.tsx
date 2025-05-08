import {
  BIOSAMPLE_LABEL,
  BIOSAMPLE_RELATED_LABELS,
  COLLECTION_LABEL,
  DCC_LABEL,
  FILE_LABEL,
  FILE_RELATED_LABELS,
  ID_NAMESPACE_LABEL,
  PROJECT_LABEL,
  SUBJECT_LABEL,
  SUBJECT_RELATED_LABELS,
  TERM_LABELS,
} from "@/lib/neo4j/constants";
import { Direction } from "@/lib/neo4j/enums";
import { NodeResult, PathwayNode } from "@/lib/neo4j/types";

import { NODE_CLASS_MAP } from "../constants/shared";
import {
  ColumnData,
  PathwaySearchEdge,
  PathwaySearchEdgeData,
  PathwaySearchNode,
  PathwaySearchNodeData,
} from "../interfaces/pathway-search";
import { PathwaySearchElement } from "../types/pathway-search";

import { getExternalLinkElement, getOntologyLink } from "./shared";

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

export const getColumnDataFromTree = (tree: PathwayNode): ColumnData[] => {
  const nodeIds = new Set<string>();
  const nodes: PathwayNode[] = [];

  const getQueryFromTree = (node: PathwayNode) => {
    if (!nodeIds.has(node.id)) {
      nodeIds.add(node.id);
      nodes.push(node);
    }

    if (node.children.length === 0) {
      return;
    } else if (node.children.length === 1) {
      getQueryFromTree(node.children[0]);
    } else {
      node.children
        // Parse children with the fewest children first
        .sort((a, b) => a.children.length - b.children.length)
        .forEach((child) => {
          getQueryFromTree(child);
        });
    }
  };

  // Recursively set the nodes array in tree traversal order
  getQueryFromTree(tree);

  const labelCounts = new Map<string, number>();
  let columns: ColumnData[] = nodes.map((node) => {
    const nodeId = node.id;
    const label = node.label;
    const labelCount = labelCounts.get(label);
    let postfix, valueGetter, displayProp;

    if (labelCount === undefined) {
      postfix = 1;
      labelCounts.set(label, postfix);
    } else {
      postfix = labelCount + 1;
      labelCounts.set(label, postfix);
    }

    const getPropFromNodeResult = (node: NodeResult, property: string) => {
      try {
        return Object.hasOwn(node.properties, property)
          ? String(node.properties[property])
          : "null";
      } catch {
        return "null";
      }
    };

    const linkRegex =
      /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;
    if (
      [
        ...TERM_LABELS,
        ...FILE_RELATED_LABELS,
        ...SUBJECT_RELATED_LABELS,
        ...BIOSAMPLE_RELATED_LABELS,
      ].includes(label)
    ) {
      displayProp = "name";
      valueGetter = (node: NodeResult, displayProp: string) => {
        const displayText = getPropFromNodeResult(node, displayProp);
        const ontologyLink = getOntologyLink(label, node.properties.id);
        return getExternalLinkElement(ontologyLink, displayText);
      };
    } else if ([PROJECT_LABEL, COLLECTION_LABEL, FILE_LABEL].includes(label)) {
      displayProp = "local_id";
      valueGetter = (node: NodeResult, displayProp: string) => {
        const displayText = getPropFromNodeResult(node, displayProp);
        const link =
          node.properties.persistent_id || node.properties.access_url;
        if (link !== undefined && linkRegex.test(link)) {
          return getExternalLinkElement(link, displayText);
        } else {
          return displayText;
        }
      };
    } else if (label === DCC_LABEL) {
      displayProp = "abbreviation";
      valueGetter = (node: NodeResult, displayProp: string) => {
        const url = node.properties.url;
        const displayText = getPropFromNodeResult(node, displayProp);
        if (url !== undefined) {
          if (linkRegex.test(url)) {
            return getExternalLinkElement(url, displayText);
          } else {
            return displayText;
          }
        } else {
          return displayText;
        }
      };
    } else if (label === ID_NAMESPACE_LABEL) {
      displayProp = "name";
      valueGetter = (node: NodeResult, displayProp: string) => {
        const url = node.properties.id;
        const displayText = getPropFromNodeResult(node, displayProp);
        if (url !== undefined) {
          return getExternalLinkElement(url, displayText);
        } else {
          return displayText;
        }
      };
    } else if ([SUBJECT_LABEL, BIOSAMPLE_LABEL].includes(label)) {
      displayProp = "local_id";
      valueGetter = (node: NodeResult, displayProp: string) =>
        getPropFromNodeResult(node, displayProp);
    } else {
      displayProp = "undefined";
      valueGetter = () => "null";
    }

    return {
      key: nodeId,
      label,
      displayProp,
      postfix,
      valueGetter,
    };
  });

  return columns.map((col) => {
    return {
      ...col,
      postfix:
        (labelCounts.get(col.label) as number) === 1 ? undefined : col.postfix,
    };
  });
};

export const getPropertyListFromNodeLabel = (nodeLabel: string) => {
  if (
    [
      ...TERM_LABELS,
      ...FILE_RELATED_LABELS,
      ...SUBJECT_RELATED_LABELS,
      ...BIOSAMPLE_RELATED_LABELS,
    ].includes(nodeLabel)
  ) {
    return ["id", "name"];
  } else if (
    [PROJECT_LABEL, COLLECTION_LABEL, FILE_LABEL].includes(nodeLabel)
  ) {
    return ["persistent_id", "access_url", "local_id"];
  } else if (nodeLabel === DCC_LABEL) {
    return ["name", "abbreviation", "url", "contact_email"];
  } else if (nodeLabel === ID_NAMESPACE_LABEL) {
    return ["name", "abbreviation"];
  } else if ([SUBJECT_LABEL, BIOSAMPLE_LABEL].includes(nodeLabel)) {
    return ["local_id"];
  } else {
    return [];
  }
};
