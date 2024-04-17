"use client";

import { Box, Grid, Paper, Typography } from "@mui/material";
import { ElementDefinition, LayoutOptions, Stylesheet } from "cytoscape";
import { useState } from "react";

import { NEO4J_PASSWORD, NEO4J_URI, NEO4J_USERNAME } from "../constants/app";
import { DEFAULT_LAYOUT, DEFAULT_STYLESHEET } from "../constants/cy";
import { SubGraph } from "../interfaces/neo4j";
import { getDriver, initDriver } from "../neo4j";
import Neo4jService from "../services/neo4j";
import { createCytoscapeElementsFromNeo4j } from "../utils/cy";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";
import SearchBar from "./SearchBar/SearchBar";

export default function PrototypeContainer() {
  const [loadingSearchResults, setLoadingSearchResults] =
    useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [elements, setElements] = useState<ElementDefinition[]>([]);
  const [layout, setLayout] = useState<LayoutOptions>(DEFAULT_LAYOUT);
  const [stylesheet, setStylesheet] = useState<
    string | Stylesheet | Stylesheet[]
  >(DEFAULT_STYLESHEET);

  initDriver(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD);

  const neo4jService = new Neo4jService(getDriver());

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

  const handleSearchSubmit = async (value: string) => {
    setLoadingSearchResults(true);
    setInitialNetworkData(value)
      .catch(() =>
        setSearchError(
          "An error occured during your search. Please try again later."
        )
      )
      .finally(() => setLoadingSearchResults(false));
  };

  return (
    <>
      {/* TODO: Make the column size dependent on the presence of the other columns */}
      {/* <Grid item xs={12} lg={3}>
          <Paper sx={{padding: "12px 24px" }} elevation={0}>
            <div className="flex flex-row align-middle justify-between border-b border-b-slate-400 mb-4">
              <Typography variant="h5">Path Settings</Typography>
            </div>
            <div>
              <Typography>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id volutpat lacus laoreet non curabitur gravida arcu. Viverra maecenas accumsan lacus vel facilisis volutpat est velit. Nunc sed blandit libero volutpat sed. Volutpat odio facilisis mauris sit amet massa. Sagittis vitae et leo duis ut diam. Id interdum velit laoreet id donec ultrices tincidunt arcu non. Mattis molestie a iaculis at erat pellentesque adipiscing commodo. Sit amet volutpat consequat mauris nunc congue. Nulla pellentesque dignissim enim sit amet venenatis. Diam quam nulla porttitor massa id neque aliquam vestibulum. Vitae elementum curabitur vitae nunc sed velit. At tempor commodo ullamcorper a lacus. Adipiscing commodo elit at imperdiet dui accumsan sit amet nulla. Blandit aliquam etiam erat velit scelerisque in dictum non consectetur. Molestie at elementum eu facilisis sed odio morbi. Felis eget nunc lobortis mattis. A scelerisque purus semper eget duis. Elit duis tristique sollicitudin nibh sit. Ante metus dictum at tempor.</Typography>
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
        <SearchBar
          error={searchError}
          loading={loadingSearchResults}
          clearError={clearSearchError}
          onSubmit={handleSearchSubmit}
        ></SearchBar>
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
