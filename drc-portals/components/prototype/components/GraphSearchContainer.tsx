"use client";

import { Grid, styled } from "@mui/material";
import { ElementDefinition, EventObjectNode } from "cytoscape";
import { useEffect, useState } from "react";

import { DEFAULT_LAYOUT, DEFAULT_STYLESHEET } from "../constants/cy";
import { NodeCxtMenuItem, CytoscapeNodeData } from "../interfaces/cy";
import { SubGraph } from "../interfaces/neo4j";
import { SearchBarState } from "../interfaces/search-bar";
import { getDriver } from "../neo4j";
import Neo4jService from "../services/neo4j";
import { createCytoscapeElementsFromNeo4j } from "../utils/cy";
import { createCypher, getStateFromQuery } from "../utils/search-bar";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";
import GraphEntityDetailsContainer from "./GraphEntityDetailsContainer";
import SearchBar from "./SearchBar/SearchBar";

type GraphSearchContainerProps = {
  query: string | null;
  onSubmit: (state: string) => void;
};

export default function GraphSearchContainer(
  cmpProps: GraphSearchContainerProps
) {
  const { query, onSubmit } = cmpProps;
  const [state, setState] = useState<SearchBarState | undefined>(
    query === null ? undefined : getStateFromQuery(query)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [elements, setElements] = useState<ElementDefinition[]>([]);
  const [entityDetails, setEntityDetails] = useState<
    CytoscapeNodeData | undefined
  >(undefined);
  const BASIC_SEARCH_ERROR_MSG =
    "An error occured during your search. Please try again later.";
  const SEARCH_QUERY_ERROR_MSG = "There was an error in your search query.";
  const neo4jService: Neo4jService = new Neo4jService(getDriver());

  const SearchBarContainer = styled("div")({
    flexGrow: 1,
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
    padding: "inherit",
  });

  const nodeCxtMenuItems: NodeCxtMenuItem[] = [
    {
      fn: (event: EventObjectNode) => setEntityDetails(event.target.data()),
      title: "Show Details",
    },
  ];

  const clearSearchError = () => {
    setSearchError(null);
  };

  const handleSubmit = (state: SearchBarState) => {
    onSubmit(JSON.stringify(state));
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
          setSearchError(BASIC_SEARCH_ERROR_MSG);
          setLoading(false);
          return;
        }

        // If we couldn't create the cypher, the state object probably wasn't valid. So, we only set the search bar state after we've
        // created the cypher.
        setState(state);

        // Finally, try querying Neo4j with the cypher we created
        setInitialNetworkData(cypher)
          .catch(() => setSearchError(BASIC_SEARCH_ERROR_MSG))
          .finally(() => setLoading(false));
      } else {
        setSearchError(SEARCH_QUERY_ERROR_MSG);
      }
    }
  }, [query]);

  const clearNetwork = () => {
    setElements([]);
  };

  const setInitialNetworkData = async (value: string) => {
    clearNetwork();

    const longRequestTimer = setTimeout(() => {
      setSearchError("Your search is taking longer than expected...");
    }, 10000);
    const records = await neo4jService.executeRead<SubGraph>(value);
    clearTimeout(longRequestTimer);

    const cytoscapeElements = createCytoscapeElementsFromNeo4j(records);

    if (cytoscapeElements.length === 0) {
      setSearchError("We couldn't find any results for your search");
    } else {
      clearSearchError();
      setElements(cytoscapeElements);
    }
  };

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
            state={state}
            error={searchError}
            loading={loading}
            clearError={clearSearchError}
            onSubmit={handleSubmit}
          ></SearchBar>
        </SearchBarContainer>
        <CytoscapeChart
          elements={elements}
          layout={DEFAULT_LAYOUT}
          stylesheet={DEFAULT_STYLESHEET}
          toolbarPosition={{ top: 10, right: 10 }}
          nodeCxtMenuItems={nodeCxtMenuItems}
        ></CytoscapeChart>
      </Grid>
      {entityDetails !== undefined ? (
        <GraphEntityDetailsContainer
          entityDetails={entityDetails}
          onCloseDetails={() => setEntityDetails(undefined)}
        />
      ) : null}
    </Grid>
  );
}
