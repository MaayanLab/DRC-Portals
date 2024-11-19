import { PathwaySearchEdge } from "../interfaces/pathway-search";
import { PathwaySearchElement } from "../types/pathway-search";

export const isPathwaySearchEdgeElement = (
  element: PathwaySearchElement
): element is PathwaySearchEdge => {
  return (element as PathwaySearchEdge).data.type !== undefined;
};
