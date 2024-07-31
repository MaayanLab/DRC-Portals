"use client";

import { Box, Divider } from "@mui/material";
import { ElementDefinition, EventObject, EventObjectNode } from "cytoscape";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { INCOMING_CONNECTIONS, OUTGOING_CONNECTIONS } from "../constants/neo4j";
import { Direction } from "../enums/schema-search";
import {
  NodeCxtMenuItem,
  CytoscapeNodeData,
  CxtMenuItem,
} from "../interfaces/cy";
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
  selectNeighbors,
  selectNodesWithLabel,
  unlockD3ForceNode,
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
  const neo4jService: Neo4jService = new Neo4jService(getDriver());
  let longRequestTimerId: NodeJS.Timeout | null = null;

  const expandNode = async (cypher: string) => {
    const records = await neo4jService.executeRead<SubGraph>(cypher);
    return createCytoscapeElementsFromNeo4j(records);
  };

  const staticCxtMenuItems: CxtMenuItem[] = [
    {
      action: (event: EventObject) =>
        downloadCyAsJson(event.cy.elements(":selected")),
      renderContent: (event: EventObjectNode) => "Download Selection",
      key: "download-selection",
      showFn: (event: EventObject) => event.cy.elements(":selected").length > 0,
    },
  ];

  const nodeCxtMenuItems: NodeCxtMenuItem[] = [
    {
      action: (event: EventObjectNode) => setEntityDetails(event.target.data()),
      renderContent: (event: EventObjectNode) => "Show Details",
      key: "show-details",
    },
    {
      action: (event: EventObjectNode) => undefined,
      renderContent: (event: EventObjectNode) => "Expand",
      key: "expand",
      children: (event: EventObjectNode) => {
        const nodeLabel = event.target.data("neo4j")?.labels[0] || "";
        return [
          ...Array.from(
            OUTGOING_CONNECTIONS.get(nodeLabel)?.entries() || []
          ).map(
            (val) =>
              [Direction.OUTGOING, val] as [Direction, [string, string[]]]
          ),
          ...Array.from(
            INCOMING_CONNECTIONS.get(nodeLabel)?.entries() || []
          ).map(
            (val) =>
              [Direction.INCOMING, val] as [Direction, [string, string[]]]
          ),
        ]
          .sort(([a_dir, a_type], [b_dir, b_type]) =>
            a_type[0].localeCompare(b_type[0])
          )
          .flatMap(([dir, [type, labels]]) =>
            labels.map((label) => {
              return {
                action: (event: EventObjectNode) => {
                  const nodeId = event.target.data("id");
                  const cypher = createExpandNodeCypher(
                    nodeId,
                    label,
                    dir,
                    type
                  );
                  expandNode(cypher).then((newElements) => {
                    setElements((prevElements) => [
                      ...prevElements,
                      ...newElements,
                    ]);
                  });
                },
                key: `${type}-${dir}-${label}`,
                renderContent: (event: EventObjectNode) => (
                  <>
                    <Box>{createDirectedRelationshipElement(type, dir)}</Box>
                    <Box>{createNodeElement(label)}</Box>
                  </>
                ),
              } as NodeCxtMenuItem;
            })
          );
      },
    },
    {
      action: (event: EventObjectNode) => unlockD3ForceNode(event.target),
      renderContent: (event: EventObjectNode) => "Unlock",
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
      action: (event: EventObjectNode) =>
        event.cy.nodes(":selected").forEach((node) => unlockD3ForceNode(node)),
      renderContent: (event: EventObjectNode) => "Unlock Selection",
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
      action: (event: EventObjectNode) => undefined,
      renderContent: (event: EventObjectNode) => "Highlight",
      key: "highlight",
      children: (event: EventObjectNode) => [
        {
          action: (event: EventObjectNode) => highlightNeighbors(event),
          renderContent: (event: EventObjectNode) => "Neighbors",
          key: "highlight-neighbors",
        },
        {
          action: (event: EventObjectNode) => highlightNodesWithLabel(event),
          renderContent: (event: EventObjectNode) => "Nodes with this Label",
          key: "highlight-nodes-with-label",
        },
      ],
    },
    {
      action: (event: EventObjectNode) => undefined,
      renderContent: (event: EventObjectNode) => "Select",
      key: "select",
      children: (event: EventObjectNode) => [
        {
          action: (event: EventObjectNode) => selectNeighbors(event),
          renderContent: (event: EventObjectNode) => "Select Neighbors",
          key: "select-neighbors",
        },
        {
          action: (event: EventObjectNode) => selectNodesWithLabel(event),
          renderContent: (event: EventObjectNode) =>
            "Select Nodes with this Label",
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
