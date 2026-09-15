import { api } from "./client";
import type {
  PipelineRepaginateRequest,
  PipelineRepaginateResponse,
  PipelineRequest,
  PipelineResponse,
} from "@/lib/text2cypher/api/contracts/pipeline";

const PIPELINE_API_PREFIX = "/data/graph/text2cypher/api/pipeline";

export const getPipelineResult = (body: PipelineRequest) =>
  api.post<PipelineResponse>(`${PIPELINE_API_PREFIX}`, body);

export const repaginatePipelineResult = (body: PipelineRepaginateRequest) =>
  api.post<PipelineRepaginateResponse>(`${PIPELINE_API_PREFIX}/paginate`, body);
