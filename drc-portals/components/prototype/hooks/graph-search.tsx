"use client";

import { ElementDefinition, EventObject, EventObjectNode } from "cytoscape";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { D3_FORCE_TOOLS } from "../constants/cy";
import {
  NodeCxtMenuItem,
  CytoscapeNodeData,
  CxtMenuItem,
} from "../interfaces/cy";
import { getDriver } from "../neo4j";
import Neo4jService from "../services/neo4j";
import { CytoscapeReference } from "../types/cy";
import {
  createCytoscapeElementsFromNeo4j,
  downloadChartData,
  downloadCyAsJson,
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
      showFn: (event: EventObject) => event.cy.elements(":selected").length > 0,
    },
  ];

  const nodeCxtMenuItems: NodeCxtMenuItem[] = [
    {
      fn: (event: EventObjectNode) => setEntityDetails(event.target.data()),
      title: "Show Details",
    },
  ];

  const customTools = [
    ...D3_FORCE_TOOLS,
    (cyRef: CytoscapeReference) =>
      downloadChartData(
        "search-chart-toolbar-download-data",
        "Download Data",
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
