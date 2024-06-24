import { Grid } from "@mui/material";

import SynonymSearch from "@/components/prototype/components/SynonymSearch";

export default function SearchLayout() {
  return (
    <Grid
      container
      justifyContent={"center"}
      sx={{ paddingTop: 2, paddingBottom: 2 }}
      spacing={2}
    >
      <Grid item container xs={12} spacing={1}>
        <SynonymSearch></SynonymSearch>
      </Grid>
    </Grid>
  );
}
