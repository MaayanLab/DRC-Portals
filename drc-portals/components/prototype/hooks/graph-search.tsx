"use client";

import Rotate90DegreesCwIcon from "@mui/icons-material/Rotate90DegreesCw";
import Rotate90DegreesCcwIcon from "@mui/icons-material/Rotate90DegreesCcw";
import { Divider } from "@mui/material";
import { ElementDefinition, EventObject, LayoutOptions } from "cytoscape";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import ExpandNodeMenuItem from "../components/CytoscapeChart/custom-cxt-menu-items/ExpandNodeMenuItem";
import ChartCxtMenuItem from "../components/CytoscapeChart/ChartCxtMenuItem";
import ChartNestedCxtMenuItem from "../components/CytoscapeChart/NestedChartCxtMenuItem";
import {
  SCHEMA_LEGEND,
  SCHEMA_RELATIONSHIP_ITEM,
  STYLE_CLASS_TO_LEGEND_KEY_MAP,
} from "../constants/cy";
import { NO_RESULTS_ERROR_MSG } from "../constants/search-bar";
import { CytoscapeNodeData } from "../interfaces/cy";
import { SubGraph } from "../interfaces/neo4j";
import { getDriver } from "../neo4j";
import Neo4jService from "../services/neo4j";
import { CustomToolbarFnFactory, CytoscapeReference } from "../types/cy";
import {
  D3_FORCE_TOOLS,
  createCytoscapeElementsFromNeo4j,
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

export default function useGraphSearchBehavior() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elements, setElements] = useState<ElementDefinition[]>([]);
  const [legend, setLegend] = useState<Map<string, ReactNode>>();
  const [entityDetails, setEntityDetails] = useState<
    CytoscapeNodeData | undefined
  >(undefined);
  const neo4jService = new Neo4jService(getDriver());
  let longRequestTimerId: NodeJS.Timeout | null = null;

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

  const setInitialNetworkData = async (
    cypher: string,
    params?: {
      [key: string]: any;
    }
  ) => {
    clearNetwork();

    setLongRequestTimer();
    const records = await neo4jService.executeRead<SubGraph>(cypher, params);

    const cytoscapeElements = createCytoscapeElementsFromNeo4j(records);

    if (cytoscapeElements.length === 0) {
      setError(NO_RESULTS_ERROR_MSG);
    } else {
      clearSearchError();
      setElements(cytoscapeElements);
    }
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

  useEffect(() => {
    resetLegend();
  }, [elements]);

  return {
    searchParams,
    router,
    loading,
    error,
    elements,
    entityDetails,
    legend,
    setLoading,
    setError,
    setEntityDetails,
    staticCxtMenuItems,
    nodeCxtMenuItems,
    customTools,
    clearSearchError,
    clearLongRequestTimer,
    setInitialNetworkData,
  };
}
