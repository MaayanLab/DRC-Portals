"use client";

import { Grid } from "@mui/material";

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
  const customTools: CustomToolbarFnFactory[] = [
    (cyRef: CytoscapeReference) =>
      downloadChartPNG(
        "search-chart-toolbar-download-png",
        "Download PNG",
        cyRef
      ),
  ];

  return (
    <Grid
      container
      item
      spacing={1}
      xs={12}
      sx={{
        height: "640px",
      }}
    >
      <Grid item xs={12} sx={{ position: "relative", height: "inherit" }}>
        <CytoscapeChart
          elements={SCHEMA_ELEMENTS}
          layout={SCHEMA_LAYOUT}
          stylesheet={SCHEMA_STYLESHEET}
          legend={SCHEMA_LEGEND}
          cxtMenuEnabled={true}
          tooltipEnabled={true}
          legendPosition={{ top: 10, left: 10 }}
          toolbarPosition={{ top: 10, right: 10 }}
          customTools={customTools}
          tooltipContentProps={{ noWrap: false }}
        ></CytoscapeChart>
      </Grid>
    </Grid>
  );
}
