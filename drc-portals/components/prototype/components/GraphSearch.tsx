"use client";

import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { Box, Grid, IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";

import { D3_FORCE_LAYOUT, DEFAULT_STYLESHEET } from "../constants/cy";
import {
  BASIC_SEARCH_ERROR_MSG,
  NO_RESULTS_ERROR_MSG,
} from "../constants/search-bar";
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
  inputIsValidLucene,
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
  const [searchBarValue, setSearchBarValue] = useState<string>("");
  const [schemaValue, setSchemaValue] = useState<SchemaSearchPath[] | null>(
    null
  );
  const [searchHidden, setSearchHidden] = useState(false);
  const [showSearchHiddenTooltip, setShowSearchHiddenTooltip] = useState(false);

  const handleSubmit = (term: string) => {
    const params = new URLSearchParams(`q=${encodeURIComponent(term)}`);
    router.push(`?${params.toString()}`);
    setSearchBarValue(term);
    setEntityDetails(undefined); // Reset the entity details if a new query is submitted
  };

  const handleHideSearchBtnClicked = () => {
    setSearchHidden(!searchHidden);
    setShowSearchHiddenTooltip(false);
  };

  useEffect(() => {
    if (searchParams.size > 0) {
      setSchemaValue(
        getSchemaSearchValue(searchParams, () => {
          console.warn("Schema search params are malformed.");
          setError(BASIC_SEARCH_ERROR_MSG);
        })
      );
      setSearchBarValue(getSearchBarValue(searchParams));
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchBarValue.length > 0) {
      if (inputIsValidLucene(searchBarValue)) {
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
      } else {
        setError(NO_RESULTS_ERROR_MSG);
      }
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
      spacing={1}
      xs={12}
      sx={{
        height: "640px",
      }}
    >
      <Grid
        item
        xs={entityDetails === undefined ? 12 : 9}
        sx={{ position: "relative", height: "inherit" }}
      >
        <SearchBarContainer>
          {searchHidden ? null : (
            <SearchBar
              value={searchBarValue}
              error={error}
              loading={loading}
              clearError={clearSearchError}
              onSubmit={handleSubmit}
            ></SearchBar>
          )}
          <Box sx={{ alignContent: "center" }}>
            <Tooltip
              open={showSearchHiddenTooltip}
              title={searchHidden ? "Show Search" : "Hide Search"}
              disableHoverListener
              onMouseEnter={() => setShowSearchHiddenTooltip(true)}
              onMouseLeave={() => setShowSearchHiddenTooltip(false)}
              TransitionProps={{ exit: false }}
              arrow
            >
              <IconButton onClick={handleHideSearchBtnClicked}>
                {searchHidden ? (
                  <KeyboardDoubleArrowRightIcon />
                ) : (
                  <KeyboardDoubleArrowLeftIcon />
                )}
              </IconButton>
            </Tooltip>
          </Box>
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
        <Grid item xs={3} sx={{ height: "inherit" }}>
          <GraphEntityDetails
            entityDetails={entityDetails}
            onCloseDetails={() => setEntityDetails(undefined)}
          />
        </Grid>
      ) : null}
    </Grid>
  );
}
