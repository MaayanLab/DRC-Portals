"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Typography,
  styled,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ElementDefinition, LayoutOptions, Stylesheet } from "cytoscape";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { NEO4J_PASSWORD, NEO4J_URI, NEO4J_USERNAME } from "../constants/app";
import {
  DEFAULT_LAYOUT,
  DEFAULT_STYLESHEET,
  SCHEMA_ELEMENTS,
  SCHEMA_LAYOUT,
  SCHEMA_STYLESHEET,
} from "../constants/cy";
import { SubGraph } from "../interfaces/neo4j";
import { SearchBarState } from "../interfaces/search-bar";
import { getDriver, initDriver } from "../neo4j";
import Neo4jService from "../services/neo4j";
import { createCytoscapeElementsFromNeo4j } from "../utils/cy";
import { createCypher, getStateFromQuery } from "../utils/search-bar";

import ChartLegend from "./CytoscapeChart/ChartLegend";
import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";
import SearchBar from "./SearchBar/SearchBar";

const LegendContainer = styled(Box)({
  flexGrow: 1,
  position: "absolute",
  top: 10,
  right: 10,
  zIndex: 1,
  padding: "inherit",
});

const SearchBarContainer = styled("div")({
  flexGrow: 1,
  position: "absolute",
  top: 10,
  left: 10,
  zIndex: 1,
  padding: "inherit",
});

// TODO: Could possibly split out the schema chart, search bar, and result chart into their own container components, and move out some of
// these stateful objects into those containers. It's getting a little crowded here and it seems like since some of these are not related
// they ought to be segregated.
export default function PrototypeContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const BASIC_SEARCH_ERROR_MSG =
    "An error occured during your search. Please try again later.";
  const SEARCH_QUERY_ERROR_MSG = "There was an error in your search query.";

  // Search Bar state
  const [searchQuery, setSearchQuery] = useState<string | null>(
    searchParams.get("q")
  );
  const [searchState, setSearchState] = useState<SearchBarState | undefined>(
    searchQuery !== null ? getStateFromQuery(searchQuery) : undefined
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Cytoscape Chart state
  const [elements, setElements] = useState<ElementDefinition[]>([]);
  const [layout, setLayout] = useState<LayoutOptions>(DEFAULT_LAYOUT);
  const [stylesheet, setStylesheet] = useState<
    string | Stylesheet | Stylesheet[]
  >(DEFAULT_STYLESHEET);

  initDriver(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD);

  const neo4jService = new Neo4jService(getDriver());

  useEffect(() => {
    if (searchQuery !== null) {
      const state = getStateFromQuery(searchQuery);
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
        setSearchState(state);

        // Finally, try querying Neo4j with the cypher we created
        setInitialNetworkData(createCypher(state))
          .catch(() => setSearchError(BASIC_SEARCH_ERROR_MSG))
          .finally(() => setLoading(false));
      } else {
        setSearchError(SEARCH_QUERY_ERROR_MSG);
      }
    }
  }, [searchQuery]);

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

  const clearSearchError = () => {
    setSearchError(null);
  };

  const handleSearchSubmit = (state: SearchBarState) => {
    const query = btoa(JSON.stringify(state));
    router.push(`${pathname}?q=${query}`);
    setSearchQuery(query);
  };

  return (
    <>
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary
            sx={{ height: "inherit" }}
            expandIcon={<ExpandMoreIcon color="secondary" />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <Typography color="secondary">
              View Interactive Graph Schema
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              height: "640px",
              position: "relative",
            }}
          >
            <LegendContainer>
              <ChartLegend></ChartLegend>
            </LegendContainer>
            <CytoscapeChart
              elements={SCHEMA_ELEMENTS}
              layout={SCHEMA_LAYOUT}
              stylesheet={SCHEMA_STYLESHEET}
            ></CytoscapeChart>
          </AccordionDetails>
        </Accordion>
      </Grid>
      {/* TODO: Make the column size dependent on the presence of the other columns */}
      {/* <Grid item xs={12} lg={3}>
          <Paper sx={{padding: "12px 24px" }} elevation={0}>
            <div className="flex flex-row align-middle justify-between border-b border-b-slate-400 mb-4">
              <Typography variant="h5">Path Settings</Typography>
            </div>
          </Paper>
        </Grid> */}
      {/* TODO: Make the column size dependent on the presence of the other columns */}
      <Grid
        item
        xs={12}
        sx={{
          height: "640px",
          position: "relative",
        }}
      >
        <SearchBarContainer>
          <SearchBar
            state={searchState}
            error={searchError}
            loading={loading}
            clearError={clearSearchError}
            onSubmit={handleSearchSubmit}
          ></SearchBar>
        </SearchBarContainer>
        <CytoscapeChart
          elements={elements}
          layout={layout}
          stylesheet={stylesheet}
        ></CytoscapeChart>
      </Grid>
      {/* TODO: Make the column size dependent on the presence of the other columns */}
      {/* <Grid item xs={12} lg={3}>
          <Paper sx={{padding: "12px 24px" }} elevation={0}>
            <div className="flex flex-row align-middle justify-between border-b border-b-slate-400 mb-4">
              <Typography variant="h5">Entity Details</Typography>
            </div>
          </Paper>
        </Grid> */}
    </>
  );
}
