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
import { createSynonymSearchCypher } from "../utils/search-bar";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";
import GraphEntityDetails from "./GraphEntityDetails";
import SearchBar from "./SearchBar/SearchBar";

export default function GraphSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elements, setElements] = useState<ElementDefinition[]>([]);
  const [entityDetails, setEntityDetails] = useState<
    CytoscapeNodeData | undefined
  >(undefined);
  const BASIC_SEARCH_ERROR_MSG =
    "An error occured during your search. Please try again later.";
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
    setError(null);
  };

  const clearLongRequestTimer = () => {
    if (longRequestTimerId !== null) {
      clearTimeout(longRequestTimerId);
      longRequestTimerId = null;
    }
  };

  const handleSubmit = (term: string) => {
    const searchParams = new URLSearchParams(`q=${encodeURIComponent(term)}`);
    router.push(`?${searchParams.toString()}`);
    setValue(term);
  };

  const handleAdvancedSearch = (term: string | null) => {
    let advancedSearchParams;

    // If the advanced params are set in the url, ignore the search bar value
    if (searchParams.has("as_q")) {
      let query = `?as_q=${searchParams.get("as_q") || ""}`;
      query += `&as_epq=${searchParams.get("as_epq")}`;
      query += `&as_aq=${searchParams.get("as_aq")}`;
      query += `&as_eq=${searchParams.get("as_eq")}`;
      advancedSearchParams = new URLSearchParams(query);
    } else {
      // Otherwise use the search bar value as the initial advanced search query
      advancedSearchParams = new URLSearchParams(
        `q=${encodeURIComponent(term || "")}`
      );
    }
    router.push(
      `/data/c2m2/graph/advanced_search?${advancedSearchParams.toString()}`
    );
  };

  useEffect(() => {
    const query = searchParams.get("q");
    const anyQuery = searchParams.get("as_q");
    const phraseQuery = searchParams.get("as_epq");
    const allQuery = searchParams.get("as_aq");
    const noneQuery = searchParams.get("as_eq");
    let newValue = [];

    if (query !== null && query.length > 0) {
      newValue.push(query);
    }

    if (anyQuery !== null && anyQuery.length > 0) {
      newValue.push(anyQuery);
    }

    if (phraseQuery !== null && phraseQuery.length > 0) {
      newValue.push(`"${phraseQuery}"`);
    }

    if (allQuery !== null && allQuery.length > 0) {
      newValue.push(
        allQuery
          .split(" ")
          .map((s) => `+${s}`)
          .join(" ")
      );
    }

    if (noneQuery !== null && noneQuery.length > 0) {
      newValue.push(
        noneQuery
          .split(" ")
          .map((s) => `-${s}`)
          .join(" ")
      );
    }

    setValue(newValue.join(" "));
  }, []);

  useEffect(() => {
    if (value !== null && value.length > 0) {
      setLoading(true);

      setInitialNetworkData(createSynonymSearchCypher(value))
        .catch(() => setError(BASIC_SEARCH_ERROR_MSG))
        .finally(() => {
          setLoading(false);
          clearLongRequestTimer();
        });
    }
  }, [value]);

  const clearNetwork = () => {
    setElements([]);
  };

  const setInitialNetworkData = async (cypher: string) => {
    clearNetwork();

    // Make sure there isn't an active timer before we set a new id (the old timeout would be orphaned otherwise)
    clearLongRequestTimer();
    longRequestTimerId = setTimeout(() => {
      setError("Your search is taking longer than expected...");
    }, 10000);
    const records = await neo4jService.executeRead<SubGraph>(cypher);

    const cytoscapeElements = createCytoscapeElementsFromNeo4j(records);

    if (cytoscapeElements.length === 0) {
      setError("We couldn't find any results for your search");
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
