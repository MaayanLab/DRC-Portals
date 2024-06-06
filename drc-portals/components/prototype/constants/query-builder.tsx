import { styled } from "@mui/material";

import { SearchQuerySettings } from "../interfaces/query-builder";
import { PredicateFn } from "../types/query-builder";

import { STRING_PROPERTIES } from "./neo4j";

export const SchemaAutocompleteContainer = styled("div")({
  flexGrow: 1,
  position: "absolute",
  top: 10,
  left: 10,
  zIndex: 1,
  padding: "inherit",
});

export const DEFAULT_QUERY_SETTINGS: SearchQuerySettings = {
  skip: 0,
  limit: 10,
};

const STRING_EQUALS = "EQUALS";
const STRING_CONTAINS = "CONTAINS";
const STRING_STARTS_WITH = "STARTS WITH";
const STRING_ENDS_WITH = "ENDS WITH";
const NUMBER_EQUALS = "=";
const NUMBER_GREATER_THAN = ">";
const NUMBER_LESS_THAN = "<";
const NUMBER_GREATER_THAN_OR_EQUAL = ">=";
const NUMBER_LESS_THAN_OR_EQUAL = "<=";

export const STRING_OPERATORS: ReadonlyArray<string> = [
  STRING_EQUALS,
  STRING_CONTAINS,
  STRING_STARTS_WITH,
  STRING_ENDS_WITH,
];

export const NUMBER_OPERATORS: ReadonlyArray<string> = [
  NUMBER_EQUALS,
  NUMBER_GREATER_THAN,
  NUMBER_LESS_THAN,
  NUMBER_GREATER_THAN_OR_EQUAL,
  NUMBER_LESS_THAN_OR_EQUAL,
];

export const PROPERTY_OPERATORS: ReadonlyMap<string, string[]> = new Map([
  ...Array.from(STRING_PROPERTIES).map((prop): [string, string[]] => [
    prop,
    [...STRING_OPERATORS],
  ]),
  // ...Array.from(NUMBER_PROPERTIES).map((prop): [string, string[]] => [
  //   prop,
  //   [...NUMBER_OPERATORS],
  // ]),
  // TODO: Add array, bool, and date operators
]);

export const OPERATOR_FUNCTIONS: ReadonlyMap<string, PredicateFn> = new Map([
  [
    STRING_EQUALS,
    (variable, property, value) => `${variable}.${property} = "${value}"`,
  ],
  [
    STRING_CONTAINS,
    (variable, property, value) =>
      `${variable}.${property} CONTAINS "${value}"`,
  ],
  [
    STRING_STARTS_WITH,
    (variable, property, value) =>
      `${variable}.${property} STARTS WITH "${value}"`,
  ],
  [
    STRING_ENDS_WITH,
    (variable, property, value) =>
      `${variable}.${property} ENDS WITH "${value}"`,
  ],
  [
    NUMBER_EQUALS,
    (variable, property, value) => `${variable}.${property} = ${value}`,
  ],
  [
    NUMBER_GREATER_THAN,
    (variable, property, value) => `${variable}.${property} > ${value}`,
  ],
  [
    NUMBER_LESS_THAN,
    (variable, property, value) => `${variable}.${property} < ${value}`,
  ],
  [
    NUMBER_GREATER_THAN_OR_EQUAL,
    (variable, property, value) => `${variable}.${property} >= ${value}`,
  ],
  [
    NUMBER_LESS_THAN_OR_EQUAL,
    (variable, property, value) => `${variable}.${property} <= ${value}`,
  ],
]);
