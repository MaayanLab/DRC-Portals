import { z } from "zod";

// TODO: Could split this out into /schemas and /types, in any case, this probably doesn't belong /interfaces anymore

// type PropertyType = string | number; // TODO: Are there other types we should allow?
export const PropertyValueSchema = z.union([z.string(), z.number()]);
export type PropertyValue = z.infer<typeof PropertyValueSchema>;

export const BasePropertyFilterSchema = z.object({
  name: z.string(),
  operator: z.string(),
  value: PropertyValueSchema,
});
export type BasePropertyFilter = z.infer<typeof BasePropertyFilterSchema>;

export const BaseSearchBarOptionSchema = z.object({
  name: z.string(),
  filters: z.array(BasePropertyFilterSchema),
});
export type BaseSearchBarOption = z.infer<typeof BaseSearchBarOptionSchema>;

export const NodeOptionSchema = BaseSearchBarOptionSchema.extend({});
export type NodeOption = z.infer<typeof NodeOptionSchema>;

export enum Direction {
  OUTGOING = "OUTGOING",
  INCOMING = "INCOMING",
  UNDIRECTED = "UNDIRECTED",
}
export const DirectionSchema = z.nativeEnum(Direction);

export const RelationshipOptionSchema = BaseSearchBarOptionSchema.extend({
  direction: DirectionSchema,
});
export type RelationshipOption = z.infer<typeof RelationshipOptionSchema>;

export const SearchBarOptionSchema = z.union([
  NodeOptionSchema,
  RelationshipOptionSchema,
]);
export type SearchBarOption = z.infer<typeof SearchBarOptionSchema>;

export const SearchQuerySettingsSchema = z.object({
  limit: z.number().optional(),
  skip: z.number().optional(),
});
export type SearchQuerySettings = z.infer<typeof SearchQuerySettingsSchema>;

export const SearchBarStateSchema = z.object({
  value: z.array(SearchBarOptionSchema),
  settings: SearchQuerySettingsSchema.optional(),
});
export type SearchBarState = z.infer<typeof SearchBarStateSchema>;
