import { Css, Position, StylesheetStyle } from "cytoscape";

const projectPointOntoLine = (
  s: Position,
  t: Position,
  c: Position,
): { weight: number; intersection: Position; distance: number } => {
  const st = { x: t.x - s.x, y: t.y - s.y };
  const sc = { x: c.x - s.x, y: c.y - s.y };

  const denominator = st.x * st.x + st.y * st.y;

  // Handle degenerate case: line has zero length
  if (denominator === 0) {
    return {
      weight: 0,
      intersection: { x: s.x, y: s.y },
      distance: Math.sqrt(sc.x * sc.x + sc.y * sc.y),
    };
  }

  const weight = (sc.x * st.x + sc.y * st.y) / denominator;

  const intersection = {
    x: s.x + weight * st.x,
    y: s.y + weight * st.y,
  };

  const dx = c.x - intersection.x;
  const dy = c.y - intersection.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return { weight, intersection, distance };
};

export const getSegmentPropsWithPoints = (
  source: Position,
  controlPoints: Position[],
  target: Position,
  invertDistances?: boolean[],
) => {
  const invertDistancesResolved =
    invertDistances !== undefined
      ? invertDistances
      : Array(controlPoints.length).fill(false);

  const weights: number[] = [];
  const distances: number[] = [];

  controlPoints.forEach((cp, i) => {
    const { weight, distance } = projectPointOntoLine(source, target, cp);

    weights.push(weight);
    distances.push(distance * (invertDistancesResolved[i] ? -1 : 1));
  });

  return {
    "segment-weights": weights,
    "segment-distances": distances,
  };
};

export const getEdgePoint = (
  origin: Position,
  deg: number,
  r: number,
): Position => {
  const degreesToRads = (deg: number) => (deg * Math.PI) / 180.0;
  return {
    x: origin.x + r * Math.sin(degreesToRads(deg)),
    y: origin.y - r * Math.cos(degreesToRads(deg)),
  };
};

export const TEXT_2_CYPHER_NODE_LABEL = "Text2CypherColumn";
export const CFDE_DARK_BLUE = "#336699";

// Default canvas properties
export const CHART_BG_COLOR = "#f9f9f9";

// Default node properties
const NODE_BORDER_WIDTH = 2;
const NODE_FONT_FAMILY = "arial";
const NODE_DIAMETER = 30;
const NODE_BACKGROUND_COLOR = "#999";

// Default edge properties
const EDGE_WIDTH = 1;
const ARROW_SCALE = 0.5;
export const EDGE_COLOR = "#797979";

// Other Properties
const FONT_SIZE = "4px";
const MAX_NODE_LABEL_WIDTH = 24;
const HIGH_Z_INDEX = 999;
const MIN_ZOOMED_FONT_SIZE = 8;
const SOLID_OPACITY = 1;
const TRANSPARENT_OPACITY = 0.33;

const DEFAULT_NODE_SELECTOR_STYLES: StylesheetStyle[] = [
  {
    selector: "node",
    style: {
      label: "data(displayLabel)",
      height: NODE_DIAMETER,
      width: NODE_DIAMETER,
      shape: "ellipse",
      backgroundColor: NODE_BACKGROUND_COLOR,
      "border-color": CFDE_DARK_BLUE,
      "border-width": 0,
      "font-family": NODE_FONT_FAMILY,
      "font-size": FONT_SIZE,
      "min-zoomed-font-size": MIN_ZOOMED_FONT_SIZE,
      "text-halign": "center",
      "text-valign": "center",
      "text-max-width": `${MAX_NODE_LABEL_WIDTH}px`,
      "text-wrap": "wrap",
    },
  },
  {
    selector: "node:selected",
    style: {
      "border-width": NODE_BORDER_WIDTH,
    },
  },
  {
    selector: "node:active",
    style: {
      "overlay-shape": "ellipse",
    },
  },
];

const DEFAULT_EDGE_SELECTOR_STYLES: StylesheetStyle[] = [
  {
    selector: "edge",
    style: {
      label: "data(type)",
      "arrow-scale": ARROW_SCALE,
      "curve-style": "bezier",
      "target-arrow-shape": "triangle",
      "text-rotation": "autorotate",
      color: EDGE_COLOR,
      width: EDGE_WIDTH,
      "font-size": FONT_SIZE,
      "min-zoomed-font-size": MIN_ZOOMED_FONT_SIZE,
      "text-background-color": CHART_BG_COLOR,
      "text-background-opacity": SOLID_OPACITY,
      // so the transition is selected when its label/name is selected
      "text-events": "yes",
      "text-max-width": `36px`,
      "text-wrap": "wrap",
    },
  },
  {
    selector: "edge:selected",
    style: {
      "target-arrow-color": CFDE_DARK_BLUE,
      "line-color": CFDE_DARK_BLUE,
      "z-index": HIGH_Z_INDEX,
    },
  },
];

const STYLESHEET_CLASSES: StylesheetStyle[] = [
  // Element agnostic classes
  {
    selector: ".transparent",
    style: {
      opacity: TRANSPARENT_OPACITY,
    },
  },
  {
    selector: ".solid",
    style: {
      opacity: SOLID_OPACITY,
    },
  },
  {
    selector: ".hovered",
    style: {
      opacity: SOLID_OPACITY,
      "z-index": HIGH_Z_INDEX,
    },
  },
  // Node specific classes
  {
    selector: "node.dashed",
    style: {
      "border-style": "dashed",
    },
  },
  // Edge specific classes
  {
    selector: "edge.minus-90-loop",
    style: {
      "loop-direction": "-90deg",
    },
  },
  {
    selector: "edge.minus-30-loop",
    style: {
      "loop-direction": "-30deg",
    },
  },
  {
    selector: "edge.30-loop",
    style: {
      "loop-direction": "30deg",
    },
  },
  {
    selector: "edge.90-loop",
    style: {
      "loop-direction": "90deg",
    },
  },
  {
    selector: "edge.horizontal-text",
    style: {
      "text-rotation": 0,
    },
  },
  {
    selector: "edge.no-arrows",
    style: {
      "source-arrow-shape": "none",
      "target-arrow-shape": "none",
    },
  },
  {
    selector: "edge.dashed",
    style: {
      "line-style": "dashed",
    },
  },
  {
    selector: "edge.source-arrow-only",
    style: {
      "source-arrow-shape": "triangle",
      "target-arrow-shape": "none",
    },
  },
];

export const DEFAULT_STYLESHEET: StylesheetStyle[] = [
  ...DEFAULT_NODE_SELECTOR_STYLES,
  ...DEFAULT_EDGE_SELECTOR_STYLES,
  ...STYLESHEET_CLASSES,
];

// The following is a workaround for the fact that the Cytoscape.js type definitions don't include "endpoints" as a valid value for the
// "edge-distances" property. This is a known issue with the type definitions, and this workaround allows us to use "endpoints" without TypeScript errors.
export const EDGE_DIST_ENDPOINTS =
  "endpoints" as unknown as Css.PropertyValueEdge<
    "intersection" | "node-position"
  >;
