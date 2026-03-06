import { z } from "zod";

export const PathwaySearchNodeDataSchema = z.object({
  id: z.string(),
  dbLabel: z.string(),
});

export const PathwaySearchEdgeDataSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string(),
});

export const PathwaySearchNodeSchema = z.object({
  data: PathwaySearchNodeDataSchema,
  classes: z.optional(z.array(z.string())),
});

export const PathwaySearchEdgeSchema = z.object({
  data: PathwaySearchEdgeDataSchema,
  classes: z.optional(z.array(z.string())),
});

export const PathwaySearchElementSchema = z.union([
  PathwaySearchNodeSchema,
  PathwaySearchEdgeSchema,
]);
