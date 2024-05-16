import {
  BaseLayoutOptions,
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

// It doesn't seem like Cytoscape has any built in interfaces for the Cola layout, so we make one based on the defaults specified on the Github repo:
// https://github.com/cytoscape/cytoscape.js-cola?tab=readme-ov-file#api
export interface ColaLayoutOptions extends BaseLayoutOptions {
  animate?: boolean; // whether to show the layout as it's running
  infinite?: boolean; // whether nodes drag each other when dragged (note this isn't on the Github page anymore!)
  refresh?: number; // number of ticks per frame; higher is faster but more jerky
  maxSimulationTime?: number; // max length in ms to run the layout
  ungrabifyWhileSimulating?: boolean; // so you can't drag nodes during layout
  fit?: boolean; // on every layout reposition of nodes, fit the viewport
  padding?: number; // padding around the simulation
  boundingBox?: { x1: number; x2: number; w: number; h: number }; // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  nodeDimensionsIncludeLabels?: boolean; // whether labels should be included in determining the space used by a node

  // positioning options
  randomize?: boolean; // use random node positions at beginning of layout
  avoidOverlap?: boolean; // if true, prevents overlap of node bounding boxes
  handleDisconnected?: boolean; // if true, avoids disconnected components from overlapping
  convergenceThreshold?: 0.01; // when the alpha value (system energy) falls below this value, the layout stops
  nodeSpacing?: (node: any) => number; // extra spacing around nodes
  flow?: any; // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
  alignment?: any; // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
  gapInequalities?: any; // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
  centerGraph?: boolean; // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)

  // different methods of specifying edge length
  edgeLength?: number | ((edge: any) => number); // sets edge length directly in simulation
  edgeSymDiffLength?: number | ((edge: any) => number); // symmetric diff edge length in simulation
  edgeJaccardLength?: number | ((edge: any) => number); // jaccard edge length in simulation

  // iterations of cola algorithm; uses default values on undefined
  unconstrIter?: number; // unconstrained initial layout iterations
  userConstIter?: number; // initial layout iterations with user-specified constraints
  allConstIter?: number; // initial layout iterations with all constraints including non-overlap
}
