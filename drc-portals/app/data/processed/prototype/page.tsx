import { Grid } from "@mui/material";

import PrototypeContainer from "@/components/prototype/components/PrototypeContainer";

export default async function Page() {
  return (
    <Grid
      container
      justifyContent={"center"}
      sx={{ paddingTop: 2, paddingBottom: 2 }}
      spacing={2}
    >
      <PrototypeContainer></PrototypeContainer>
    </Grid>
  );
}
