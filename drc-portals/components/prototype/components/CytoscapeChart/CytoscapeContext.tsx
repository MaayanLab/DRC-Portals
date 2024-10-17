import { Core } from "cytoscape";
import { createContext, MutableRefObject } from "react";

export interface ChartCxtMenuContextProps {
  cyRef: MutableRefObject<Core | undefined>;
}

export const CytoscapeContext = createContext<ChartCxtMenuContextProps | null>(
  null
);
