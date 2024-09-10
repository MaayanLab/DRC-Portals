// @ts-ignore
import parser from "lucene-query-parser";
import { v4 } from "uuid";

import { PathElement, RelationshipPathElement } from "./types";

export const escapeCypherString = (input: string) => {
  // convert any \u0060 to literal backtick, then escape backticks, and finally wrap in single quotes and backticks
  return `\`${input.replace(/\\u0060/g, "`").replace(/`/g, "``")}\``;
};

export const isValidLucene = (input: string) => {
  try {
    parser.parse(input);
  } catch {
    return false;
  }
  return true;
};

export const neo4jSafeUUID = () => {
  let uuid = v4();
  const alphabets = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ";

  if (/^\d/.test(uuid)) {
    const randomAlphabet =
      alphabets[Math.floor(Math.random() * alphabets.length)];
    uuid = randomAlphabet + uuid.slice(1);
  }

  return uuid.replace(/\-/g, "_");
};

export const createNodeReprStr = (varName: string) => {
  return `{
    uuid: ${varName}._uuid,
    labels: labels(${varName}),
    properties: properties(${varName})
  }`;
};

export const createRelReprStr = (varName: string) => {
  return `{
    uuid: ${varName}._uuid,
    type: type(${varName}),
    properties: properties(${varName}),
    startUUID: startNode(${varName})._uuid,
    endUUID: endNode(${varName})._uuid
  }`;
};

export const isRelationshipElement = (
  option: PathElement
): option is RelationshipPathElement => {
  return (option as RelationshipPathElement).direction !== undefined;
};
