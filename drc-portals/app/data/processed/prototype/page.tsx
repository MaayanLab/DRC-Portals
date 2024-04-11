import { Grid } from "@mui/material";

import PrototypeContainer from "@/components/prototype/components/PrototypeContainer";

export default async function Page() {
  return (
    <Grid
      container
      justifyContent={"center"}
      sx={{ paddingTop: 5, paddingBottom: 5 }}
      spacing={2}
    >
      <Grid item container xs={12} spacing={2}>
        <PrototypeContainer></PrototypeContainer>
      </Grid>
    </Grid>
  );
}
