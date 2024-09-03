// @ts-ignore
import parser from "lucene-query-parser";

export const escapeCypherString = (input: string) => {
  // convert any \u0060 to literal backtick, then escape backticks, and finally wrap in single quotes and backticks
  return `\`${input.replace(/\\u0060/g, "`").replace(/`/g, "``")}\``;
};

export const inputIsValidLucene = (input: string) => {
  try {
    parser.parse(input);
  } catch {
    return false;
  }
  return true;
};

export const createNodeReprStr = (varName: string) => {
  return `{
    identity: id(${varName}),
    labels: labels(${varName}),
    properties: properties(${varName})
  }`;
};

export const createRelReprStr = (varName: string) => {
  return `{
    identity: id(${varName}),
    type: type(${varName}),
    properties: properties(${varName}),
    start: id(startNode(${varName})),
    end: id(endNode(${varName}))
  }`;
};
