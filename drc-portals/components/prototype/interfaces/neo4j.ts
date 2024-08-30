export interface SubGraph {
  nodes: NodeResult[];
  relationships: RelationshipResult[];
}

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

export interface NodeOutgoingRelsResult {
  outgoing_labels: string[];
  outgoing_type: string;
  count: number;
}

export interface NodeIncomingRelsResult {
  incoming_labels: string[];
  incoming_type: string;
  count: number;
}
