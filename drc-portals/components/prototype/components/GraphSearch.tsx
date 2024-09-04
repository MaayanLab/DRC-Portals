"use client";

import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import Rotate90DegreesCwIcon from "@mui/icons-material/Rotate90DegreesCw";
import Rotate90DegreesCcwIcon from "@mui/icons-material/Rotate90DegreesCcw";
import { Box, Divider, Grid, IconButton, Tooltip } from "@mui/material";
import { ElementDefinition, EventObject, LayoutOptions } from "cytoscape";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

import { fetchPathSearch, fetchSearch } from "@/lib/neo4j/api";
import { SubGraph } from "@/lib/neo4j/types";

import ExpandNodeMenuItem from "../components/CytoscapeChart/custom-cxt-menu-items/ExpandNodeMenuItem";
import ChartCxtMenuItem from "../components/CytoscapeChart/ChartCxtMenuItem";
import ChartNestedCxtMenuItem from "../components/CytoscapeChart/NestedChartCxtMenuItem";
import {
  D3_FORCE_LAYOUT,
  DEFAULT_STYLESHEET,
  SCHEMA_LEGEND,
  SCHEMA_RELATIONSHIP_ITEM,
  STYLE_CLASS_TO_LEGEND_KEY_MAP,
} from "../constants/cy";
import {
  BASIC_SEARCH_ERROR_MSG,
  NO_RESULTS_ERROR_MSG,
} from "../constants/search-bar";
import { SearchBarContainer } from "../constants/search-bar";
import { CytoscapeNodeData } from "../interfaces/cy";
import { CustomToolbarFnFactory, CytoscapeReference } from "../types/cy";
import {
  getSearchBarValue,
  getTextSearchValues,
} from "../utils/advanced-search";
import {
  D3_FORCE_TOOLS,
  createCytoscapeElements,
  downloadChartData,
  downloadChartPNG,
  downloadCyAsJson,
  highlightNeighbors,
  highlightNodesWithLabel,
  isNodeD3Locked,
  rotateChart,
  selectNeighbors,
  selectNodesWithLabel,
  selectionHasLockedNode,
  unlockD3ForceNode,
  unlockSelection,
} from "../utils/cy";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";
import GraphEntityDetails from "./GraphEntityDetails";
import SearchBar from "./SearchBar/SearchBar";

