export interface SearchBarOption {
  name: string;
  isRelationship: boolean;
  filters: BasePropertyFilter[];
}

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
