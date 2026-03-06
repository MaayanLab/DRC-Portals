"use client";

import { Grid } from "@mui/material";
import { Core } from "cytoscape";
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
  DOWNLOAD_SELECTION,
  HIDE_EDGE,
  HIDE_NODE,
  HIDE_SELECTION,
  HIGHLIGHT_NODE,
  HIGHLIGHT_NODE_NEIGHBORS,
  HIGHLIGHT_NODES_WITH_LABEL,
  RESET_HIGHLIGHTS,
  SELECT_ALL,
  SELECT_NODE,
  SELECT_NODE_NEIGHBORS,
  SELECT_NODES_WITH_LABEL,
  SHOW_EDGE,
  SHOW_NODE,
  SHOW_NODE_DETAILS,
  SHOW_SELECTION,
  UNLOCK_NODE,
  UNLOCK_NODE_SELECTION
} from "@/components/prototype/constants/cxt-menu";
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
import { CxtMenuItem } from "@/components/prototype/interfaces/cxt-menu";
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

  const staticCxtMenuItems: CxtMenuItem[] = [
    {
      content: <ChartCxtMenuItem
        id={RESET_HIGHLIGHTS}
        key={RESET_HIGHLIGHTS}
        renderContent={() => "Reset Highlights"}
        action={resetHighlights}
        showFn={(event) =>
          event.cy.elements(".highlight").length > 0 ||
          event.cy.elements(".transparent").length > 0
        }
      ></ChartCxtMenuItem>,
      tree: {
        id: RESET_HIGHLIGHTS,
        children: [],
        open: false,
      },
    },
    {
      content: <ChartCxtMenuItem
        id={DOWNLOAD_SELECTION}
        key={DOWNLOAD_SELECTION}
        renderContent={(event) => "Download Selection"}
        action={(event) => downloadCyAsJson(event.cy.elements(":selected"))}
        showFn={(event) => event.cy.elements(":selected").length > 0}
      ></ChartCxtMenuItem>,
      tree: {
        id: DOWNLOAD_SELECTION,
        children: [],
        open: false
      }
    },
    {
      content: <ChartCxtMenuItem
        id={SHOW_SELECTION}
        key={SHOW_SELECTION}
        renderContent={(event) => "Show Selection"}
        action={showSelection}
        showFn={(event) => !selectionIsAllShown(event)}
      ></ChartCxtMenuItem>,
      tree: {
        id: DOWNLOAD_SELECTION,
        children: [],
        open: false,
      },
    },
    {
      content: <ChartCxtMenuItem
        id={HIDE_SELECTION}
        key={HIDE_SELECTION}
        renderContent={(event) => "Hide Selection"}
        action={hideSelection}
        showFn={(event) => !selectionIsAllHidden(event)}
      ></ChartCxtMenuItem>,
      tree: {
        id: HIDE_SELECTION,
        children: [],
        open: false,
      },
    },
  ];

  const nodeCxtMenuItems: CxtMenuItem[] = [
    {
      content: <ChartCxtMenuItem
        id={SHOW_NODE}
        key={SHOW_NODE}
        renderContent={(event) => "Show"}
        action={showElement}
        showFn={(event) => event.target.hasClass("transparent")}
      ></ChartCxtMenuItem>,
      tree: {
        id: SHOW_NODE,
        children: [],
        open: false,
      }
    },
    {
      content: <ChartCxtMenuItem
        id={HIDE_NODE}
        key={HIDE_NODE}
        renderContent={(event) => "Hide"}
        action={hideElement}
        showFn={(event) => !event.target.hasClass("transparent")}
      ></ChartCxtMenuItem>,
      tree: {
        id: HIDE_NODE,
        children: [],
        open: false,
      }
    },
    {
      content: <ChartCxtMenuItem
        id={SHOW_NODE_DETAILS}
        key={SHOW_NODE_DETAILS}
        renderContent={(event) => "Show Details"}
        action={(event) => setEntityDetails(event.target.data())}
      ></ChartCxtMenuItem>,
      tree: {
        id: SHOW_NODE_DETAILS,
        children: [],
        open: false,
      }
    },
    {
      content: <ChartCxtMenuItem
        id={UNLOCK_NODE}
        key={UNLOCK_NODE}
        renderContent={(event) => "Unlock"}
        action={(event) => unlockD3ForceNode(event.target)}
        showFn={(event) => isNodeD3Locked(event.target)}
      ></ChartCxtMenuItem>,
      tree: {
        id: UNLOCK_NODE,
        children: [],
        open: false,
      }
    },
    {
      content: <ChartCxtMenuItem
        id={UNLOCK_NODE_SELECTION}
        key={UNLOCK_NODE_SELECTION}
        renderContent={(event) => "Unlock Selection"}
        action={unlockSelection}
        showFn={selectionHasLockedNode}
      ></ChartCxtMenuItem>,
      tree: {
        id: UNLOCK_NODE_SELECTION,
        children: [],
        open: false,
      }
    },
    {
      content: <ChartNestedCxtMenuItem
        id={HIGHLIGHT_NODE}
        key={HIGHLIGHT_NODE}
        renderContent={(event) => "Highlight"}
      >
        {[
          <ChartCxtMenuItem
            id={HIGHLIGHT_NODE_NEIGHBORS}
            key={HIGHLIGHT_NODE_NEIGHBORS}
            renderContent={(event) => "Neighbors"}
            action={highlightNeighbors}
          ></ChartCxtMenuItem>,
          <ChartCxtMenuItem
            id={HIGHLIGHT_NODES_WITH_LABEL}
            key={HIGHLIGHT_NODES_WITH_LABEL}
            renderContent={(event) => "Nodes with this Label"}
            action={highlightNodesWithLabel}
          ></ChartCxtMenuItem>
        ]}
      </ChartNestedCxtMenuItem>,
      tree: {
        id: HIGHLIGHT_NODE,
        open: false,
        children: [
          {
            id: HIGHLIGHT_NODE_NEIGHBORS,
            children: [],
            open: false,
          },
          {
            id: HIGHLIGHT_NODES_WITH_LABEL,
            children: [],
            open: false,
          }
        ]
      }
    },
    {
      content: <ChartNestedCxtMenuItem
        id={SELECT_NODE}
        key={SELECT_NODE}
        renderContent={(event) => "Select"}
      >
        {[
          <ChartCxtMenuItem
            id={SELECT_NODE_NEIGHBORS}
            key={SELECT_NODE_NEIGHBORS}
            renderContent={(event) => "Neighbors"}
            action={selectNeighbors}
          ></ChartCxtMenuItem>,
          <ChartCxtMenuItem
            id={SELECT_NODES_WITH_LABEL}
            key={SELECT_NODES_WITH_LABEL}
            renderContent={(event) => "Nodes with this Label"}
            action={selectNodesWithLabel}
          ></ChartCxtMenuItem>
        ]}
      </ChartNestedCxtMenuItem>,
      tree: {
        id: SELECT_NODE,
        open: false,
        children: [
          {
            id: SELECT_NODE_NEIGHBORS,
            children: [],
            open: false,
          },
          {
            id: SELECT_NODES_WITH_LABEL,
            children: [],
            open: false,
          }
        ]
      }
    },
  ];

  const edgeCxtMenuItems: CxtMenuItem[] = [
    {
      content: <ChartCxtMenuItem
        id={SHOW_EDGE}
        key={SHOW_EDGE}
        renderContent={(event) => "Show"}
        action={showElement}
        showFn={(event) => event.target.hasClass("transparent")}
      ></ChartCxtMenuItem>,
      tree: {
        id: SHOW_EDGE,
        children: [],
        open: false,
      }
    },
    {
      content: <ChartCxtMenuItem
        id={HIDE_EDGE}
        key={HIDE_EDGE}
        renderContent={(event) => "Hide"}
        action={hideElement}
        showFn={(event) => !event.target.hasClass("transparent")}
      ></ChartCxtMenuItem>,
      tree: {
        id: HIDE_EDGE,
        children: [],
        open: false,
      }
    },
  ];

  const canvasCxtMenuItems: CxtMenuItem[] = [
    {
      content: <ChartCxtMenuItem
        id={SELECT_ALL}
        key={SELECT_ALL}
        renderContent={() => "Select All"}
        action={selectAll}
      ></ChartCxtMenuItem>,
      tree: {
        id: SELECT_ALL,
        children: [],
        open: false,
      }
    },
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
