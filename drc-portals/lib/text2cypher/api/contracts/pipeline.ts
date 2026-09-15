import type { QueryResultData } from "@/lib/text2cypher/neo4j/query-results";

export interface PipelineRequest {
  question: string;
  limit?: number;
  offset?: number;
}

export interface PipelineResponse {
  success: boolean;
  cypher?: string;
  params?: Record<string, unknown>;
  error?: string;
  results?: QueryResultData | null;
  limit?: number;
  offset?: number;
  totalRowCount?: number;
}

export interface PipelineRepaginateRequest {
  cypher: string;
  params?: Record<string, unknown>;
  limit?: number;
  offset?: number;
}

export type PipelineRepaginateResponse = PipelineResponse;
