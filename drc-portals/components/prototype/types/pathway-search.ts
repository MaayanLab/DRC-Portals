import {
  propertyTypeConfigs,
  stringTypeConfigs,
} from "../constants/pathway-search";
import {
  PathwaySearchEdge,
  PathwaySearchNode,
} from "../interfaces/pathway-search";

export type PathwaySearchElement = PathwaySearchNode | PathwaySearchEdge;

export type Order = "asc" | "desc" | undefined;

export type StringPropertyConfigs = typeof stringTypeConfigs;
export type PropertyConfigs = typeof propertyTypeConfigs;

// Each key in propertyConfigs maps to an array of the right type
export type PropertyValueType<T> = 
  T extends { type: "string" } ? string[] : 
  // T extends {type: "number"} ? string[] :
  // ...and so on
  never;

export type PathwaySearchNodeDataProps = {
  [K in keyof PropertyConfigs]?: PropertyValueType<PropertyConfigs[K]>;
};
