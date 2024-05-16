"use client";

import { Grid } from "@mui/material";
import { useRouter } from "next/navigation";

import GraphSchema from "@/components/prototype/components/GraphSchema";

export default async function GraphSchemaLayout() {
  const router = useRouter();

  const updateQuery = (state: string) => {
    const query = btoa(state);
    router.push(`search?q=${query}`);
  };

  return (
    <Grid
      container
      justifyContent={"center"}
      sx={{ paddingTop: 2, paddingBottom: 2 }}
      spacing={2}
    >
      <Grid item container xs={12} spacing={1}>
        <GraphSchema onPathSearch={updateQuery}></GraphSchema>
      </Grid>
    </Grid>
  );
}
