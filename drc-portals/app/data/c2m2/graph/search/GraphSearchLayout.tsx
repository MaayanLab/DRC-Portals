import { Grid } from "@mui/material";

import GraphSearch from "@/components/prototype/components/GraphSearch";

export default function GraphSearchLayout() {
  return (
    <Grid
      container
      justifyContent={"center"}
      sx={{ paddingTop: 2, paddingBottom: 2 }}
      spacing={2}
    >
      <Grid item container xs={12} spacing={1}>
        <GraphSearch></GraphSearch>
      </Grid>
    </Grid>
  );
}
