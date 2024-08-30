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
