import { Integer } from "neo4j-driver";

export interface SubGraph {
  nodes: NodeResult[];
  relationships: RelationshipResult[];
}

export interface NodeResult {
  identity: Integer;
  labels: string[];
  properties: { [key: string]: any };
}

export interface RelationshipResult {
  identity: Integer;
  type: string;
  properties: { [key: string]: any };
  start: Integer;
  end: Integer;
}
