import { Grid } from "@mui/material";

import GraphSchema from "@/components/prototype/components/GraphSchema";

export default async function GraphSchemaLayout() {
  return (
    <Grid
      container
      justifyContent={"center"}
      sx={{ paddingTop: 2, paddingBottom: 2 }}
      spacing={2}
    >
      <Grid item container xs={12} spacing={1}>
        <GraphSchema></GraphSchema>
      </Grid>
    </Grid>
  );
}
