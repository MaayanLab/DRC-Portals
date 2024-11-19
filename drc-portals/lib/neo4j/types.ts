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

export interface NodeOutgoingRelsResult {
  outgoingLabels: string[];
  outgoingType: string;
  count: number;
}

export interface NodeIncomingRelsResult {
  incomingLabels: string[];
  incomingType: string;
  count: number;
}

export interface NodeAllRelsResults {
  outgoing: NodeOutgoingRelsResult[];
  incoming: NodeIncomingRelsResult[];
}

export interface SynoynmsResult {
  synonym: string;
}

export interface CVTermsResult {
  synonym: string;
  cvTerm: NodeResult;
}

export interface CVTermsWithLabelResult {
  names: string[];
}

export interface BasePropFilter {
  name: string;
  operator: string;
  value: PropValue;
  paramName: string;
}

export interface BasePathElement {
  name: string;
  key?: string;
  filters: BasePropFilter[];
}

export interface NodePathElement extends BasePathElement {
  limit?: number;
}

export interface RelationshipPathElement extends BasePathElement {
  direction: Direction;
}

export interface SearchPath {
  id: string;
  elements: PathElement[];
  skip: number;
  limit: number;
}

export interface PathwayRelationship {
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
  relationshipToParent?: PathwayRelationship;
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
}

export interface CountsResult {
  pathwayCounts: {
    [key: string]: number;
  };
  connectedNodes: NodeConnection[];
  connectedEdges: EdgeConnection[];
}

export type PropValue = string | number;

export type PathElement = NodePathElement | RelationshipPathElement;

export type PredicateFn = (
  variableName: string,
  property: string,
  paramName: string
) => string;
