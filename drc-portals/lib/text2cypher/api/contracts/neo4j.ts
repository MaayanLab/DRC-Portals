import type { Template } from "@/lib/text2cypher/neo4j/types";
import type { QueryResultData } from "@/lib/text2cypher/neo4j/query-results";

export interface Neo4jTemplatesResponse {
  templates: Template[];
}

export type Neo4jTemplateParamValue = string | number | boolean | null;

export interface Neo4jTemplateRunRequest {
  params?: Record<string, Neo4jTemplateParamValue>;
}

export interface Neo4jTemplateRunResponse {
  templateId: string;
  results: QueryResultData | null;
}

export interface Neo4jExpandNodeRequest {
  nodeUuid: string;
  nodeLabel: string;
  depth: number;
}

export interface Neo4jExpandNodeResponse {
  nodeLabel: string;
  nodeUuid: string;
  depth: number;
  results: QueryResultData | null;
}
