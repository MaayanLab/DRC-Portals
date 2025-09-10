"use client";

import { Grid } from "@mui/material";
import { Core, EventObject } from "cytoscape";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { PathwaySearchResultRow } from "@/lib/neo4j/types";

import {
  DEFAULT_STYLESHEET,
  EULER_LAYOUT,
  SCHEMA_LEGEND,
  SCHEMA_RELATIONSHIP_ITEM,
  STYLE_CLASS_TO_LEGEND_KEY_MAP,
} from "@/components/prototype/constants/cy";
import { PathwayModeBtnContainer } from "@/components/prototype/constants/pathway-search";
import {
  CustomToolbarFnFactory,
  CytoscapeReference,
} from "@/components/prototype/types/cy";
import {
  createCytoscapeElements,
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
  selectionHasLockedNode,
  selectionIsAllHidden,
  selectionIsAllShown,
  selectNeighbors,
  selectNodesWithLabel,
  showElement,
  showSelection,
  unlockD3ForceNode,
  unlockSelection,
} from "@/components/prototype/utils/cy";
import { CytoscapeNodeData } from "@/components/prototype/interfaces/cy";

import GraphEntityDetails from "../../GraphEntityDetails";
import ChartCxtMenuItem from "../../CytoscapeChart/ChartCxtMenuItem";
import CytoscapeChart from "../../CytoscapeChart/CytoscapeChart";
import ChartNestedCxtMenuItem from "../../CytoscapeChart/ChartNestedCxtMenuItem";

import ReturnBtn from "../ReturnBtn";

interface GraphViewProps {
  paths: PathwaySearchResultRow[];
  onReturnBtnClick: () => void;
}

export default function GraphView(cmpProps: GraphViewProps) {
  const { paths, onReturnBtnClick } = cmpProps;
  const elements = useMemo(() => createCytoscapeElements(paths), [paths]);
  const [legend, setLegend] = useState<Map<string, ReactNode>>();
  const [entityDetails, setEntityDetails] = useState<
    CytoscapeNodeData | undefined
  >(undefined);
  const cyRef = useRef<Core>();

  const resetLegend = useCallback(() => {
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
  }, [elements]);

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
    >
      {[
        <ChartCxtMenuItem
          key="chart-cxt-highlight-neighbors"
          renderContent={(event) => "Neighbors"}
          action={highlightNeighbors}
        ></ChartCxtMenuItem>,
        <ChartCxtMenuItem
          key="chart-cxt-highlight-nodes-with-label"
          renderContent={(event) => "Nodes with this Label"}
          action={highlightNodesWithLabel}
        ></ChartCxtMenuItem>
      ]}
    </ChartNestedCxtMenuItem>,
    <ChartNestedCxtMenuItem
      key="chart-cxt-select"
      renderContent={(event) => "Select"}
    >
      {[
        <ChartCxtMenuItem
          key="chart-cxt-highlight-neighbors"
          renderContent={(event) => "Select Neighbors"}
          action={selectNeighbors}
        ></ChartCxtMenuItem>,
        <ChartCxtMenuItem
          key="chart-cxt-highlight-nodes-with-label"
          renderContent={(event) => "Select Nodes with this Label"}
          action={selectNodesWithLabel}
        ></ChartCxtMenuItem>
      ]}
    </ChartNestedCxtMenuItem>,
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
    <Grid
      container
      xs={12}
      sx={{
        height: "100%",
      }}
    >
      <Grid
        item
        xs={entityDetails === undefined ? 12 : 9}
        sx={{ position: "relative", height: "100%", width: "100%" }}
      >
        <CytoscapeChart
          cyRef={cyRef}
          elements={elements}
          layout={EULER_LAYOUT}
          stylesheet={DEFAULT_STYLESHEET}
          legend={legend}
          cxtMenuEnabled={true}
          hoverCxtMenuEnabled={false}
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
          <ReturnBtn onClick={onReturnBtnClick} />
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
    </Grid>
  );
}
