import { Direction } from "./enums";

export interface NodeResult {
  uuid: string;
  labels: string[];
  properties: { [key: string]: any };
}

export interface RelationshipResult {
  uuid: string;
  type: string;
  properties: { [key: string]: any };
  startUUID: string;
  endUUID: string;
}

export interface SubGraph {
  nodes: NodeResult[];
  relationships: RelationshipResult[];
}

export interface CVTermsResult {
  synonym: string;
  cvTerm: NodeResult;
}

export interface CVTermsWithLabelResult {
  names: string[];
}

interface PathwayRelationship {
  id: string;
  type: string;
  direction: Direction;
  props?: { [key: string]: any };
}

export interface PathwayNode {
  id: string;
  label: string;
  children: PathwayNode[];
  props?: { [key: string]: any };
  parentRelationship?: PathwayRelationship;
}

export interface NodeConnection {
  id: string;
  label: string;
}

export interface EdgeConnection {
  id: string;
  type: string;
  source: string;
  target: string;
  direction: Direction;
}

export interface TreeParseResult {
  patterns: string[];
  nodeIds: Set<string>;
  relIds: Set<string>;
  nodes: PathwayNode[];
  outgoingCnxns: Map<string, Map<string, string[]>>;
  incomingCnxns: Map<string, Map<string, string[]>>;
  usingJoinStmts: string[];
}

export interface PathwayConnectionsResult {
  connectedNodes: NodeConnection[];
  connectedEdges: EdgeConnection[];
}

export type PathwaySearchResultRow = (NodeResult | RelationshipResult)[];

export interface PathwaySearchResult {
  paths: PathwaySearchResultRow[];
  lowerPageBound: number;
  upperPageBound: number;
}

export interface PathwaySearchCountResult {
  counts: {
    [key: string]: number;
  };
}

export type PredicateFn = (
  variableName: string,
  property: string,
  paramName: string
) => string;
