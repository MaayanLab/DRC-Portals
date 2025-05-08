"use client";

import { Box } from "@mui/material";
import { Core } from "cytoscape";
import { useRef } from "react";

import {
  SCHEMA_ELEMENTS,
  SCHEMA_LAYOUT,
  SCHEMA_STYLESHEET,
  SCHEMA_LEGEND,
} from "../constants/cy";
import { CustomToolbarFnFactory, CytoscapeReference } from "../types/cy";
import { downloadChartPNG } from "../utils/cy";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";

export default function GraphSchema() {
  const cyRef = useRef<Core>();

  const customTools: CustomToolbarFnFactory[] = [
    (cyRef: CytoscapeReference) =>
      downloadChartPNG(
        "search-chart-toolbar-download-png",
        "Download PNG",
        cyRef
      ),
  ];

  return (
    <Box sx={{ height: "100%" }}>
      <Box sx={{ position: "relative", height: "inherit" }}>
        <CytoscapeChart
          cyRef={cyRef}
          elements={SCHEMA_ELEMENTS}
          layout={SCHEMA_LAYOUT}
          stylesheet={SCHEMA_STYLESHEET}
          legend={SCHEMA_LEGEND}
          cxtMenuEnabled={true}
          hoverCxtMenuEnabled={false}
          tooltipEnabled={true}
          legendPosition={{ top: 10, left: 10 }}
          toolbarPosition={{ top: 10, right: 10 }}
          customTools={customTools}
          tooltipContentProps={{ noWrap: false }}
        ></CytoscapeChart>
      </Box>
    </Box>
  );
}
