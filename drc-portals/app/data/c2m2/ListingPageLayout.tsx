'use client';
import React, { useEffect, useState } from "react";
import { Paper, Grid, Typography, Button, Box } from "@mui/material";
import { useRouter, useSearchParams } from 'next/navigation'; // Import useRouter and useSearchParams
import DownloadButton from "./DownloadButton";
import { get_partial_list_string } from "@/app/data/c2m2/utils";

export default function ListingPageLayout(props: React.PropsWithChildren<{
  count?: number,
  all_count?: number,
  all_count_limit?: number,
  searchText?: string,
  filters?: React.ReactNode,
  footer?: React.ReactNode,
  data?: { [key: string]: string | bigint | number; }[],
  downloadFileName?: string;
}>) {
  const router = useRouter(); // Initialize useRouter
  const searchParams = useSearchParams(); // Initialize useSearchParams
  const partial_list_string = get_partial_list_string(props.all_count ?? 0, props.count ?? 0, props.all_count_limit ?? 0);

  // Track if there are filters in the URL
  const [filtersPresent, setFiltersPresent] = useState(false);

  // Function to determine if there are any 't' parameters in the URL
  const checkFilters = () => {
    const tParam = searchParams.get('t'); // Get the 't' parameter
    return tParam !== null && tParam.trim() !== ''; // Check if 't' is present and not empty
  };

  // Use useEffect to update filtersPresent whenever the URL changes
  useEffect(() => {
    setFiltersPresent(checkFilters()); // Update filtersPresent when the component renders or URL changes
  }, [searchParams]); // Trigger effect on URL changes

  // Handle reset filters action
  const handleReset = () => {
    const baseUrl = window.location.pathname;
    const updatedParams = new URLSearchParams(window.location.search); // Get the current search parameters

    // Clear all filters by deleting 't' parameter
    updatedParams.delete('t');
    // Optionally delete 'q' parameter if needed
    // updatedParams.delete('q');

    // Redirect to the updated URL
    router.push(`${baseUrl}?${updatedParams.toString()}`);
  };

  return (
    <Grid container justifyContent={"center"} sx={{ paddingTop: 5, paddingBottom: 5 }} spacing={2}>
      <Grid item container xs={12} spacing={2}>
        <Grid item xs={12} sm={props.filters ? 9 : 12}>
          {props.children}
          <Grid item xs={12}>
            {/*<DownloadButton data={props.data} filename={props.downloadFileName}/>*/}
          </Grid>
        </Grid>

        {props.filters && (
          <Grid item xs={12} sm={3}>
            <Paper sx={{ background: "linear-gradient(180deg, #EDF0F8 0%, transparent 100%)", height: '100%', padding: "12px 24px" }} elevation={0}>
              <div className="flex flex-row align-middle justify-between border-b border-b-slate-400 mb-4">
                <Typography variant="h5">Results found: </Typography>
                <Typography variant="h5">&ge; {`${partial_list_string}`} </Typography>
              </div>
              
              {/* Use a Box to align Filter and Reset All button on the same row */}
              <div>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle1">Filter</Typography>
                <Button 
                  onClick={handleReset} 
                  variant="outlined" 
                  color="secondary"
                  sx={{ marginLeft: 2 }} // Add some margin for spacing
                  disabled={!filtersPresent} // Disable if no 't' parameters
                >
                  Reset All
                </Button>
              </Box>
              </div>
              <div className="flex flex-col text-cyan-700 text-lg">
                {props.filters}
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
