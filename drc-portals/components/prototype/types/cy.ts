import { MutableRefObject, ReactNode } from "react";

export type CytoscapeReference = MutableRefObject<cytoscape.Core | undefined>;

export type CustomToolbarFnFactory = (cyRef: CytoscapeReference) => ReactNode;
