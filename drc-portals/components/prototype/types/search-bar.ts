import { NodeOption, RelationshipOption } from "../interfaces/search-bar";

export type PropertyValue = string | number;

export type SearchBarOption = NodeOption | RelationshipOption;

export type PredicateFn = (
  variable: string,
  property: string,
  value: PropertyValue
) => string;
