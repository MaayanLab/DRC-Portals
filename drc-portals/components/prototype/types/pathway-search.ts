import {
  PathwaySearchEdge,
  PathwaySearchNode,
} from "../interfaces/pathway-search";

export type PathwaySearchElement = PathwaySearchNode | PathwaySearchEdge;

export type Order = "asc" | "desc" | undefined;
