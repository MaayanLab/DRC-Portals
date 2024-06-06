import { NodeOption, RelationshipOption } from "../interfaces/query-builder";

export type PropertyValue = string | number;

export type SearchBarOption = NodeOption | RelationshipOption;

export type PredicateFn = (
  variable: string,
  property: string,
  value: PropertyValue
) => string;
