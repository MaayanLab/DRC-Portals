import { NodeOption, RelationshipOption } from "../interfaces/schema-search";

export type PropertyValue = string | number;

export type SearchBarOption = NodeOption | RelationshipOption;

export type PredicateFn = (
  variableName: string,
  property: string,
  paramName: string
) => string;
