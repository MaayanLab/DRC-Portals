"use client";

import { Grid } from "@mui/material";
import { useEffect, useState } from "react";

import {
  BASIC_SEARCH_ERROR_MSG,
  D3_FORCE_LAYOUT,
  DEFAULT_STYLESHEET,
  SEARCH_QUERY_ERROR_MSG,
} from "../constants/cy";
import { SchemaAutocompleteContainer } from "../constants/query-builder";
import { SearchBarState } from "../interfaces/query-builder";
import { createCypher, getStateFromQuery } from "../utils/query-builder";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";
import GraphEntityDetails from "./GraphEntityDetails";
import SchemaAutocomplete from "./SchemaSearch/SchemaAutocomplete";
import useGraphSearchBehavior from "../hooks/graph-search";

export default function SchemaSearch() {
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

  const [query, setQuery] = useState(searchParams.get("q"));
  const [state, setState] = useState(
    query === null ? undefined : getStateFromQuery(query)
  );

  const updateQuery = (state: string) => {
    const query = btoa(state);
    router.push(`?q=${query}`);
    setQuery(query);
  };

  const handleSubmit = (state: SearchBarState) => {
    updateQuery(JSON.stringify(state));
  };

  useEffect(() => {
    if (query !== null) {
      const state = getStateFromQuery(query);
      if (state !== undefined) {
        let cypher: string;
        setLoading(true);

        try {
          // "state" *should* be a valid SearchBarState object, but we wrap "createCypher" in a try-block just in case
          cypher = createCypher(state);
        } catch {
          // If we couldn't parse the state object into cypher, abort
          setError(BASIC_SEARCH_ERROR_MSG);
          setLoading(false);
          return;
        }

        // If we couldn't create the cypher, the state object probably wasn't valid. So, we only set the search bar state after we've
        // created the cypher.
        setState(state);

        // Finally, try querying Neo4j with the cypher we created
        setInitialNetworkData(cypher)
          .catch(() => setError(BASIC_SEARCH_ERROR_MSG))
          .finally(() => {
            setLoading(false);
            clearLongRequestTimer();
          });
      } else {
        setError(SEARCH_QUERY_ERROR_MSG);
      }
    }
  }, [query]);

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
        <SchemaAutocompleteContainer>
          <SchemaAutocomplete
            state={state}
            error={error}
            loading={loading}
            clearError={clearSearchError}
            onSubmit={handleSubmit}
          ></SchemaAutocomplete>
        </SchemaAutocompleteContainer>
        <CytoscapeChart
          elements={elements}
          layout={D3_FORCE_LAYOUT}
          stylesheet={DEFAULT_STYLESHEET}
          toolbarPosition={{ top: 10, right: 10 }}
          customTools={customTools}
          nodeCxtMenuItems={nodeCxtMenuItems}
          staticCxtMenuItems={staticCxtMenuItems}
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
