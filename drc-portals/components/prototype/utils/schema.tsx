import { EventObjectEdge, EventObjectNode } from "cytoscape";
import {
  SchemaData,
  SchemaEdgeData,
  SchemaNodeData,
} from "../interfaces/schema";
import {
  Direction,
  NodeOption,
  RelationshipOption,
  SearchBarOption,
} from "../interfaces/search-bar";

export const isSchemaEdge = (
  option: SchemaNodeData | SchemaEdgeData
): option is SchemaEdgeData => {
  return (option as SchemaEdgeData).source !== undefined;
};

export const convertPathToSearchValue = (
  path: SchemaData[]
): SearchBarOption[] => {
  const value: SearchBarOption[] = [];

  path.forEach((segment, idx) => {
    if (isSchemaEdge(segment)) {
      const prev = path[idx - 1] as SchemaNodeData;
      const direction =
        prev.id === segment.source ? Direction.OUTGOING : Direction.INCOMING;
      value.push({
        name: segment.label,
        direction: direction,
        filters: [],
      } as RelationshipOption);
    } else {
      value.push({ name: segment.label, filters: [] } as NodeOption);
    }
  });

  return value;
};

export const isPathEligible = (event: EventObjectNode | EventObjectEdge) => {
  return event.target.hasClass("path-eligible");
};
