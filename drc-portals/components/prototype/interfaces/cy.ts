import {
  EdgeDataDefinition,
  EdgeDefinition,
  EventHandler,
  EventNames,
  EventObject,
  EventObjectEdge,
  EventObjectNode,
  NodeDataDefinition,
  NodeDefinition,
  Selector,
} from "cytoscape";
import { ReactNode } from "react";

export interface CxtMenuItem {
  renderContent: (event: EventObject) => ReactNode;
  key: string;
  action: (event: EventObject) => void;
  showFn?: (event: EventObject) => boolean;
  children?: (event: EventObject) => CxtMenuItem[];
}

export interface NodeCxtMenuItem extends CxtMenuItem {
  renderContent: (event: EventObjectNode) => ReactNode;
  action: (event: EventObjectNode) => void;
  showFn?: (event: EventObjectNode) => boolean;
  children?: (event: EventObjectNode) => NodeCxtMenuItem[];
}

export interface EdgeCxtMenuItem extends CxtMenuItem {
  renderContent: (event: EventObjectEdge) => ReactNode;
  action: (event: EventObjectEdge) => void;
  showFn?: (event: EventObjectEdge) => boolean;
  children?: (event: EventObjectEdge) => EdgeCxtMenuItem[];
}

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

export interface CytoscapeEdgeData extends EdgeDataDefinition {
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
  target: Selector;
  // TODO: Could require additional params here for the CytoscapeChart component objects (e.g. the tooltipPositionRef, popperRef, etc.)
  callback: EventHandler;
}
