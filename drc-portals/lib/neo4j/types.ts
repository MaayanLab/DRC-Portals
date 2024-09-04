import { Direction } from "./enums";

export interface NodeResult {
  identity: number;
  labels: string[];
  properties: { [key: string]: any };
}

export interface RelationshipResult {
  identity: number;
  type: string;
  properties: { [key: string]: any };
  start: number;
  end: number;
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

export type PropValue = string | number;

export type PathElement = NodePathElement | RelationshipPathElement;

export type PredicateFn = (
  variableName: string,
  property: string,
  paramName: string
) => string;
