"use client";

import { Grid } from "@mui/material";
import { useEffect, useState } from "react";

import {
  BASIC_SEARCH_ERROR_MSG,
  D3_FORCE_LAYOUT,
  DEFAULT_STYLESHEET,
} from "../constants/cy";
import { SearchBarContainer } from "../constants/search-bar";
import useGraphSearchBehavior from "../hooks/graph-search";
import { SchemaSearchPath } from "../interfaces/schema-search";
import {
  getSchemaSearchValue,
  getSearchBarValue,
  getTextSearchValues,
} from "../utils/advanced-search";
import {
  createSchemaSearchCypher,
  createSynonymSearchCypher,
} from "../utils/neo4j";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";
import GraphEntityDetails from "./GraphEntityDetails";
import SearchBar from "./SearchBar/SearchBar";

export default function GraphSearch() {
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
  } = getTextSearchValues(searchParams);
  const [searchBarValue, setSearchBarValue] = useState<string | null>(null);
  const [schemaValue, setSchemaValue] = useState<SchemaSearchPath[] | null>(
    null
  );

  const handleSubmit = (term: string) => {
    const searchParams = new URLSearchParams(`q=${term}`);
    router.push(`?${searchParams.toString()}`);
    setSearchBarValue(term);
    setEntityDetails(undefined); // Reset the entity details if a new query is submitted
  };

  useEffect(() => {
    if (searchParams.size > 0) {
      setSearchBarValue(getSearchBarValue(searchParams));
      setSchemaValue(getSchemaSearchValue(searchParams));
    }
  }, []);

  useEffect(() => {
    if (searchBarValue !== null && searchBarValue.length > 0) {
      setLoading(true);
      setInitialNetworkData(
        createSynonymSearchCypher(
          searchBarValue,
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
  }, [searchBarValue]);

  useEffect(() => {
    if (
      !searchParams.has("q") &&
      !searchParams.has("as_q") &&
      schemaValue !== null
    ) {
      setLoading(true);
      setInitialNetworkData(createSchemaSearchCypher(schemaValue))
        .catch(() => setError(BASIC_SEARCH_ERROR_MSG))
        .finally(() => {
          setLoading(false);
          clearLongRequestTimer();
        });
    }
  }, [schemaValue]);

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
            value={searchBarValue}
            error={error}
            loading={loading}
            clearError={clearSearchError}
            onSubmit={handleSubmit}
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
