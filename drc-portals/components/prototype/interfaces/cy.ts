import {
  EdgeDataDefinition,
  EdgeDefinition,
  EventObject,
  EventObjectEdge,
  EventObjectNode,
  NodeDataDefinition,
  NodeDefinition,
} from "cytoscape";

export interface CxtMenuItem {
  fn: (event: EventObject) => void;
  title: string;
  showFn?: (event: EventObject) => boolean;
}

export interface NodeCxtMenuItem extends CxtMenuItem {
  fn: (event: EventObjectNode) => void;
  showFn?: (event: EventObjectNode) => boolean;
}

export interface EdgeCxtMenuItem extends CxtMenuItem {
  fn: (event: EventObjectEdge) => void;
  showFn?: (event: EventObjectEdge) => boolean;
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
