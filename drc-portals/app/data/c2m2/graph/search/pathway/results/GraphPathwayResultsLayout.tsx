import { Box, Grid } from "@mui/material";

import GraphSchemaLink from "@/components/prototype/components/GraphSchemaLink";
import GraphPathwayResults from "@/components/prototype/components/GraphPathwayResults";

export default function GraphPathwayResultsLayout() {
  return (
    <Grid container justifyContent={"center"} rowSpacing={1}>
      <Grid item xs={12}>
        <Box sx={{ display: "flex", flexDirection: "row-reverse" }}>
          <GraphSchemaLink></GraphSchemaLink>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <GraphPathwayResults></GraphPathwayResults>
      </Grid>
    </Grid>
  );
}
