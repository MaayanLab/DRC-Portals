import { Box, Grid } from "@mui/material";

import GraphSchemaLink from "@/components/prototype/components/GraphSchemaLink";
import GraphPathwaySearch from "@/components/prototype/components/GraphPathwaySearch";

export default function GraphPathwaySearchLayout() {
  return (
    <Grid container justifyContent={"center"} rowSpacing={1}>
      <Grid item xs={12}>
        <Box sx={{ display: "flex", flexDirection: "row-reverse" }}>
          <GraphSchemaLink></GraphSchemaLink>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <GraphPathwaySearch></GraphPathwaySearch>
      </Grid>
    </Grid>
  );
}
