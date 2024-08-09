"use client";

import { Box, Divider } from "@mui/material";
import { ElementDefinition, EventObject } from "cytoscape";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useState } from "react";

import ChartCxtMenuItem from "../components/CytoscapeChart/ChartCxtMenuItem";
import ChartNestedCxtMenuItem from "../components/CytoscapeChart/NestedChartCxtMenuItem";
import { INCOMING_CONNECTIONS, OUTGOING_CONNECTIONS } from "../constants/neo4j";
import { NO_RESULTS_ERROR_MSG } from "../constants/search-bar";
import { Direction } from "../enums/schema-search";
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
  selectNeighbors,
  selectNodesWithLabel,
  selectionHasLockedNode,
  unlockD3ForceNode,
  unlockSelection,
} from "../utils/cy";
import {
  createDirectedRelationshipElement,
  createNodeElement,
} from "../utils/shared";
import { createExpandNodeCypher } from "../utils/neo4j";

export default function useGraphSearchBehavior() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elements, setElements] = useState<ElementDefinition[]>([]);
  const [entityDetails, setEntityDetails] = useState<
    CytoscapeNodeData | undefined
  >(undefined);
  const neo4jService = new Neo4jService(getDriver());
  let longRequestTimerId: NodeJS.Timeout | null = null;

  const expandNode = async (cypher: string) => {
    const records = await neo4jService.executeRead<SubGraph>(cypher);
    return createCytoscapeElementsFromNeo4j(records);
  };

  const expandRenderChildren = (event: EventObject) => {
    const nodeLabel = event.target.data("neo4j")?.labels[0] || "";
    return [
      ...Array.from(OUTGOING_CONNECTIONS.get(nodeLabel)?.entries() || []).map(
        (val) => [Direction.OUTGOING, val] as [Direction, [string, string[]]]
      ),
      ...Array.from(INCOMING_CONNECTIONS.get(nodeLabel)?.entries() || []).map(
        (val) => [Direction.INCOMING, val] as [Direction, [string, string[]]]
      ),
    ]
      .sort(([a_dir, a_type], [b_dir, b_type]) =>
        a_type[0].localeCompare(b_type[0])
      )
      .flatMap(([dir, [type, labels]]) =>
        labels.map((label) => {
          return (
            <ChartCxtMenuItem
              key={`${type}-${dir}-${label}`}
              renderContent={(event) => (
                <>
                  <Box>{createDirectedRelationshipElement(type, dir)}</Box>
                  <Box>{createNodeElement(label)}</Box>
                </>
              )}
              action={(event) => {
                const nodeId = event.target.data("id");
                const cypher = createExpandNodeCypher(nodeId, label, dir, type);
                expandNode(cypher).then((newElements) => {
                  setElements((prevElements) => [
                    ...prevElements,
                    ...newElements,
                  ]);
                });
              }}
            ></ChartCxtMenuItem>
          );
        })
      );
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
    <ChartNestedCxtMenuItem
      key="chart-cxt-expand"
      renderContent={(event) => "Expand"}
      renderChildren={expandRenderChildren}
    ></ChartNestedCxtMenuItem>,
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

  return {
    searchParams,
    router,
    loading,
    error,
    elements,
    entityDetails,
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
