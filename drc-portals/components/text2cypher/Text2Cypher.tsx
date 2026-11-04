"use client";

import { CssBaseline, Grid, ThemeProvider, Typography } from "@mui/material";
import { text2_cypher_theme } from "./theme";

import TabsContainer from "@/components/text2cypher/TabsContainer"

export default function Text2Cypher() {
  return (
    <ThemeProvider theme={text2_cypher_theme}>
      <CssBaseline />
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h2" sx={{ ml: 3 }}>
            CFDE Text2Cypher
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ ml: 3 }}>
            Use the tabs below to switch between Query, Templates, and Schema.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TabsContainer />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
