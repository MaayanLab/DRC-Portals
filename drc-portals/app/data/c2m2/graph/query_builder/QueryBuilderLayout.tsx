import { Grid } from "@mui/material";

import GraphQueryBuilder from "@/components/prototype/components/GraphQueryBuilder";

export default function QueryBuilderLayout() {
  return (
    <Grid
      container
      justifyContent={"center"}
      sx={{ paddingTop: 2, paddingBottom: 2 }}
      spacing={2}
    >
      <Grid item container xs={12} spacing={1}>
        <GraphQueryBuilder></GraphQueryBuilder>
      </Grid>
    </Grid>
  );
}
