import ArrowRightAltRoundedIcon from "@mui/icons-material/ArrowRightAltRounded";
import { CSSProperties, ReactElement } from "react";
import { v4 } from "uuid";

import { EDGE_COLOR } from "../constants/cy";
import {
  ADMIN_LABELS,
  BIOSAMPLE_RELATED_LABELS,
  CONTAINER_LABELS,
  CORE_LABELS,
  FILE_RELATED_LABELS,
  RELATIONSHIP_TYPES,
  SUBJECT_RELATED_LABELS,
  TERM_LABELS,
} from "../constants/neo4j";
import {
  AnonymousNodeElement,
  DividerContainer,
  EntityDivider,
  EntityText,
  NodeElement,
  RelationshipElement,
} from "../constants/search-bar";
import {
  ADMIN_NODE_CLASS,
  BIOSAMPLE_RELATED_NODE_CLASS,
  CONTAINER_NODE_CLASS,
  CORE_NODE_CLASS,
  ENTITY_STYLES_MAP,
  FILE_RELATED_NODE_CLASS,
  NODE_DISPLAY_PROPERTY_MAP,
  SUBJECT_RELATED_NODE_CLASS,
  TERM_NODE_CLASS,
} from "../constants/shared";
import { NodeResult } from "../interfaces/neo4j";

export type GraphElementFactory = (n: string) => ReactElement;

const createNode = (label: string, style?: CSSProperties) => (
  <NodeElement key={v4()} style={style}>
    <EntityText>{label}</EntityText>
  </NodeElement>
);

export const getNodeDisplayProperty = (label: string, node: NodeResult) => {
  const displayProp = NODE_DISPLAY_PROPERTY_MAP.get(label) || "name";
  return node.properties[displayProp];
};

export const createAdminNode = (label: string) => {
  return createNode(label, ENTITY_STYLES_MAP.get(ADMIN_NODE_CLASS));
};

export const createContainerNode = (label: string) => {
  return createNode(label, ENTITY_STYLES_MAP.get(CONTAINER_NODE_CLASS));
};

export const createTermNode = (label: string) => {
  return createNode(label, ENTITY_STYLES_MAP.get(TERM_NODE_CLASS));
};

export const createCoreNode = (label: string) => {
  return createNode(label, ENTITY_STYLES_MAP.get(CORE_NODE_CLASS));
};

export const createFileRelatedNode = (label: string) => {
  return createNode(label, ENTITY_STYLES_MAP.get(FILE_RELATED_NODE_CLASS));
};

export const createSubjectRelatedNode = (label: string) => {
  return createNode(label, ENTITY_STYLES_MAP.get(SUBJECT_RELATED_NODE_CLASS));
};

export const createBiosampleRelatedNode = (label: string) => {
  return createNode(label, ENTITY_STYLES_MAP.get(BIOSAMPLE_RELATED_NODE_CLASS));
};

export const createRelationship = (type: string) => (
  <RelationshipElement key={v4()}>
    <EntityText>{type}</EntityText>
  </RelationshipElement>
);

export const createAnonymousNode = () => (
  <AnonymousNodeElement key={v4()}></AnonymousNodeElement>
);

export const createLineDivider = () => (
  <DividerContainer key={v4()}>
    <EntityDivider></EntityDivider>
  </DividerContainer>
);

export const createArrowDivider = () => (
  <DividerContainer key={v4()}>
    <ArrowRightAltRoundedIcon sx={{ color: EDGE_COLOR }} />
  </DividerContainer>
);

// Note there is a very small chance for a problem here: a node label can never conflict with a relationship type. This is unlikely to ever
// happen, but it's probably worth being aware of.
export const ENTITY_TO_FACTORY_MAP: ReadonlyMap<string, GraphElementFactory> =
  new Map([
    ...ADMIN_LABELS.map((label): [string, GraphElementFactory] => [
      label,
      createAdminNode,
    ]),
    ...CONTAINER_LABELS.map((label): [string, GraphElementFactory] => [
      label,
      createContainerNode,
    ]),
    ...CORE_LABELS.map((label): [string, GraphElementFactory] => [
      label,
      createCoreNode,
    ]),
    ...TERM_LABELS.map((label): [string, GraphElementFactory] => [
      label,
      createTermNode,
    ]),
    ...FILE_RELATED_LABELS.map((label): [string, GraphElementFactory] => [
      label,
      createFileRelatedNode,
    ]),
    ...SUBJECT_RELATED_LABELS.map((label): [string, GraphElementFactory] => [
      label,
      createSubjectRelatedNode,
    ]),
    ...BIOSAMPLE_RELATED_LABELS.map((label): [string, GraphElementFactory] => [
      label,
      createBiosampleRelatedNode,
    ]),
    ...Array.from(RELATIONSHIP_TYPES).map(
      (label): [string, GraphElementFactory] => [label, createRelationship]
    ),
  ]);

export const keyInFactoryMapFilter = (name: string) => {
  if (!ENTITY_TO_FACTORY_MAP.has(name)) {
    console.warn(`Name "${name}" not found in factory map!`);
    return false;
  }
  return true;
};

export const truncateTextToFitWidth = (
  label: string,
  targetWidth: number,
  fontSize = "inherit",
  fontFamily = "inherit"
) => {
  let container = document.createElement("div");
  container.style.visibility = "hidden";
  container.style.position = "absolute";
  container.style.whiteSpace = "nowrap";
  container.style.font = `${fontSize} ${fontFamily}`;
  container.id = v4();
  container.textContent = label || "";
  document.body.appendChild(container);

  let low = 0;
  let high = label.length - 1;
  let mid;

  // Binary search for the optimal truncation point
  while (low <= high) {
    mid = Math.floor((low + high) / 2);
    container.textContent = label.slice(0, mid + 1) + "...";

    if (container.offsetWidth > targetWidth) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  document.body.removeChild(container);

  // If any characters should be removed return a slice of the label, otherwise just return the label
  return label.length - low ? label.slice(0, low) + "..." : label;
};
