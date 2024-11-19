export interface PathwaySearchNodeData {
  id: string;
  displayLabel: string;
  dbLabel: string;
  count?: number;
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
  count?: number;
}

export interface PathwaySearchEdge {
  data: PathwaySearchEdgeData;
  classes?: string[];
}
