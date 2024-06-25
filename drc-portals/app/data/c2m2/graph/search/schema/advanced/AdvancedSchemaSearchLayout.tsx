import { Grid } from "@mui/material";

import AdvancedSchemaSearch from "@/components/prototype/components/AdvancedSchemaSearch";

export default function AdvancedSchemaSearchLayout() {
  return (
    <Grid
      container
      justifyContent={"center"}
      sx={{ paddingTop: 2, paddingBottom: 2 }}
      spacing={2}
    >
      <Grid item container xs={12} spacing={1}>
        <AdvancedSchemaSearch></AdvancedSchemaSearch>
      </Grid>
    </Grid>
  );
}
