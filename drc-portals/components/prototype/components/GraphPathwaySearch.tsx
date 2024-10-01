"use client";

import { Grid } from "@mui/material";

import { ElementDefinition } from "cytoscape";
import { useState } from "react";

import { NodeResult } from "@/lib/neo4j/types";

import { DAGRE_LAYOUT, DEFAULT_STYLESHEET } from "../constants/cy";
import { SearchBarContainer } from "../constants/search-bar";
import { createCytoscapeElements } from "../utils/cy";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";
import PathwaySearchBar from "./SearchBar/PathwaySearchBar";

export default function GraphPathwaySearch() {
  const [elements, setElements] = useState<ElementDefinition[]>([]);

  const handleSubmit = (cvTerm: NodeResult) => {
    const cytoscapeElements = createCytoscapeElements({
      nodes: [cvTerm],
      relationships: [],
    });

    if (cytoscapeElements.length !== 0) {
      setElements(cytoscapeElements);
    }
  };

  return (
    <>
      <Grid
        container
        spacing={1}
        xs={12}
        sx={{
          height: "640px",
        }}
      >
        <Grid item xs={12} sx={{ position: "relative", height: "inherit" }}>
          <SearchBarContainer>
            <PathwaySearchBar onSubmit={handleSubmit}></PathwaySearchBar>
          </SearchBarContainer>
          <CytoscapeChart
            elements={elements}
            layout={DAGRE_LAYOUT}
            stylesheet={DEFAULT_STYLESHEET}
            cxtMenuEnabled={false}
            toolbarPosition={{ top: 10, right: 10 }}
          ></CytoscapeChart>
        </Grid>
      </Grid>
    </>
  );
}
