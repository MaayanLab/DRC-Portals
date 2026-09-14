import { api } from "./client";
import type {
  PipelineRequest,
  PipelineResponse,
} from "@/lib/text2cypher/api/contracts/pipeline";

const PIPELINE_API_PREFIX = "/data/graph/text2cypher/api/pipeline";

export const getPipelineResult = (body: PipelineRequest) =>
  api.post<PipelineResponse>(`${PIPELINE_API_PREFIX}`, body);
