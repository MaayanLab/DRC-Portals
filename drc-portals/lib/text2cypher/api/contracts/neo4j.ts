import type { Template } from "@/lib/text2cypher/neo4j/types";
import type { QueryResultRow } from "@/lib/text2cypher/neo4j/query-results";

export interface Neo4jTemplatesResponse {
  templates: Template[];
}

export type Neo4jTemplateParamValue = string | number | boolean | null;

export interface Neo4jTemplateRunRequest {
  params?: Record<string, Neo4jTemplateParamValue>;
  limit?: number;
  offset?: number;
}

export interface Neo4jTemplateRunResponse {
  templateId: string;
  rows: QueryResultRow[] | null;
  error?: string | null;
  cypher?: string;
  params?: Record<string, unknown>;
  limit?: number;
  offset?: number;
  totalRowCount?: number;
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
  rows: QueryResultRow[] | null;
  error?: string | null;
}
