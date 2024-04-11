import {
  Paper,
  Tooltip,
  TooltipProps,
  styled,
  tooltipClasses,
} from "@mui/material";
import { Css, Stylesheet } from "cytoscape";

import { ColaLayoutOptions } from "../interfaces/cy";

import { ENTITY_STYLES_MAP } from "./shared";

export const ChartContainer = styled(Paper)({
  width: "100%",
  height: "100%",
});

// See the MUI docs for a detailed example: https://mui.com/material-ui/react-tooltip/#customization
export const ChartTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "transparent",
  },
}));

// Default node properties
export const NODE_FONT_SIZE = "14px";
export const NODE_FONT_FAMILY = "arial";
export const NODE_DIAMETER = 125;

// Default edge properties
export const EDGE_COLOR = "#797979";

// Other Properties
export const MAX_NODE_LINES = 3;
export const MAX_NODE_LABEL_WIDTH = 100;
export const MIN_ZOOMED_FONT_SIZE = 8;

export const DEFAULT_LAYOUT: ColaLayoutOptions = {
  name: "cola",
  infinite: true,
  fit: false,
  animate: true,
  maxSimulationTime: 40000,
  edgeLength: 350,
  nodeSpacing: () => 1,
};

export const DEFAULT_STYLESHEET: Stylesheet[] = [
  {
    selector: "node",
    style: {
      shape: "ellipse",
      height: NODE_DIAMETER,
      width: NODE_DIAMETER,
    },
  },
  {
    selector: "node[label]",
    style: {
      label: "data(label)",
      "font-family": NODE_FONT_FAMILY,
      "font-size": NODE_FONT_SIZE,
      color: "#fff",
      "text-halign": "center",
      "text-valign": "center",
      "text-wrap": "wrap",
      "text-max-width": `${MAX_NODE_LABEL_WIDTH}px`,
      "min-zoomed-font-size": MIN_ZOOMED_FONT_SIZE,
    },
  },
  {
    selector: "node:selected",
    style: {
      "border-color": "#336699",
      "border-width": 5,
    },
  },
  {
    selector: "node:active",
    style: {
      // @ts-ignore
      "overlay-shape": "ellipse", // Seems like the @types module hasn't been updated to reflect the current docs, see: https://js.cytoscape.org/#style/overlay
    },
  },
  {
    selector: "edge",
    style: {
      color: EDGE_COLOR,
      "curve-style": "bezier",
      "target-arrow-shape": "triangle",
      width: 1.5,
    },
  },
  {
    selector: "edge[label]",
    style: {
      label: "data(label)",
      "font-size": "10",
      "text-background-opacity": 0,
      // so the transition is selected when its label/name is selected
      "text-events": "yes",
      "min-zoomed-font-size": MIN_ZOOMED_FONT_SIZE,
    },
  },
  ...Array.from(ENTITY_STYLES_MAP.entries()).map(([className, style]) => {
    return {
      selector: `.${className}`,
      style: style as Css.Node,
    };
  }),
];
