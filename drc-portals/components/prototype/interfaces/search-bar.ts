export interface BaseSearchBarOption {
  name: string;
  filters: BasePropertyFilter[];
}

export interface NodeOption extends BaseSearchBarOption {}

export enum Direction {
  OUTGOING = "OUTGOING",
  INCOMING = "INCOMING",
  UNDIRECTED = "UNDIRECTED",
}

export interface RelationshipOption extends BaseSearchBarOption {
  direction: Direction;
}

export type SearchBarOption = NodeOption | RelationshipOption;

export interface SearchQuerySettings {
  limit?: number;
  skip?: number;
}

// type PropertyType = string | number; // TODO: Are there other types we should allow?
export type PropertyValue = string | number; // TODO: Are there other types we should allow?

export interface BasePropertyFilter {
  name: string;
  // type: PropertyType; // TODO
  operator: string;
  value: PropertyValue;
}
