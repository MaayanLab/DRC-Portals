"use client";

import { AlertColor, Grid } from "@mui/material";

import { ElementDefinition } from "cytoscape";
import { ChangeEvent, useCallback, useState } from "react";
import { z } from "zod";

import {
  fetchPathwaySearch,
  fetchPathwaySearchConnections,
} from "@/lib/neo4j/api";
import { Direction } from "@/lib/neo4j/enums";
import {
  NodeResult,
  PathwayNode,
  PathwayConnectionsResult,
  PathwaySearchResult,
} from "@/lib/neo4j/types";

import {
  BASIC_SEARCH_ERROR_MSG,
  NO_RESULTS_ERROR_MSG,
} from "../constants/search-bar";
import { NODE_CLASS_MAP } from "../constants/shared";
import {
  PathwaySearchEdge,
  PathwaySearchEdgeData,
  PathwaySearchNode,
  PathwaySearchNodeData,
} from "../interfaces/pathway-search";
import { PathwaySearchElement } from "../types/pathway-search";
import { createCytoscapeElements } from "../utils/cy";
import {
  createTree,
  isPathwaySearchEdgeElement,
} from "../utils/pathway-search";
import { downloadBlob, getNodeDisplayProperty } from "../utils/shared";
import { PathwaySearchElementSchema } from "../validation/pathway-search";

import GraphPathwayResults from "./PathwaySearch/GraphPathwayResults";
import GraphPathwaySearch from "./PathwaySearch/GraphPathwaySearch";
import AlertSnackbar from "./shared/AlertSnackbar";

