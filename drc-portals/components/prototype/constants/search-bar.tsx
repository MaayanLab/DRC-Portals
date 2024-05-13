import { Box, Divider, Typography, styled } from "@mui/material";

import { PropertyValue, SearchQuerySettings } from "../interfaces/search-bar";

import { EDGE_COLOR } from "./cy";
import { STRING_PROPERTIES } from "./neo4j";

export const NodeElement = styled(Box)(() => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "32px",
  color: "#fff",
  borderRadius: "16px",
  marginTop: "3px",
  marginBottom: "3px",
  fontSize: "0.8125rem",
}));

export const RelationshipElement = styled(Box)(() => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "32px",
  border: "none",
  margin: "3px",
  fontSize: "0.8125rem",
}));

export const AnonymousNodeElement = styled(Box)(() => ({
  height: "1.9em",
  width: "1.9em",
  border: "1px solid #797979",
  borderRadius: "50%",
  marginTop: "3px",
  marginBottom: "3px",
}));

export const EntityText = styled(Typography)(() => ({
  overflow: "hidden",
  textOverflow: "ellipsis",
  paddingLeft: "11px",
  paddingRight: "11px",
  whiteSpace: "nowrap",
  fontSize: "0.8rem",
}));

export const DividerContainer = styled(Box)(() => ({
  width: "16px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

export const EntityDivider = styled(Divider)(() => ({
  width: "16px",
  backgroundColor: "#000",
  borderBottomWidth: "2px",
  borderColor: EDGE_COLOR,
}));

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
  ...STRING_PROPERTIES.map((prop): [string, string[]] => [
    prop,
    [...STRING_OPERATORS],
  ]),
  // ...NUMBER_PROPERTIES.map((prop): [string, string[]] => [
  //   prop,
  //   [...NUMBER_OPERATORS],
  // ]),
  // TODO: Add array, bool, and date operators
]);

export type PredicateFn = (
  variable: string,
  property: string,
  value: PropertyValue
) => string;

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
