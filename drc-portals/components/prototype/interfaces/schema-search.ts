import { Direction } from "../enums/schema-search";
import { PropertyValue, SearchBarOption } from "../types/schema-search";

export interface BasePropertyFilter {
  name: string;
  operator: string;
  value: PropertyValue;
}

export interface BaseSearchBarOption {
  name: string;
  key?: string;
  filters: BasePropertyFilter[];
}

export interface NodeOption extends BaseSearchBarOption {
  limit?: number;
}

export interface RelationshipOption extends BaseSearchBarOption {
  direction: Direction;
}

export interface SchemaSearchPath {
  id: string;
  elements: SearchBarOption[];
  skip: number;
  limit: number;
}

export interface SelectedPathElement {
  element: SearchBarOption;
  pathIdx: number;
  elementIdx: number;
}
