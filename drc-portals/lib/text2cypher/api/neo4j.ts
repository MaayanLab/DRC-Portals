import { api } from "./client";
import type {
  Neo4jExpandNodeRequest,
  Neo4jExpandNodeResponse,
  Neo4jTemplateRunRequest,
  Neo4jTemplateRunResponse,
  Neo4jTemplatesResponse,
} from "./contracts/neo4j";

const NEO4J_API_PREFIX = "/data/graph/text2cypher/api/neo4j";

export const getTemplates = () =>
  api.get<Neo4jTemplatesResponse>(`${NEO4J_API_PREFIX}/templates`);

export const runTemplate = (id: string, body: Neo4jTemplateRunRequest) =>
  api.post<Neo4jTemplateRunResponse>(
    `${NEO4J_API_PREFIX}/templates/${id}`,
    body,
  );

export const expandNode = (body: Neo4jExpandNodeRequest) =>
  api.post<Neo4jExpandNodeResponse>(`${NEO4J_API_PREFIX}/expand`, body);
