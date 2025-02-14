import {
  EdgeDataDefinition,
  EdgeDefinition,
  EventHandler,
  EventNames,
  NodeDataDefinition,
  NodeDefinition,
  NodeSingular,
  Selector,
} from "cytoscape";
import { ReactNode } from "react";

// TODO: I think we may want to extend this with a more strongly typed version where the props are not optional. For the graph search
// visualizations, it just doesn't make sense for those props to be missing
export interface CytoscapeNodeData extends NodeDataDefinition {
  id: string;
  label?: string;
  neo4j?: {
    labels?: string[];
    properties?: { [key: string]: any };
  };
}

export interface CytoscapeNode extends NodeDefinition {
  data: CytoscapeNodeData;
}

interface CytoscapeEdgeData extends EdgeDataDefinition {
  id: string;
  label?: string;
  neo4j?: {
    type?: string;
    properties?: { [key: string]: any };
  };
}

export interface CytoscapeEdge extends EdgeDefinition {
  data: CytoscapeEdgeData;
}

export interface CytoscapeEvent {
  event: EventNames;
  target?: Selector;
  // TODO: Could require additional params here for the CytoscapeChart component objects (e.g. the tooltipPositionRef, popperRef, etc.)
  callback: EventHandler;
}

export interface ChartRadialMenuPosition {
  x: number;
  y: number;
  r: number;
}

export interface ChartRadialMenuItemProps {
  key: string;
  content: ReactNode;
  onClick: (node: NodeSingular) => void;
}
