import { Box, Grid } from "@mui/material";

import GraphSchemaLink from "@/components/prototype/components/GraphSchemaLink";
import GraphSearch from "@/components/prototype/components/GraphSearch";

export default function GraphSearchLayout() {
  return (
    <Grid container justifyContent={"center"} rowSpacing={1}>
      <Grid item xs={12}>
        <Box sx={{ display: "flex", flexDirection: "row-reverse" }}>
          <GraphSchemaLink></GraphSchemaLink>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <GraphSearch></GraphSearch>
      </Grid>
    </Grid>
  );
}
