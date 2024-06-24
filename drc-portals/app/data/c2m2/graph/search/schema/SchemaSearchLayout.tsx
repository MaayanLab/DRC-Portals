import { Grid } from "@mui/material";

import SchemaSearch from "@/components/prototype/components/SchemaSearch";

export default function SchemaSearchLayout() {
  return (
    <Grid
      container
      justifyContent={"center"}
      sx={{ paddingTop: 2, paddingBottom: 2 }}
      spacing={2}
    >
      <Grid item container xs={12} spacing={1}>
        <SchemaSearch></SchemaSearch>
      </Grid>
    </Grid>
  );
}
