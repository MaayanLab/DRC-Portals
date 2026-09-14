"use client";

import cytoscape from "cytoscape";
import CytoscapeComponent from "react-cytoscapejs";
import { RefObject } from "react";

import type { CytoscapeLayoutOptions } from "@/lib/text2cypher/cytoscape/types";

// TODO: Consider how we can take layout providers as inputs and register them dynamically
// cytoscape.use(cola);

interface CytoscapeContainerProps {
  elements: cytoscape.ElementDefinition[];
  layout: CytoscapeLayoutOptions;
  cyRef: RefObject<cytoscape.Core | undefined>;
  stylesheet:
  | string
  | cytoscape.StylesheetJsonBlock
  | cytoscape.StylesheetJsonBlock[]
  | undefined;
  style?: React.CSSProperties;
}

export default function CytoscapeContainer({
  elements,
  layout,
  stylesheet,
  style,
  cyRef,
}: CytoscapeContainerProps) {
  return (
    <CytoscapeComponent
      cy={(cy) => {
        cyRef.current = cy;
      }}
      layout={layout}
      elements={elements}
      stylesheet={stylesheet}
      style={style}
    />
  );
}
