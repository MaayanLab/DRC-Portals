import { z } from "zod";

import { Direction } from "../enums/search-bar";

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

export const SearchQuerySettingsSchema = z.object({
  limit: z.number().optional(),
  skip: z.number().optional(),
});

export const SearchBarStateSchema = z.object({
  value: z.array(SearchBarOptionSchema),
  settings: SearchQuerySettingsSchema.optional(),
});
