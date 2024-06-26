"use client";

import { Grid } from "@mui/material";
import { useEffect, useState } from "react";

import {
  BASIC_SEARCH_ERROR_MSG,
  D3_FORCE_LAYOUT,
  DEFAULT_STYLESHEET,
} from "../constants/cy";
import { SearchBarContainer } from "../constants/search-bar";
import { getAdvancedSynonymSearchValuesFromParams } from "../utils/advanced-search";
import {
  createSynonymSearchCypher,
  getValueFromSearchParams,
} from "../utils/search-bar";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";
import GraphEntityDetails from "./GraphEntityDetails";
import SearchBar from "./SearchBar/SearchBar";
import useGraphSearchBehavior from "../hooks/graph-search";

export default function SynonymSearch() {
  const {
    searchParams,
    router,
    loading,
    error,
    elements,
    entityDetails,
    setLoading,
    setError,
    setEntityDetails,
    staticCxtMenuItems,
    nodeCxtMenuItems,
    customTools,
    clearSearchError,
    clearLongRequestTimer,
    setInitialNetworkData,
  } = useGraphSearchBehavior();
  const {
    searchFile,
    searchSubject,
    searchBiosample,
    subjectGenders,
    subjectRaces,
    dccNames,
  } = getAdvancedSynonymSearchValuesFromParams(searchParams);
  const [value, setValue] = useState<string | null>(null);

  const handleSubmit = (term: string) => {
    const searchParams = new URLSearchParams(`q=${term}`);
    router.push(`?${searchParams.toString()}`);
    setValue(term);
  };

  const handleAdvancedSearch = (term: string | null) => {
    let advancedSearchParams;

    // If the advanced params are set in the url, ignore the search bar value
    if (searchParams.has("as_q")) {
      advancedSearchParams = searchParams;
    } else {
      // Otherwise use the search bar value as the initial advanced search query
      advancedSearchParams = new URLSearchParams(`q=${term || ""}`);
    }
    router.push(
      `/data/c2m2/graph/search/advanced?${advancedSearchParams.toString()}`
    );
  };

  useEffect(() => {
    if (searchParams.size > 0) {
      setValue(getValueFromSearchParams(searchParams));
    }
  }, []);

  useEffect(() => {
    if (value !== null && value.length > 0) {
      setLoading(true);
      setInitialNetworkData(
        createSynonymSearchCypher(
          value,
          searchFile,
          searchSubject,
          searchBiosample,
          subjectGenders,
          subjectRaces,
          dccNames
        )
      )
        .catch(() => setError(BASIC_SEARCH_ERROR_MSG))
        .finally(() => {
          setLoading(false);
          clearLongRequestTimer();
        });
    }
  }, [value]);

  return (
    <Grid
      container
      item
      spacing={1}
      xs={12}
      sx={{
        height: "640px",
      }}
    >
      <Grid
        item
        xs={12}
        lg={entityDetails === undefined ? 12 : 9}
        sx={{ position: "relative", height: "inherit" }}
      >
        <SearchBarContainer>
          <SearchBar
            value={value}
            error={error}
            loading={loading}
            clearError={clearSearchError}
            onSubmit={handleSubmit}
            onAdvancedSearch={handleAdvancedSearch}
          ></SearchBar>
        </SearchBarContainer>
        <CytoscapeChart
          elements={elements}
          layout={D3_FORCE_LAYOUT}
          stylesheet={DEFAULT_STYLESHEET}
          toolbarPosition={{ top: 10, right: 10 }}
          customTools={customTools}
          staticCxtMenuItems={staticCxtMenuItems}
          nodeCxtMenuItems={nodeCxtMenuItems}
        ></CytoscapeChart>
      </Grid>
      {entityDetails !== undefined ? (
        <GraphEntityDetails
          entityDetails={entityDetails}
          onCloseDetails={() => setEntityDetails(undefined)}
        />
      ) : null}
    </Grid>
  );
}
