"use client";

import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import {
  Alert,
  AlertColor,
  Fab,
  Grid,
  Snackbar,
  SnackbarCloseReason,
  Tooltip,
} from "@mui/material";

import { ElementDefinition, EventObject } from "cytoscape";
import { useEffect, useState, ReactNode } from "react";

import ExpandNodeMenuItem from "../../components/CytoscapeChart/custom-cxt-menu-items/ExpandNodeMenuItem";
import ChartCxtMenuItem from "../../components/CytoscapeChart/ChartCxtMenuItem";
import ChartNestedCxtMenuItem from "../../components/CytoscapeChart/NestedChartCxtMenuItem";
import {
  DEFAULT_STYLESHEET,
  EULER_LAYOUT,
  SCHEMA_LEGEND,
  SCHEMA_RELATIONSHIP_ITEM,
  STYLE_CLASS_TO_LEGEND_KEY_MAP,
} from "../../constants/cy";
import { PathwayModeBtnContainer } from "../../constants/pathway-search";
import { CytoscapeNodeData } from "../../interfaces/cy";
import { CustomToolbarFnFactory, CytoscapeReference } from "../../types/cy";
import {
  downloadChartData,
  downloadChartPNG,
  downloadCyAsJson,
  hideElement,
  hideSelection,
  highlightNeighbors,
  highlightNodesWithLabel,
  isNodeD3Locked,
  resetHighlights,
  selectAll,
  selectNeighbors,
  selectNodesWithLabel,
  selectionHasLockedNode,
  selectionIsAllHidden,
  selectionIsAllShown,
  showElement,
  showSelection,
  unlockD3ForceNode,
  unlockSelection,
} from "../../utils/cy";

import CytoscapeChart from "../CytoscapeChart/CytoscapeChart";
import GraphEntityDetails from "../GraphEntityDetails";

interface GraphPathwayResultsProps {
  elements: ElementDefinition[];
  onReturnBtnClick: () => void;
}

export default function GraphPathwayResults(
  cmpProps: GraphPathwayResultsProps
) {
  const { onReturnBtnClick } = cmpProps;
  const [elements, setElements] = useState<ElementDefinition[]>(
    cmpProps.elements
  );
  const [legend, setLegend] = useState<Map<string, ReactNode>>();
  const [entityDetails, setEntityDetails] = useState<
    CytoscapeNodeData | undefined
  >(undefined);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>();

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
      key="cxt-menu-reset-highlights"
      renderContent={() => "Reset Highlights"}
      action={resetHighlights}
      showFn={(event) =>
        event.cy.elements(".highlight").length > 0 ||
        event.cy.elements(".transparent").length > 0
      }
    ></ChartCxtMenuItem>,
    <ChartCxtMenuItem
      key="chart-cxt-download-selection"
      renderContent={(event) => "Download Selection"}
      action={(event) => downloadCyAsJson(event.cy.elements(":selected"))}
      showFn={(event) => event.cy.elements(":selected").length > 0}
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
      key="cxt-menu-show"
      renderContent={(event) => "Show"}
      action={showElement}
      showFn={(event) => event.target.hasClass("transparent")}
    ></ChartCxtMenuItem>,
    <ChartCxtMenuItem
      key="cxt-menu-hide"
      renderContent={(event) => "Hide"}
      action={hideElement}
      showFn={(event) => !event.target.hasClass("transparent")}
    ></ChartCxtMenuItem>,
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

  const edgeCxtMenuItems = [
    <ChartCxtMenuItem
      key="cxt-menu-show"
      renderContent={(event) => "Show"}
      action={showElement}
      showFn={(event) => event.target.hasClass("transparent")}
    ></ChartCxtMenuItem>,
    <ChartCxtMenuItem
      key="cxt-menu-hide"
      renderContent={(event) => "Hide"}
      action={hideElement}
      showFn={(event) => !event.target.hasClass("transparent")}
    ></ChartCxtMenuItem>,
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

  return (
    <>
      <Grid
        item
        xs={entityDetails === undefined ? 12 : 9}
        sx={{ position: "relative", height: "inherit" }}
      >
        <CytoscapeChart
          elements={elements}
          layout={EULER_LAYOUT}
          stylesheet={DEFAULT_STYLESHEET}
          legend={legend}
          cxtMenuEnabled={true}
          tooltipEnabled={true}
          legendPosition={{ bottom: 10, left: 10 }}
          toolbarPosition={{ top: 10, right: 10 }}
          customTools={customTools}
          staticCxtMenuItems={staticCxtMenuItems}
          nodeCxtMenuItems={nodeCxtMenuItems}
          edgeCxtMenuItems={edgeCxtMenuItems}
          canvasCxtMenuItems={canvasCxtMenuItems}
        ></CytoscapeChart>
        <PathwayModeBtnContainer>
          <Tooltip title="Return to Path Search" arrow placement="left">
            <Fab
              aria-label="return-to-search"
              color="secondary"
              size="large"
              onClick={onReturnBtnClick}
            >
              <KeyboardReturnIcon />
            </Fab>
          </Tooltip>
        </PathwayModeBtnContainer>
      </Grid>
      {entityDetails !== undefined ? (
        <Grid item xs={3} sx={{ height: "inherit" }}>
          <GraphEntityDetails
            entityDetails={entityDetails}
            onCloseDetails={() => setEntityDetails(undefined)}
          />
        </Grid>
      ) : null}
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
