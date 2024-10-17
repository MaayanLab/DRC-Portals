export interface PathwaySearchNodeData {
  id: string;
  displayLabel: string;
  dbLabel: string;
}

export interface PathwaySearchNode {
  data: PathwaySearchNodeData;
  classes?: string[];
}

export interface PathwaySearchEdgeData {
  id: string;
  source: string;
  target: string;
  displayLabel: string;
  type: string;
}

export interface PathwaySearchEdge {
  data: PathwaySearchEdgeData;
  classes?: string[];
}
