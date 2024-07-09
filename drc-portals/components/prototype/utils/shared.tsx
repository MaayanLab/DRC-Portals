import { Box } from "@mui/material";
import ArrowRightAltRoundedIcon from "@mui/icons-material/ArrowRightAltRounded";
import { CSSProperties } from "react";
import { v4 } from "uuid";

import { EDGE_COLOR } from "../constants/shared";
import { NODE_LABELS, RELATIONSHIP_TYPES } from "../constants/neo4j";
import {
  AnonymousNodeElement,
  DividerContainer,
  ENTITY_STYLES_MAP,
  EntityDivider,
  NODE_CLASS_MAP,
  NODE_DISPLAY_PROPERTY_MAP,
  NodeElement,
  NodeText,
  RelationshipElement,
  RelationshipText,
} from "../constants/shared";
import { Direction } from "../enums/schema-search";
import { NodeResult } from "../interfaces/neo4j";
import {
  NodeElementFactory,
  RelationshipElementFactory,
} from "../types/shared";

export const createNodeElement = (
  label: string,
  text?: string,
  customStyle?: CSSProperties
) => {
  const nodeLabelClass = NODE_CLASS_MAP.get(label);
  const labelStyles =
    nodeLabelClass === undefined
      ? undefined
      : ENTITY_STYLES_MAP.get(nodeLabelClass);
  return (
    <NodeElement key={v4()} style={{ ...labelStyles, ...customStyle }}>
      <NodeText>{text || label}</NodeText>
    </NodeElement>
  );
};

export const getNodeDisplayProperty = (
  label: string,
  node: NodeResult
): string => {
  const displayProp = NODE_DISPLAY_PROPERTY_MAP.get(label) || "name";
  return node.properties[displayProp] || label;
};

export const createLineDividerElement = () => (
  <DividerContainer key={v4()}>
    <EntityDivider></EntityDivider>
  </DividerContainer>
);

export const createArrowDividerElement = (flip: boolean) => (
  <DividerContainer key={v4()}>
    <ArrowRightAltRoundedIcon
      sx={{
        color: EDGE_COLOR,
        transform: flip ? null : "rotate(180deg)",
      }}
    />
  </DividerContainer>
);

export const createRelationshipElement = (
  type: string,
  style?: CSSProperties
) => (
  <RelationshipElement key={v4()} style={style}>
    <RelationshipText>{type}</RelationshipText>
  </RelationshipElement>
);

export const createDirectedRelationshipElement = (
  type: string,
  direction: Direction,
  text?: string,
  style?: CSSProperties
) => (
  <Box key={v4()} sx={{ display: "flex" }}>
    {direction === Direction.OUTGOING || direction === Direction.UNDIRECTED
      ? createLineDividerElement()
      : createArrowDividerElement(false)}
    {createRelationshipElement(text || type, style)}
    {direction === Direction.INCOMING || direction === Direction.UNDIRECTED
      ? createLineDividerElement()
      : createArrowDividerElement(true)}
  </Box>
);

export const createAnonymousNodeElement = () => (
  <AnonymousNodeElement key={v4()}></AnonymousNodeElement>
);

export const LABEL_TO_FACTORY_MAP: ReadonlyMap<string, NodeElementFactory> =
  new Map([
    ...Array.from(NODE_LABELS).map((label): [string, NodeElementFactory] => [
      label,
      createNodeElement,
    ]),
  ]);

export const TYPE_TO_FACTORY_MAP: ReadonlyMap<
  string,
  RelationshipElementFactory
> = new Map([
  ...Array.from(RELATIONSHIP_TYPES).map(
    (type): [string, RelationshipElementFactory] => [
      type,
      createDirectedRelationshipElement,
    ]
  ),
]);

export const labelInFactoryMapFilter = (label: string) => {
  if (!LABEL_TO_FACTORY_MAP.has(label)) {
    console.warn(`Label "${label}" not found in node factory map!`);
    return false;
  }
  return true;
};

export const typeInFactoryMapFilter = (type: string) => {
  if (!TYPE_TO_FACTORY_MAP.has(type)) {
    console.warn(`Type "${type}" not found in relationship factory map!`);
    return false;
  }
  return true;
};

export const factoryExistsFilter = (name: string) => {
  if (!LABEL_TO_FACTORY_MAP.has(name) && !TYPE_TO_FACTORY_MAP.has(name)) {
    console.warn(`Name "${name}" not found in any factory map!`);
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

// The following two functions can be used to decide the appropriate text color for ideal contrast, preferably in advance but also on the
// fly.

export const hexToRgb = (hex: string) => {
  // Remove '#' if present
  hex = hex.replace(/^#/, "");

  // Parse the hex code into RGB components
  const bigint = parseInt(hex, 16);

  // Return RGB values as an object
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
};

export const getContrastText = (rgb: { r: number; g: number; b: number }) => {
  const { r, g, b } = rgb;
  const uicolors = [r / 255, g / 255, b / 255];
  const c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return L > 0.179 ? "#000" : "#fff";
};

export const downloadBlob = (data: string, type: string, filename: string) => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};
