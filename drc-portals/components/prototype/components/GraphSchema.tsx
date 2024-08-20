"use client";

import { Grid } from "@mui/material";

import {
  SCHEMA_ELEMENTS,
  SCHEMA_LAYOUT,
  SCHEMA_STYLESHEET,
  SCHEMA_LEGEND,
} from "../constants/cy";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";

export default function GraphSchema() {
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
          legendPosition={{ top: 10, left: 10 }}
          toolbarPosition={{ top: 10, right: 10 }}
          tooltipContentProps={{ noWrap: false }}
        ></CytoscapeChart>
      </Grid>
    </Grid>
  );
}