export default function GraphPathway() {
  const [resultElements, setResultElements] = useState<ElementDefinition[]>([]);
  const [searchElements, setSearchElements] = useState<PathwaySearchElement[]>(
    []
  );
  const [showResults, setShowResults] = useState(false);
  const [loadingSearchResults, setLoadingSearchResults] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("info");
  const PATHWAY_CONNECTIONS_ERROR =
    "An error occurred while retrieving connections for the current pathway.";
  const PATHWAY_DATA_PARSE_ERROR =
    "Failed to parse pathway data import. Please check the data format.";
  const PATHWAY_DATA_PARSE_SUCCESS = "Pathway data imported successfully.";

  const updateSnackbar = (open: boolean, msg: string, severity: AlertColor) => {
    setSnackbarMsg(msg);
    setSnackbarOpen(open);
    setSnackbarSeverity(severity);
  };

  const getPathwayConnections = async (
    tree: PathwayNode
  ): Promise<PathwayConnectionsResult> => {
    const query = btoa(JSON.stringify(tree));
    const response = await fetchPathwaySearchConnections(query);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed: ${errorText}`);
    }

    return response.json();
  };

  const getPathwaySearchResults = async (
    tree: PathwayNode
  ): Promise<{ data: PathwaySearchResult; status: number }> => {
    const query = btoa(JSON.stringify(tree));
    const response = await fetchPathwaySearch(query);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed: ${errorText}`);
    }

    return { data: await response.json(), status: response.status };
  };

  const createPathwaySearchNode = (
    data: PathwaySearchNodeData,
    classes?: string[]
  ): PathwaySearchNode => {
    return {
      data,
      classes: [NODE_CLASS_MAP.get(data.dbLabel) || "", ...(classes || [])],
    };
  };

  const createPathwaySearchEdge = (
    data: PathwaySearchEdgeData,
    classes?: string[]
  ): PathwaySearchEdge => {
    return {
      data,
      classes,
    };
  };

  const deepCopyPathwaySearchNode = (
    node: PathwaySearchNode,
    data?: Partial<PathwaySearchNodeData>,
    classesToAdd?: string[],
    classesToRemove?: string[]
  ): PathwaySearchNode => ({
    classes: Array.from(
      new Set([...(node.classes || []), ...(classesToAdd || [])])
    ).filter((c) => {
      return classesToRemove === undefined || !classesToRemove.includes(c);
    }),
    data: { ...node.data, ...data },
  });

  const deepCopyPathwaySearchEdge = (
    edge: PathwaySearchEdge,
    data?: Partial<PathwaySearchEdgeData>,
    classesToAdd?: string[],
    classesToRemove?: string[]
  ): PathwaySearchEdge => ({
    classes: Array.from(
      new Set([...(edge.classes || []), ...(classesToAdd || [])])
    ).filter(
      (c) => classesToRemove === undefined || !classesToRemove.includes(c)
    ),
    data: { ...edge.data, ...data },
  });

  const handleReset = useCallback(() => {
    setResultElements([]);
    setSearchElements([]);
  }, []);

  const updatePathwayCounts = (
    pathwayElements: PathwaySearchElement[],
    fallbackElements: PathwaySearchElement[]
  ) => {
    const tree = createTree(pathwayElements);
    if (tree !== undefined) {
      setSearchElements(pathwayElements);
      getPathwayConnections(tree)
        .then((response) => {
          setSearchElements([
            ...response.connectedNodes.map((node) =>
              createPathwaySearchNode({
                id: node.id,
                displayLabel: node.label,
                dbLabel: node.label,
              })
            ),
            ...pathwayElements.map((element) => {
              if (isPathwaySearchEdgeElement(element)) {
                return deepCopyPathwaySearchEdge(element);
              } else {
                return deepCopyPathwaySearchNode(
                  element,
                  undefined,
                  [],
                  ["loading"]
                );
              }
            }),
            ...response.connectedEdges.map((edge) =>
              createPathwaySearchEdge(
                {
                  id: edge.id,
                  source:
                    edge.direction === Direction.OUTGOING
                      ? edge.source
                      : edge.target,
                  target:
                    edge.direction === Direction.OUTGOING
                      ? edge.target
                      : edge.source,
                  displayLabel: edge.type,
                  type: edge.type,
                },
                edge.direction === Direction.INCOMING
                  ? ["source-arrow-only"]
                  : []
              )
            ),
          ]);
        })
        .catch((e) => {
          console.error(e);
          setSearchElements(fallbackElements);
          updateSnackbar(true, PATHWAY_CONNECTIONS_ERROR, "error");
        });
    }
  };

  const addNodeToPath = useCallback(
    (node: PathwaySearchNode) => {
      // There should be exactly one edge where this node is the target
      const connectedEdge = searchElements.find(
        (element) =>
          isPathwaySearchEdgeElement(element) &&
          element.data.target === node.data.id
      ) as PathwaySearchEdge | undefined;

      // This should never happen, but log an error just in case...
      if (connectedEdge === undefined) {
        console.error(
          `GraphPathway Error: No incoming edge for node ${node.data.id}. Aborting.`
        );
        return;
      }

      // Take a snapshot of the original state in case the API request fails for any reason
      const fallbackElements = searchElements.map((element) =>
        isPathwaySearchEdgeElement(element)
          ? deepCopyPathwaySearchEdge(element)
          : deepCopyPathwaySearchNode(element)
      );
      const tempElements = [
        deepCopyPathwaySearchNode(node, undefined, ["loading", "path-element"]),
        ...searchElements.filter(
          (element) =>
            element.data.id !== node.data.id &&
            element.data.id !== connectedEdge.data.id &&
            element.classes?.includes("path-element")
        ),
        deepCopyPathwaySearchEdge(connectedEdge, undefined, ["path-element"]),
      ];
      updatePathwayCounts(tempElements, fallbackElements);
    },
    [searchElements]
  );

  const updatePathNode = useCallback(
    (node: PathwaySearchNode) => {
      const fallbackElements = searchElements.map((element) =>
        isPathwaySearchEdgeElement(element)
          ? deepCopyPathwaySearchEdge(element)
          : deepCopyPathwaySearchNode(element)
      );
      const tempElements = [
        deepCopyPathwaySearchNode(node, undefined, ["loading"]),
        ...searchElements.filter(
          (element) =>
            element.classes?.includes("path-element") &&
            element.data.id !== node.data.id
        ),
      ];
      updatePathwayCounts(tempElements, fallbackElements);
    },
    [searchElements]
  );

  const handleSelectedNodeChange = useCallback(
    (node: PathwaySearchNode | undefined, reason: string) => {
      if (node !== undefined) {
        // Node was selected, but is not already in the path
        if (reason === "select" && !node.classes?.includes("path-element")) {
          addNodeToPath(node);
        } else if (reason === "update") {
          updatePathNode(node);
        }
      }
    },
    [addNodeToPath, updatePathNode]
  );

  const handleSearchBtnClick = useCallback(async () => {
    setLoadingSearchResults(true);
    const tree = createTree(searchElements);

    if (tree === undefined) {
      updateSnackbar(true, BASIC_SEARCH_ERROR_MSG, "error");
      setLoadingSearchResults(false);
      return;
    }

    try {
      const { data, status } = await getPathwaySearchResults(tree);
      const elements = createCytoscapeElements(data.graph);

      if (elements.length === 0) {
        updateSnackbar(true, NO_RESULTS_ERROR_MSG, "warning");
      } else {
        setShowResults(true);
        setResultElements(elements);

        if (status === 206) {
          updateSnackbar(
            true,
            `Not all paths are being displayed due to result volume. Only first ${data.limit} paths are displayed.`,
            "warning"
          );
        }
      }
    } catch (e) {
      updateSnackbar(true, BASIC_SEARCH_ERROR_MSG, "error");
    } finally {
      setLoadingSearchResults(false);
    }
  }, [searchElements]);

  const handleReturnBtnClick = () => {
    setShowResults(false);
    setResultElements([]);
  };

  const handleSearchBarSubmit = (cvTerm: NodeResult) => {
    // TODO: Direct node results *should* always have at least one label since they are required on all Neo4j nodes, so maybe this check
    // isn't necessary? If we had validation on the search request response we could throw an error before reaching this point...
    if (cvTerm.labels === undefined || cvTerm.labels.length === 0) {
      console.warn("CV term search returned node with no labels! Aborting.");
      return;
    }

    const initialNode = createPathwaySearchNode(
      {
        id: cvTerm.uuid,
        displayLabel: getNodeDisplayProperty(cvTerm.labels[0], cvTerm),
        dbLabel: cvTerm.labels[0],
      },
      ["path-element", "loading"]
    );
    const tree = createTree([initialNode]);

    if (tree !== undefined) {
      setSearchElements([initialNode]);
      getPathwayConnections(tree)
        .then((response) => {
          setSearchElements([
            createPathwaySearchNode(
              {
                ...initialNode.data,
              },
              ["path-element"]
            ),
            ...response.connectedNodes.map((node) =>
              createPathwaySearchNode({
                id: node.id,
                displayLabel: node.label,
                dbLabel: node.label,
              })
            ),
            ...response.connectedEdges.map((edge) =>
              createPathwaySearchEdge(
                {
                  id: edge.id,
                  source:
                    edge.direction === Direction.OUTGOING
                      ? edge.source
                      : edge.target,
                  target:
                    edge.direction === Direction.OUTGOING
                      ? edge.target
                      : edge.source,
                  displayLabel: edge.type,
                  type: edge.type,
                },
                edge.direction === Direction.INCOMING
                  ? ["source-arrow-only"]
                  : []
              )
            ),
          ]);
        })
        .catch((e) => {
          console.error(e);
          setSearchElements([]);
          updateSnackbar(true, PATHWAY_CONNECTIONS_ERROR, "error");
        });
    }
  };

  const handleExport = useCallback(() => {
    const data = searchElements.map((el) => ({
      data: el.data,
      classes: el.classes,
    }));
    const jsonString = JSON.stringify(data);
    downloadBlob(jsonString, "application/json", "c2m2-pathway-data.json");
  }, [searchElements]);

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files !== null && event.target.files.length > 0) {
      const file = event.target.files[0];

      if (file.type === "application/json") {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            if (e.target !== null && typeof e.target.result === "string") {
              const json: PathwaySearchElement[] = JSON.parse(e.target.result);

              // Make sure the parsed json conforms to the expected PathwaySearchElement[] shape before setting the new searchElements
              z.array(PathwaySearchElementSchema).parse(json);
              setSearchElements(json);
              updateSnackbar(true, PATHWAY_DATA_PARSE_SUCCESS, "success");
            }
          } catch (parseError) {
            updateSnackbar(true, PATHWAY_DATA_PARSE_ERROR, "error");
          }
        };
        reader.readAsText(file);
      }
    }
  };

  return (
    <Grid
      container
      spacing={1}
      xs={12}
      sx={{
        height: "640px",
      }}
    >
      {showResults ? (
        <GraphPathwayResults
          elements={resultElements}
          onReturnBtnClick={handleReturnBtnClick}
        />
      ) : (
        <GraphPathwaySearch
          elements={searchElements}
          loading={loadingSearchResults}
          onExport={handleExport}
          onImport={handleImport}
          onSearchBarSubmit={handleSearchBarSubmit}
          onSearchBtnClick={handleSearchBtnClick}
          onSelectedNodeChange={handleSelectedNodeChange}
          onReset={handleReset}
        />
      )}
      <AlertSnackbar
        open={snackbarOpen}
        message={snackbarMsg}
        autoHideDuration={5000}
        severity={snackbarSeverity}
        vertical={"bottom"}
        horizontal={"center"}
        handleClose={() => setSnackbarOpen(false)}
      />
    </Grid>
  );
}
