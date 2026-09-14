import type { QueryResultData } from "@/lib/text2cypher/neo4j/query-results";
import type { QueryTableRow } from "@/lib/text2cypher/neo4j/query-results";

export interface PipelineRequest {
  question: string;
}

export interface PipelineResponse {
  success: boolean;
  cypher?: string;
  error?: string;
  results?: QueryResultData | null;
  rawResults?: QueryTableRow[];
}
