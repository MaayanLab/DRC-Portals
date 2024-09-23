"use client";

import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Rotate90DegreesCwIcon from "@mui/icons-material/Rotate90DegreesCw";
import Rotate90DegreesCcwIcon from "@mui/icons-material/Rotate90DegreesCcw";
import {
  Alert,
  AlertColor,
  Box,
  Divider,
  Grid,
  IconButton,
  Snackbar,
  SnackbarCloseReason,
  Tooltip,
} from "@mui/material";

import { ElementDefinition, EventObject, LayoutOptions } from "cytoscape";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, ReactNode, Fragment } from "react";

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
  hideSelection,
  highlightNeighbors,
  highlightNodesWithLabel,
  isNodeD3Locked,
  rotateChart,
  selectAll,
  selectNeighbors,
  selectNodesWithLabel,
  selectionHasLockedNode,
  selectionIsAllHidden,
  selectionIsAllShown,
  showSelection,
  unlockD3ForceNode,
  unlockSelection,
} from "../utils/cy";
import { createVerticalDividerElement } from "../utils/shared";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";
import GraphEntityDetails from "./GraphEntityDetails";
import SearchBar from "./SearchBar/SearchBar";

// TODO: May want to consider refactoring this into smaller components, or move some behavior into existing components, as this is getting
// quite large.
export default function GraphSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elements, setElements] = useState<ElementDefinition[]>([]);
  const [legend, setLegend] = useState<Map<string, ReactNode>>();
  const [entityDetails, setEntityDetails] = useState<
    CytoscapeNodeData | undefined
  >(undefined);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>();
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

  const handleExpandNodeError = (error: string) => {
    setSnackbarMsg(error);
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };

  const resetSearch = () => {
    router.push(pathname);
    clearNetwork();
    setSearchBarValue("");
  };

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
  const getSearchResults = async (
    query: string,
    labels: string[],
    dccs: string[],
    genders: string[],
    races: string[]
  ) => {
    setLoading(true);
    clearNetwork();
    setLongRequestTimer();
    try {
      const response = await fetchSearch(query, labels, dccs, genders, races);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const cytoscapeElements = createCytoscapeElements(data);

      if (cytoscapeElements.length === 0) {
        setError(NO_RESULTS_ERROR_MSG);
      } else {
        clearSearchError();
        setElements(cytoscapeElements);
      }
    } catch {
      setError(BASIC_SEARCH_ERROR_MSG);
    } finally {
      setLoading(false);
      clearLongRequestTimer();
    }
  };

  const getPathSearchResults = async (
    pathQuery: string,
    queryParams: string
  ) => {
    setLoading(true);
    clearNetwork();
    setLongRequestTimer();

    try {
      const response = await fetchPathSearch(pathQuery, queryParams);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: SubGraph = await response.json();
      const cytoscapeElements = createCytoscapeElements(data);
      if (cytoscapeElements.length === 0) {
        setError(NO_RESULTS_ERROR_MSG);
      } else {
        clearSearchError();
        setElements(cytoscapeElements);
      }
    } catch {
      setError(BASIC_SEARCH_ERROR_MSG);
    } finally {
      setLoading(false);
      clearLongRequestTimer();
    }
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

  const selectionCxtMenuItems: ReactNode[] = [
    <ChartCxtMenuItem
      key="chart-cxt-download-selection"
      renderContent={(event) => "Download Selection"}
      action={(event) => downloadCyAsJson(event.cy.elements(":selected"))}
    ></ChartCxtMenuItem>,
    <ChartCxtMenuItem
      key="chart-cxt-show-selection"
      renderContent={(event) => "Show Selection"}
      action={showSelection}
      showFn={(event) => !selectionIsAllShown(event)}
    ></ChartCxtMenuItem>,
    <ChartCxtMenuItem
      key="chart-cxt-hide-selection"
      renderContent={(event) => "Hide Selection"}
      action={hideSelection}
      showFn={(event) => !selectionIsAllHidden(event)}
    ></ChartCxtMenuItem>,
  ];

  const nodeCxtMenuItems: ReactNode[] = [
    <ChartCxtMenuItem
      key="chart-cxt-show-details"
      renderContent={(event) => "Show Details"}
      action={(event) => setEntityDetails(event.target.data())}
    ></ChartCxtMenuItem>,
    <ExpandNodeMenuItem
      key="chart-cxt-expand"
      setElements={setElements}
      onError={handleExpandNodeError}
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
      action={unlockSelection}
      showFn={selectionHasLockedNode}
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

  const canvasCxtMenuItems = [
    <ChartCxtMenuItem
      key="cxt-menu-select-all"
      renderContent={() => "Select All"}
      action={selectAll}
    ></ChartCxtMenuItem>,
  ];

  // TODO: We could probably reduce some of the repetition in these function definitions...also would be nice to move this to another file
  const customTools: CustomToolbarFnFactory[] = [
    () => {
      return (
        <Fragment key="search-chart-toolbar-reset-search">
          <Tooltip title="Reset Search" arrow>
            <IconButton aria-label="reset-search" onClick={resetSearch}>
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </Fragment>
      );
    },
    () =>
      createVerticalDividerElement("graph-search-reset-search-toolbar-divider"),
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
    () =>
      createVerticalDividerElement(
        "graph-search-d3-force-tools-toolbar-divider"
      ),
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
    } else if (searchParams.size === 0) {
      // If search params are empty, clear the search regardless of how the user arrived, e.g. url, browser back/forward, etc...
      resetSearch();
    }
  }, [searchParams]);

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
            selectionCxtMenuItems={selectionCxtMenuItems}
            nodeCxtMenuItems={nodeCxtMenuItems}
            canvasCxtMenuItems={canvasCxtMenuItems}
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
      <Snackbar
        open={snackbarOpen}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </>
  );
}
