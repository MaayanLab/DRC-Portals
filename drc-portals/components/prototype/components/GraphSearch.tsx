"use client";

import { Grid, styled } from "@mui/material";
import { ElementDefinition, EventObjectNode } from "cytoscape";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { D3_FORCE_LAYOUT, DEFAULT_STYLESHEET } from "../constants/cy";
import { NodeCxtMenuItem, CytoscapeNodeData } from "../interfaces/cy";
import { SubGraph } from "../interfaces/neo4j";
import { getDriver } from "../neo4j";
import Neo4jService from "../services/neo4j";
import { CytoscapeReference } from "../types/cy";
import {
  createCytoscapeElementsFromNeo4j,
  unlockD3ForceNodes,
} from "../utils/cy";
import {
  createCypher,
  createSynonymSearchCypher,
  getStateFromQuery,
} from "../utils/search-bar";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";
import GraphEntityDetails from "./GraphEntityDetails";
import SearchBar from "./SearchBar/SearchBar";

export default function GraphSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q"));
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [elements, setElements] = useState<ElementDefinition[]>([]);
  const [entityDetails, setEntityDetails] = useState<
    CytoscapeNodeData | undefined
  >(undefined);
  const BASIC_SEARCH_ERROR_MSG =
    "An error occured during your search. Please try again later.";
  const SEARCH_QUERY_ERROR_MSG = "There was an error in your search query.";
  const neo4jService: Neo4jService = new Neo4jService(getDriver());
  let longRequestTimerId: NodeJS.Timeout | null = null;

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

  const customTools = [
    // Unlock All Nodes button
    (cyRef: CytoscapeReference) =>
      unlockD3ForceNodes(
        "search-chart-toolbar-unlock-btn",
        "Unlock All Nodes",
        cyRef
      ),
  ];

  const clearSearchError = () => {
    setSearchError(null);
  };

  const clearLongRequestTimer = () => {
    if (longRequestTimerId !== null) {
      clearTimeout(longRequestTimerId);
      longRequestTimerId = null;
    }
  };

  const handleSubmit = (term: string) => {
    const query = btoa(JSON.stringify(term));
    router.push(`?q=${query}`);
    setQuery(query);
  };

  const handleInvalidQuery = () => {
    setSearchError(SEARCH_QUERY_ERROR_MSG);
    setLoading(false);
  };

  useEffect(() => {
    if (query !== null) {
      let parsedQuery: any;
      try {
        // Attempt to parse the query to a JSON object, and abort if the parse fails for any reason
        parsedQuery = JSON.parse(atob(query));
      } catch {
        handleInvalidQuery();
        return;
      }

      const state = getStateFromQuery(parsedQuery);
      if (state !== undefined) {
        // Regardless of the value of "state", clear the search value, since we reach this point as a result of using the advanced search
        setSearchValue(null);
        setLoading(true);

        let cypher: string;
        try {
          // "state" *should* be a valid SearchBarState object, but we wrap "createCypher" in a try-block just in case
          cypher = createCypher(state);
        } catch {
          // If we couldn't parse the state object into cypher, abort
          handleInvalidQuery();
          return;
        }

        // Finally, try querying Neo4j with the cypher we created
        setInitialNetworkData(cypher)
          .catch(() => setSearchError(BASIC_SEARCH_ERROR_MSG))
          .finally(() => {
            setLoading(false);
            clearLongRequestTimer();
          });
      } else if (typeof parsedQuery === "string") {
        setSearchValue(parsedQuery);

        // Do nothing if the query is empty for any reason
        if (parsedQuery.length > 0) {
          setLoading(true);

          // If the query parsed as a string object, run a synonym search instead
          setInitialNetworkData(createSynonymSearchCypher(parsedQuery))
            .catch(() => setSearchError(BASIC_SEARCH_ERROR_MSG))
            .finally(() => {
              setLoading(false);
              clearLongRequestTimer();
            });
        }
      } else {
        handleInvalidQuery();
      }
    }
  }, [query]);

  const clearNetwork = () => {
    setElements([]);
  };

  const setInitialNetworkData = async (value: string) => {
    clearNetwork();

    // Make sure there isn't an active timer before we set a new id (the old timeout would be orphaned otherwise)
    clearLongRequestTimer();
    longRequestTimerId = setTimeout(() => {
      setSearchError("Your search is taking longer than expected...");
    }, 10000);
    const records = await neo4jService.executeRead<SubGraph>(value);

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
            value={searchValue}
            error={searchError}
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
