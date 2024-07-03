import { z } from "zod";

import { Direction } from "../enums/schema-search";

export const PropertyValueSchema = z.union([z.string(), z.number()]);

export const BasePropertyFilterSchema = z.object({
  name: z.string(),
  operator: z.string(),
  value: PropertyValueSchema,
});

export const BaseSearchBarOptionSchema = z.object({
  name: z.string(),
  filters: z.array(BasePropertyFilterSchema),
});

export const NodeOptionSchema = BaseSearchBarOptionSchema.extend({
  limit: z.number().optional(),
});

export const DirectionSchema = z.nativeEnum(Direction);

export const RelationshipOptionSchema = BaseSearchBarOptionSchema.extend({
  direction: DirectionSchema,
});

export const SearchBarOptionSchema = z.union([
  NodeOptionSchema,
  RelationshipOptionSchema,
]);

export const SchemaSearchPathSchema = z.object({
  id: z.string(),
  elements: z.array(SearchBarOptionSchema),
  limit: z.number().optional(),
  skip: z.number().optional(),
});
