"use client";

import { AlertColor, Grid } from "@mui/material";

import { ElementDefinition } from "cytoscape";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
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
import {
  PathwaySearchContext,
  PathwaySearchContextProps,
} from "../contexts/PathwaySearchContext";
import {
  PathwaySearchEdge,
  PathwaySearchNode,
} from "../interfaces/pathway-search";
import { PathwaySearchElement } from "../types/pathway-search";
import { createCytoscapeElements } from "../utils/cy";
import {
  createPathwaySearchEdge,
  createPathwaySearchNode,
  createTree,
  deepCopyPathwaySearchEdge,
  deepCopyPathwaySearchNode,
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
  const [tree, setTree] = useState<PathwayNode>();
  const [showResults, setShowResults] = useState(false);
  const [loadingSearchResults, setLoadingSearchResults] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("info");
  const pathwayContextValue: PathwaySearchContextProps = useMemo(
    () => ({ tree }),
    [tree]
  );
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

  const handleReset = useCallback(() => {
    setResultElements([]);
    setSearchElements([]);
  }, []);

  const updatePathway = (
    pathwayElements: PathwaySearchElement[],
    fallbackElements: PathwaySearchElement[]
  ) => {
    const tempTree = createTree(pathwayElements);
    setTree(tempTree);
    if (tempTree !== undefined) {
      setSearchElements(pathwayElements);
      getPathwayConnections(tempTree)
        .then((response) => {
          const newSearchElements = [
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
          ];
          setSearchElements(newSearchElements);
        })
        .catch((e) => {
          console.error(e);
          setSearchElements(fallbackElements);
          setTree(createTree(fallbackElements));
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
      updatePathway(tempElements, fallbackElements);
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
      updatePathway(tempElements, fallbackElements);
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
  }, [tree]);

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
    const initialTree = createTree([initialNode]);
    setTree(initialTree);

    if (initialTree !== undefined) {
      setSearchElements([initialNode]);
      getPathwayConnections(initialTree)
        .then((response) => {
          const newSearchElements = [
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
          ];
          setSearchElements(newSearchElements);
        })
        .catch((e) => {
          console.error(e);
          setSearchElements([]);
          setTree(undefined);
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
        <PathwaySearchContext.Provider value={pathwayContextValue}>
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
        </PathwaySearchContext.Provider>
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