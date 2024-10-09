import { Box, Grid } from "@mui/material";

import GraphSchemaLink from "@/components/prototype/components/GraphSchemaLink";
import GraphPathway from "@/components/prototype/components/GraphPathway";

export default function GraphPathwayLayout() {
  return (
    <Grid container justifyContent={"center"} rowSpacing={1}>
      <Grid item xs={12}>
        <Box sx={{ display: "flex", flexDirection: "row-reverse" }}>
          <GraphSchemaLink></GraphSchemaLink>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <GraphPathway></GraphPathway>
      </Grid>
    </Grid>
  );
}
