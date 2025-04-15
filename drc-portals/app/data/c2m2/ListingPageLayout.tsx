'use client';
import React, { useEffect, useState } from "react";
import { Paper, Grid, Typography, Button, Box } from "@mui/material";
import { useRouter, useSearchParams } from '@/utils/navigation';
import { get_partial_list_string } from "@/app/data/c2m2/utils";

export default function ListingPageLayout(props: React.PropsWithChildren<{
  count?: number,
  filtered_count?: number,
  all_count_limit?: number,
  searchText?: string,
  filters?: React.ReactNode[] | React.ReactNode, // Modified type
  footer?: React.ReactNode,
  data?: { [key: string]: string | bigint | number; }[],
  downloadFileName?: string;
}>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const partial_list_string = props.filtered_count?.toLocaleString();
  const [filtersPresent, setFiltersPresent] = useState(false);
  const [showAllFilters, setShowAllFilters] = useState(false);

  const checkFilters = () => {
    const tParam = searchParams.get('t');
    return tParam !== null && tParam.trim() !== '';
  };

  useEffect(() => {
    setFiltersPresent(checkFilters());
  }, [searchParams]);

  const handleReset = () => {
    const baseUrl = window.location.pathname;
    const updatedParams = new URLSearchParams(window.location.search);
    updatedParams.delete('t');
    router.push(`${baseUrl}?${updatedParams.toString()}`);
  };

  // 🧠 Convert filters to array (if needed)
  const filterElements = React.Children.toArray(props.filters);
  const maxVisible = 8;
  const visibleFilters = showAllFilters ? filterElements : filterElements.slice(0, maxVisible);
  const showMoreButton = filterElements.length > maxVisible;

  return (
    <Grid container justifyContent={"center"} spacing={2}>
      <Grid item container xs={12} spacing={2}>
        <Grid item xs={12} sm={props.filters ? 9 : 12}>
          {props.children}
        </Grid>

        {props.filters && (
          <Grid item xs={12} sm={3}>
            <Paper
              sx={{
                background: "linear-gradient(180deg, #EDF0F8 0%, transparent 100%)",
                height: '100%',
                padding: "12px 24px"
              }}
              elevation={0}
            >
              <div className="flex flex-row align-middle justify-between border-b border-b-slate-400 mb-4">
                <Typography variant="h5">Results found: </Typography>
                <Typography variant="h5"> {`${partial_list_string}`} </Typography>
              </div>

              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h5">Filters</Typography>
                <Button
                  onClick={handleReset}
                  variant="outlined"
                  color="secondary"
                  sx={{ marginLeft: 2 }}
                  disabled={!filtersPresent}
                >
                  Reset All
                </Button>
              </Box>

              <div className="flex flex-col text-cyan-700 text-lg mt-2">
                {visibleFilters}
                {showMoreButton && !showAllFilters && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    onClick={() => setShowAllFilters(true)}
                    sx={{
                      mt: 2,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      boxShadow: 2,
                      borderRadius: 2,
                      alignSelf: 'flex-start',
                    }}
                  >
                    + More filters
                  </Button>
                )}

              </div>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Grid item xs={12}>
        {props.footer}
      </Grid>
    </Grid>
  );
}
