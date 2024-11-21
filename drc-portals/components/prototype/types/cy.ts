import { MutableRefObject, ReactNode } from "react";

export type CytoscapeReference = MutableRefObject<cytoscape.Core | undefined>;

// TODO: Return a Promise instead?
export type AnimationFn = (cy: cytoscape.Core) => void;

export type CustomToolbarFnFactory = (
  cyRef: CytoscapeReference,
  ...args: any[]
) => ReactNode;
