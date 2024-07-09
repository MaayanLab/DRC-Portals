import { Grid } from "@mui/material";

import AdvancedSearch from "@/components/prototype/components/AdvancedSearch";

export default function AdvancedSearchLayout() {
  return (
    <Grid
      container
      justifyContent={"center"}
      sx={{ paddingTop: 2, paddingBottom: 2 }}
      spacing={2}
    >
      <Grid item xs={12} spacing={1}>
        <AdvancedSearch></AdvancedSearch>
      </Grid>
    </Grid>
  );
}
