"use client";

import { Box, Grid, Paper, Typography } from "@mui/material";

import {
  createEntityElement,
  getAllNodeOptions,
  getAllRelationshipOptions,
} from "../utils/query-builder";

export default function AdvancedSchemaSearch() {
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
      <Grid item lg={3} sx={{ height: "inherit" }}>
        <Paper
          sx={{
            background: "linear-gradient(180deg, #EDF0F8 0%, transparent 100%)",
            height: "100%",
            width: "100%",
            padding: "12px 24px",
            overflow: "auto",
          }}
          elevation={0}
        >
          <div className="flex flex-row align-middle justify-between items-center border-b border-b-slate-400 mb-4">
            <Typography variant="h5">Nodes</Typography>
          </div>
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {getAllNodeOptions().map((option) =>
              createEntityElement(option, { margin: 2 })
            )}
          </Box>
          <div className="flex flex-row align-middle justify-between items-center border-b border-b-slate-400 my-4">
            <Typography variant="h5">Edges</Typography>
          </div>
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {getAllRelationshipOptions().map((option) =>
              createEntityElement(option)
            )}
          </Box>
        </Paper>
      </Grid>
      <Grid item lg={9} sx={{ position: "relative", height: "inherit" }}></Grid>
    </Grid>
  );
}
