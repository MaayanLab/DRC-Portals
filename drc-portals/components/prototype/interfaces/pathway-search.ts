import { ReactNode } from "react";

import { Direction } from "@/lib/neo4j/enums";
import { NodeResult } from "@/lib/neo4j/types";

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

export interface ConnectionMenuItem {
  nodeId: string;
  label: string;
  edgeId: string;
  type: string;
  source: string;
  target: string;
  direction: Direction;
}

export interface ColumnData {
  key: string;
  label: string;
  displayProp: string;
  postfix?: number;
  valueGetter: (node: NodeResult, displayProp: string) => ReactNode;
}
