import { Direction } from "../enums/schema-search";
import { PropertyValue, SearchBarOption } from "../types/schema-search";

export interface BasePropertyFilter {
  name: string;
  operator: string;
  value: PropertyValue;
}

export interface BaseSearchBarOption {
  name: string;
  filters: BasePropertyFilter[];
}

export interface NodeOption extends BaseSearchBarOption {
  limit?: number;
}

export interface RelationshipOption extends BaseSearchBarOption {
  direction: Direction;
}

export interface SearchBarState {
  value: SearchBarOption[];
}
