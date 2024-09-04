import { z } from "zod";

import { Direction } from "./enums";

export const PropValueSchema = z.union([z.string(), z.number()]);

export const BasePropFilterSchema = z.object({
  name: z.string(),
  operator: z.string(),
  value: PropValueSchema,
  paramName: z.string(),
});

export const BasePathElementSchema = z.object({
  name: z.string(),
  filters: z.array(BasePropFilterSchema),
});

export const NodePathElementSchema = BasePathElementSchema.extend({
  limit: z.number().optional(),
});

export const DirectionSchema = z.nativeEnum(Direction);

export const RelationshipPathElementSchema = BasePathElementSchema.extend({
  direction: DirectionSchema,
});

export const PathElementSchema = z.union([
  NodePathElementSchema,
  RelationshipPathElementSchema,
]);

export const SearchPathSchema = z.object({
  id: z.string(),
  elements: z.array(PathElementSchema),
  limit: z.number().optional(),
  skip: z.number().optional(),
});

export const CypherParamSchema = z.record(PropValueSchema);
