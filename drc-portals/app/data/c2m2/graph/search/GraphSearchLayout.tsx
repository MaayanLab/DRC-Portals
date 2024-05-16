"use client";

import { Grid } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import GraphSearchContainer from "@/components/prototype/components/GraphSearchContainer";

export default function GraphSearchLayout() {
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
    <Grid
      container
      justifyContent={"center"}
      sx={{ paddingTop: 2, paddingBottom: 2 }}
      spacing={2}
    >
      <Grid item container xs={12} spacing={1}>
        <GraphSearchContainer
          query={searchQuery}
          onSubmit={updateQuery}
        ></GraphSearchContainer>
      </Grid>
    </Grid>
  );
}
