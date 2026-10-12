import { Integer } from "neo4j-driver";

export type Neo4jVarType =
  | string
  | number
  | Integer
  | boolean
  | null
  | Neo4jVarType[]
  | { [key: string]: Neo4jVarType };

type TemplateParam = {
  name: string;
  type: "text" | "number";
  example: string;
};

export type Template = {
  id: string;
  name: string;
  description: string;
  query: string;
  params: TemplateParam[];
};
