export interface SchemaNodeData {
  id: string;
  label: string;
}

export interface SchemaEdgeData {
  id: string;
  label: string;
  source: string;
  target: string;
}

export type SchemaData = SchemaNodeData | SchemaEdgeData;
