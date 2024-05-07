"use client";

import { Grid } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import GraphSchemaContainer from "./GraphSchemaContainer";
import GraphSearchContainer from "./GraphSearchContainer";

export default function PrototypeContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState<string | null>(
    searchParams.get("q")
  );

  const updateQuery = (state: string) => {
    const query = btoa(state);
    router.push(`${pathname}?q=${query}`);
    setSearchQuery(query);
  };

  return (
    <>
      <Grid item xs={12}>
        <GraphSchemaContainer onPathSearch={updateQuery}></GraphSchemaContainer>
      </Grid>
      {/* TODO: Make the column size dependent on the presence of the other columns */}
      {/* <Grid item xs={12} lg={3}>
          <Paper sx={{padding: "12px 24px" }} elevation={0}>
            <div className="flex flex-row align-middle justify-between border-b border-b-slate-400 mb-4">
              <Typography variant="h5">Path Settings</Typography>
            </div>
          </Paper>
        </Grid> */}
      {/* TODO: Make the column size dependent on the presence of the other columns */}
      <Grid
        item
        xs={12}
        sx={{
          height: "640px",
          position: "relative",
        }}
      >
        <GraphSearchContainer
          query={searchQuery}
          onSubmit={updateQuery}
        ></GraphSearchContainer>
      </Grid>
      {/* TODO: Make the column size dependent on the presence of the other columns */}
      {/* <Grid item xs={12} lg={3}>
          <Paper sx={{padding: "12px 24px" }} elevation={0}>
            <div className="flex flex-row align-middle justify-between border-b border-b-slate-400 mb-4">
              <Typography variant="h5">Entity Details</Typography>
            </div>
          </Paper>
        </Grid> */}
    </>
  );
}
