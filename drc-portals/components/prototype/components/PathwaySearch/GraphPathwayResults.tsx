"use client";
import "../CytoscapeChart/CytoscapeChart.css";

import { ElementDefinition } from "cytoscape";
import { useEffect, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import d3Force from "cytoscape-d3-force";
import cytoscape from "cytoscape";

import {
  ChartContainer,
  D3_FORCE_LAYOUT,
  DEFAULT_STYLESHEET,
  WidgetContainer,
} from "../../constants/cy";
import { Tooltip } from "@mui/material";
import ChartToolbar from "../CytoscapeChart/ChartToolbar";

cytoscape.use(d3Force);

interface GraphPathwayResultsProps {
  elements: ElementDefinition[];
}

export default function GraphPathwayResults(
  cmpProps: GraphPathwayResultsProps
) {
  const { elements } = cmpProps;
  const cyRef = useRef<cytoscape.Core>();

  const runLayout = () => {
    const cy = cyRef.current;
    if (cy) {
      cy.layout(D3_FORCE_LAYOUT).run();
    }
  };

  useEffect(() => {
    // We need to rerun the layout when the elements change, otherwise they won't be drawn properly
    runLayout();
  }, [elements]);

  // TODO: There is something very wrong with the current CytoscapeChart implementation. For some reason, we cannot use that component
  // with d3-force AND ALSO set elements to a non-empty list on init. It ONLY works with d3-force when the initial elements is empty, and
  // the elements change some time after the initial load. What's strange is the bare CytoscapeComponent works fine with either an empty or
  // non-empty list of elements, so there must be something in our implementation that is incorrect.
  return (
    <>
      <ChartContainer variant="outlined">
        <CytoscapeComponent
          className="cy"
          cy={(cy) => (cyRef.current = cy)}
          elements={elements}
          layout={D3_FORCE_LAYOUT}
          stylesheet={DEFAULT_STYLESHEET}
        />
      </ChartContainer>
      <WidgetContainer key="cy-chart-toolbar" sx={{ top: 10, right: 10 }}>
        <ChartToolbar cyRef={cyRef} layout={D3_FORCE_LAYOUT}></ChartToolbar>
      </WidgetContainer>
    </>
  );
}
