import { Direction } from "../enums/search-bar";
import { PropertyValue, SearchBarOption } from "../types/search-bar";

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

export interface SearchQuerySettings {
  limit?: number;
  skip?: number;
}

export interface SearchBarState {
  value: SearchBarOption[];
  settings?: SearchQuerySettings;
}