// TODO: May want to consider refactoring this into smaller components, or move some behavior into existing components, as this is getting
// quite large.
export default function GraphSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elements, setElements] = useState<ElementDefinition[]>([]);
  const [legend, setLegend] = useState<Map<string, ReactNode>>();
  const [entityDetails, setEntityDetails] = useState<
    CytoscapeNodeData | undefined
  >(undefined);
  let longRequestTimerId: NodeJS.Timeout | null = null;

  const { coreLabels, subjectGenders, subjectRaces, dccAbbrevs } =
    getTextSearchValues(searchParams);
  const [searchBarValue, setSearchBarValue] = useState<string>("");
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

  const highlightRenderChildren = (event: EventObject) => [
    <ChartCxtMenuItem
      key="chart-cxt-highlight-neighbors"
      renderContent={(event) => "Neighbors"}
      action={highlightNeighbors}
    ></ChartCxtMenuItem>,
    <ChartCxtMenuItem
      key="chart-cxt-highlight-nodes-with-label"
      renderContent={(event) => "Nodes with this Label"}
      action={highlightNodesWithLabel}
    ></ChartCxtMenuItem>,
  ];

  const selectRenderChildren = (event: EventObject) => [
    <ChartCxtMenuItem
      key="chart-cxt-highlight-neighbors"
      renderContent={(event) => "Select Neighbors"}
      action={selectNeighbors}
    ></ChartCxtMenuItem>,
    <ChartCxtMenuItem
      key="chart-cxt-highlight-nodes-with-label"
      renderContent={(event) => "Select Nodes with this Label"}
      action={selectNodesWithLabel}
    ></ChartCxtMenuItem>,
  ];

  const staticCxtMenuItems: ReactNode[] = [
    <ChartCxtMenuItem
      key="chart-cxt-download-selection"
      renderContent={(event) => "Download Selection"}
      action={(event) => downloadCyAsJson(event.cy.elements(":selected"))}
      showFn={(event) => event.cy.elements(":selected").length > 0}
    ></ChartCxtMenuItem>,
  ];

  const nodeCxtMenuItems: ReactNode[] = [
    <ChartCxtMenuItem
      key="chart-cxt-show-details"
      renderContent={(event) => "Show Details"}
      action={(event) => setEntityDetails(event.target.data())}
      showFn={(event) => event.cy.elements(":selected").length > 0}
    ></ChartCxtMenuItem>,
    <ExpandNodeMenuItem
      key="chart-cxt-expand"
      setElements={setElements}
    ></ExpandNodeMenuItem>,
    <ChartCxtMenuItem
      key="chart-cxt-unlock"
      renderContent={(event) => "Unlock"}
      action={(event) => unlockD3ForceNode(event.target)}
      showFn={(event) => isNodeD3Locked(event.target)}
    ></ChartCxtMenuItem>,
    <ChartCxtMenuItem
      key="chart-cxt-unlock-selection"
      renderContent={(event) => "Unlock Selection"}
      action={(event) => unlockSelection(event.cy.nodes(":selected"))}
      showFn={(event) => selectionHasLockedNode(event.cy.nodes(":selected"))}
    ></ChartCxtMenuItem>,
    <ChartNestedCxtMenuItem
      key="chart-cxt-highlight"
      renderContent={(event) => "Highlight"}
      renderChildren={highlightRenderChildren}
    ></ChartNestedCxtMenuItem>,
    <ChartNestedCxtMenuItem
      key="chart-cxt-select"
      renderContent={(event) => "Select"}
      renderChildren={selectRenderChildren}
    ></ChartNestedCxtMenuItem>,
  ];

  const customTools: CustomToolbarFnFactory[] = [
    ...D3_FORCE_TOOLS,
    (cyRef: CytoscapeReference, layout: LayoutOptions) =>
      rotateChart(
        "search-chart-toolbar-rotate-cw",
        "Rotate Clockwise",
        "rotate-cw",
        <Rotate90DegreesCwIcon />,
        90,
        cyRef,
        layout
      ),
    (cyRef: CytoscapeReference, layout: LayoutOptions) =>
      rotateChart(
        "search-chart-toolbar-rotate-ccw",
        "Rotate Counter-Clockwise",
        "rotate-ccw",
        <Rotate90DegreesCcwIcon />,
        -90,
        cyRef,
        layout
      ),
    () => {
      return (
        <Divider
          key="graph-search-d3-force-tools-toolbar-divider"
          orientation="vertical"
          variant="middle"
          flexItem
        />
      );
    },
    (cyRef: CytoscapeReference) =>
      downloadChartData(
        "search-chart-toolbar-download-data",
        "Download Data",
        cyRef
      ),
    (cyRef: CytoscapeReference) =>
      downloadChartPNG(
        "search-chart-toolbar-download-png",
        "Download PNG",
        cyRef
      ),
  ];

  const clearSearchError = () => {
    setError(null);
  };

  const setLongRequestTimer = () => {
    // Make sure there isn't an active timer before we set a new id (the old timeout would be orphaned otherwise)
    clearLongRequestTimer();
    longRequestTimerId = setTimeout(() => {
      setError("Your search is taking longer than expected...");
    }, 10000);
  };

  const clearLongRequestTimer = () => {
    if (longRequestTimerId !== null) {
      clearTimeout(longRequestTimerId);
      longRequestTimerId = null;
    }
  };

  const clearNetwork = () => {
    setElements([]);
  };

  const resetLegend = () => {
    if (elements.length === 0) {
      setLegend(undefined);
    } else {
      const newLegend = new Map<string, ReactNode>();
      const nodeClasses = new Set<string>();
      let relationshipElementFound = false;

      elements.forEach((element) => {
        if (element.data.source !== undefined) {
          relationshipElementFound = true;
        } else {
          const elementClasses = element.classes;
          if (typeof elementClasses === "string") {
            elementClasses
              .split(" ")
              .forEach((value) => nodeClasses.add(value));
          } else if (Array.isArray(elementClasses)) {
            elementClasses.forEach((value) => nodeClasses.add(value));
          }
        }
      });

      Array.from(nodeClasses)
        .sort()
        .forEach((nodeClass) => {
          const legendKey = STYLE_CLASS_TO_LEGEND_KEY_MAP.get(nodeClass);
          if (legendKey !== undefined) {
            newLegend.set(legendKey, SCHEMA_LEGEND.get(legendKey));
          }
        });

      if (relationshipElementFound) {
        newLegend.set(
          SCHEMA_RELATIONSHIP_ITEM,
          SCHEMA_LEGEND.get(SCHEMA_RELATIONSHIP_ITEM)
        );
      }
      setLegend(newLegend);
    }
  };

  // TODO: Could probably wrap the two search queries in a shared function which does all the state management, since the handling of the result is nearly identical
  const getSearchResults = (
    query: string,
    labels: string[],
    dccs: string[],
    genders: string[],
    races: string[]
  ) => {
    setLoading(true);
    clearNetwork();
    setLongRequestTimer();
    fetchSearch(query, labels, dccs, genders, races)
      .then((response) => response.json())
      .then((data: SubGraph) => {
        const cytoscapeElements = createCytoscapeElements(data);

        if (cytoscapeElements.length === 0) {
          setError(NO_RESULTS_ERROR_MSG);
        } else {
          clearSearchError();
          setElements(cytoscapeElements);
        }
      })
      .catch(() => setError(BASIC_SEARCH_ERROR_MSG))
      .finally(() => {
        setLoading(false);
        clearLongRequestTimer();
      });
  };

  const getPathSearchResults = (pathQuery: string, queryParams: string) => {
    setLoading(true);
    clearNetwork();
    setLongRequestTimer();
    fetchPathSearch(pathQuery, queryParams)
      .then((response) => response.json())
      .then((data: SubGraph) => {
        const cytoscapeElements = createCytoscapeElements(data);

        if (cytoscapeElements.length === 0) {
          setError(NO_RESULTS_ERROR_MSG);
        } else {
          clearSearchError();
          setElements(cytoscapeElements);
        }
      })
      .catch(() => setError(BASIC_SEARCH_ERROR_MSG))
      .finally(() => {
        setLoading(false);
        clearLongRequestTimer();
      });
  };

  useEffect(() => {
    resetLegend();
  }, [elements]);

  useEffect(() => {
    if (searchParams.has("q") || searchParams.has("as_q")) {
      const newSearchBarValue = getSearchBarValue(searchParams);
      setSearchBarValue(newSearchBarValue);

      if (newSearchBarValue.length > 0) {
        // TODO: Something about handing the state objects into a function feels wrong to me, I've got a feeling there's a better way to do this...
        getSearchResults(
          newSearchBarValue,
          coreLabels,
          dccAbbrevs,
          subjectGenders,
          subjectRaces
        );
      }
    } else if (searchParams.has("schema_q")) {
      const pathQuery = searchParams.get("schema_q") || "";
      const queryParams = searchParams.get("cy_params") || "";

      getPathSearchResults(pathQuery, queryParams);
    }
  }, [searchParams]);

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
          legend={legend}
          legendPosition={{ bottom: 10, left: 10 }}
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
