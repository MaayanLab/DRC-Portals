"use client";

import { Divider } from "@mui/material";
import { ElementDefinition, EventObject, EventObjectNode } from "cytoscape";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  NodeCxtMenuItem,
  CytoscapeNodeData,
  CxtMenuItem,
} from "../interfaces/cy";
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
  selectNeighbors,
  selectNodesWithLabel,
  unlockD3ForceNode,
} from "../utils/cy";
import { SubGraph } from "../interfaces/neo4j";

export default function useGraphSearchBehavior() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elements, setElements] = useState<ElementDefinition[]>([]);
  const [entityDetails, setEntityDetails] = useState<
    CytoscapeNodeData | undefined
  >(undefined);
  const neo4jService: Neo4jService = new Neo4jService(getDriver());
  let longRequestTimerId: NodeJS.Timeout | null = null;

  const staticCxtMenuItems: CxtMenuItem[] = [
    {
      fn: (event: EventObject) =>
        downloadCyAsJson(event.cy.elements(":selected")),
      title: "Download Selection",
      key: "download-selection",
      showFn: (event: EventObject) => event.cy.elements(":selected").length > 0,
    },
  ];

  const nodeCxtMenuItems: NodeCxtMenuItem[] = [
    {
      fn: (event: EventObjectNode) => setEntityDetails(event.target.data()),
      title: "Show Details",
      key: "show-details",
    },
    {
      fn: (event: EventObjectNode) => unlockD3ForceNode(event.target),
      title: "Unlock",
      key: "unlock",
      showFn: (event: EventObjectNode) => {
        const node = event.target;
        const scratch = node.scratch();

        if (scratch["d3-force"] !== undefined) {
          return scratch["d3-force"].fx || scratch["d3-force"].fy;
        } else {
          return false;
        }
      },
    },
    {
      fn: (event: EventObjectNode) =>
        event.cy.nodes(":selected").forEach((node) => unlockD3ForceNode(node)),
      title: "Unlock Selection",
      key: "unlock-selection",
      showFn: (event: EventObjectNode) =>
        event.cy
          .nodes(":selected")
          .map((node) => {
            const scratch = node.scratch();

            if (scratch["d3-force"] !== undefined) {
              return scratch["d3-force"].fx || scratch["d3-force"].fy;
            } else {
              return false;
            }
          })
          .some((isLocked) => isLocked),
    },
    {
      fn: () => undefined,
      title: "Highlight",
      key: "highlight",
      children: [
        {
          fn: (event: EventObjectNode) => highlightNeighbors(event),
          title: "Neighbors",
          key: "highlight-neighbors",
        },
        {
          fn: (event: EventObjectNode) => highlightNodesWithLabel(event),
          title: "Nodes with this Label",
          key: "highlight-nodes-with-label",
        },
      ],
    },
    {
      fn: () => undefined,
      title: "Select",
      key: "select",
      children: [
        {
          fn: (event: EventObjectNode) => selectNeighbors(event),
          title: "Select Neighbors",
          key: "select-neighbors",
        },
        {
          fn: (event: EventObjectNode) => selectNodesWithLabel(event),
          title: "Select Nodes with this Label",
          key: "select-nodes-with-label",
        },
      ],
    },
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

  const setInitialNetworkData = async (cypher: string) => {
    clearNetwork();

    setLongRequestTimer();
    const records = await neo4jService.executeRead<SubGraph>(cypher);

    const cytoscapeElements = createCytoscapeElementsFromNeo4j(records);

    if (cytoscapeElements.length === 0) {
      setError("We couldn't find any results for your search");
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
