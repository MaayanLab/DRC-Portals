"use client";

import { AlertColor, Box } from "@mui/material";

import { EventObjectNode, NodeSingular } from "cytoscape";
import { useSearchParams } from "next/navigation";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { z } from "zod";

import { fetchPathwaySearchCount } from "@/lib/neo4j/api";
import { createPathwaySearchAllPathsCypher } from "@/lib/neo4j/cypher";
import { Direction } from "@/lib/neo4j/enums";
import { parsePathwayTree } from "@/lib/neo4j/utils";
import {
  NodeResult,
  PathwayNode,
  PathwaySearchCountResult,
} from "@/lib/neo4j/types";

import { BASIC_SEARCH_ERROR_MSG } from "../constants/search-bar";
import {
  PathwaySearchContext,
  PathwaySearchContextProps,
} from "../contexts/PathwaySearchContext";
import {
  ConnectionMenuItem,
  PathwaySearchNode,
} from "../interfaces/pathway-search";
import { PathwaySearchElement } from "../types/pathway-search";
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
  const [searchElements, setSearchElements] = useState<PathwaySearchElement[]>(
    []
  );
  const [tree, setTree] = useState<PathwayNode>();
  const [showResults, setShowResults] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("info");
  const [loadingNodes, setLoadingNodes] = useState<string[]>([]);
  const countsAbortControllerRef = useRef(new AbortController());
  const pathwayContextValue: PathwaySearchContextProps = useMemo(
    () => ({ tree }),
    [tree]
  );
  const searchParams = useSearchParams();
  const PATHWAY_DATA_PARSE_ERROR =
    "Failed to parse pathway data import. Please check the data format.";
  const PATHWAY_DATA_PARSE_SUCCESS = "Pathway data imported successfully.";

  const getPathwaySearchCount = async (
    tree: PathwayNode
  ): Promise<{ data: PathwaySearchCountResult; status: number }> => {
    const query = btoa(JSON.stringify(tree));
    const response = await fetchPathwaySearchCount(query, {
      signal: countsAbortControllerRef.current.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed: ${errorText}`);
    }

    return { data: await response.json(), status: response.status };
  };

  const abortCountsRequest = () => {
    const abortController = countsAbortControllerRef.current;
    if (abortController !== undefined) {
      abortController.abort("Cancelling counts request.");
      countsAbortControllerRef.current = new AbortController();
    }
  };

  const updateSnackbar = (open: boolean, msg: string, severity: AlertColor) => {
    setSnackbarMsg(msg);
    setSnackbarOpen(open);
    setSnackbarSeverity(severity);
  };

  const resetPathway = () => {
    setTree(undefined);
    abortCountsRequest();
    setSearchElements([]);
  };

  const updateCounts = (
    candidateSearchElements: PathwaySearchElement[],
    loadingElements: string[],
    fallbackElements: PathwaySearchElement[]
  ) => {
    // We create the new tree with the success candidate elements to include them in the count query
    let newTree: PathwayNode;
    try {
      newTree = createTree(candidateSearchElements);
    } catch (e) {
      console.error(e);
      updateSnackbar(
        true,
        "An error occurred fetching counts for the current pathway.",
        "error"
      );
      return;
    }
    const abortController = countsAbortControllerRef.current;

    // Temporarily set the elements to the loading list, and update the counting state
    setLoadingNodes(loadingElements);

    getPathwaySearchCount(newTree)
      .then(({ data }) => {
        const { counts } = data;
        setSearchElements([
          ...candidateSearchElements.map((element) => {
            if (isPathwaySearchEdgeElement(element)) {
              const matched = Object.hasOwn(counts, element.data.id);
              return deepCopyPathwaySearchEdge(element, {
                count: matched ? counts[element.data.id] : 0,
              });
            } else {
              const matched = Object.hasOwn(counts, element.data.id);
              return deepCopyPathwaySearchNode(
                element,
                {
                  count: matched ? counts[element.data.id] : 0,
                },
                [],
                ["loading"]
              );
            }
          }),
        ]);
        setTree(newTree);
      })
      .catch((e) => {
        // Only set an error if it wasn't because we manually aborted the request
        if (!abortController.signal.aborted) {
          console.error(e);
          setSearchElements(fallbackElements); // Only fallback if we don't know what caused the error
          updateSnackbar(
            true,
            "An error occurred fetching counts for the current pathway.",
            "error"
          );
        }
      })
      .finally(() => {
        setLoadingNodes([]);
      });
  };

  const updatePathNode = useCallback(
    (node: PathwaySearchNode) => {
      // Take a snapshot of the original state in case the API request fails for any reason
      const fallbackElements = [
        ...searchElements.map((element) =>
          isPathwaySearchEdgeElement(element)
            ? deepCopyPathwaySearchEdge(element)
            : deepCopyPathwaySearchNode(element)
        ),
      ];

      const loadingElements = [node.data.id];

      // On success, search elements include the updated node and a copy of the rest
      const candidateSearchElements = [
        deepCopyPathwaySearchNode(node),
        ...searchElements
          .filter((el) => el.data.id !== node.data.id)
          .map((element) =>
            isPathwaySearchEdgeElement(element)
              ? deepCopyPathwaySearchEdge(element)
              : deepCopyPathwaySearchNode(element)
          ),
      ];
      updateCounts(candidateSearchElements, loadingElements, fallbackElements);
    },
    [searchElements]
  );

  const handleSelectedNodeChange = useCallback(
    (node: PathwaySearchNode | undefined, reason: string) => {
      if (node !== undefined && reason === "update") {
        updatePathNode(node);
      }
    },
    [updatePathNode]
  );

  const handleSearchBtnClick = useCallback(async () => {
    if (tree === undefined) {
      updateSnackbar(true, BASIC_SEARCH_ERROR_MSG, "error");
      return;
    }

    setShowResults(true);
  }, [tree]);

  const handleReturnBtnClick = () => {
    setShowResults(false);
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
      ["path-element"]
    );

    let initialTree: PathwayNode;
    try {
      initialTree = createTree([initialNode]);
    } catch (e) {
      console.error(e);
      updateSnackbar(
        true,
        "An error occurred reading CV term data.",
        "error"
      );
      return;
    }

    setTree(initialTree);
    setSearchElements([initialNode]);
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
              setTree(createTree(json));
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

  const handleCopyCypher = async () => {
    if (tree !== undefined) {
      const treeParseResult = parsePathwayTree(tree);

      try {
        await navigator.clipboard.writeText(
          createPathwaySearchAllPathsCypher(treeParseResult)
        );
        updateSnackbar(
          true,
          "Pathway Cypher query copied to clipboard.",
          "success"
        );
      } catch (error) {
        console.error(error);
        updateSnackbar(
          true,
          "An error occurred copying pathway Cypher query to clipboard.",
          "error"
        );
      }
    } else {
      updateSnackbar(true, "No data to copy.", "warning");
    }
  };

  const handleConnectionSelected = useCallback(
    (item: ConnectionMenuItem, event: EventObjectNode) => {
      // Take a snapshot of the original state in case the API request fails for any reason
      const fallbackElements = [
        ...searchElements.map((element) =>
          isPathwaySearchEdgeElement(element)
            ? deepCopyPathwaySearchEdge(element)
            : deepCopyPathwaySearchNode(element)
        ),
      ];

      const loadingElements = [event.target.data("id")];

      const candidateSearchElements = [
        // The newly connected node
        createPathwaySearchNode(
          {
            id: item.nodeId,
            displayLabel: item.label,
            dbLabel: item.label,
          },
          ["path-element"]
        ),
        ...fallbackElements,
        // And the newly connected edge
        createPathwaySearchEdge(
          {
            id: item.edgeId,
            source:
              item.direction === Direction.OUTGOING ? item.source : item.target,
            target:
              item.direction === Direction.OUTGOING ? item.target : item.source,
            displayLabel: item.type,
            type: item.type,
          },
          item.direction === Direction.INCOMING
            ? ["source-arrow-only", "path-element"]
            : ["path-element"]
        ),
      ];
      updateCounts(candidateSearchElements, loadingElements, fallbackElements);
    },
    [searchElements]
  );

  const handlePruneSelected = useCallback(
    (node: NodeSingular) => {
      try {
        const pruneCandidates = new Set<string>([node.id()]);
        const dfs = (n: NodeSingular) => {
          const children = n.outgoers();

          if (children.length > 0) {
            children.forEach((child) => {
              pruneCandidates.add(child.id());
              if (child.isNode()) {
                dfs(child);
              }
            });
          }
        };

        // This should be a collection of a single node and edge; every node in the graph has exactly one parent, except for the root
        const parents = node.incomers();
        if (parents.size() !== 0) {
          pruneCandidates.add(
            node
              .incomers()
              .filter((el) => el.isEdge())[0]
              .id()
          );
        }

        dfs(node);
        const newElements = [
          ...searchElements.map((element) => {
            if (pruneCandidates.has(element.data.id)) {
              return isPathwaySearchEdgeElement(element)
                ? deepCopyPathwaySearchEdge(element, undefined, [
                  "prune-candidate",
                ])
                : deepCopyPathwaySearchNode(element, undefined, [
                  "prune-candidate",
                ]);
            } else {
              return isPathwaySearchEdgeElement(element)
                ? deepCopyPathwaySearchEdge(element)
                : deepCopyPathwaySearchNode(element);
            }
          }),
        ];
        setSearchElements(newElements);
        setTree(createTree(newElements));
      } catch (e) {
        console.error(e);
        updateSnackbar(true, "An unexpected error occurred.", "error");
      }
    },
    [searchElements]
  );

  const handlePruneConfirm = useCallback(() => {
    const pruneRoot =
      searchElements.filter(
        (element) =>
          // Element is the root node and is a prune candiate
          !isPathwaySearchEdgeElement(element) &&
          element.classes?.includes("prune-candidate") &&
          element.data.id === tree?.id
      ).length > 0;

    if (pruneRoot) {
      // Don't need to set new elements and calculate count if the entire pathway is pruned!
      resetPathway();
      return;
    }

    // Take a snapshot of the original state in case the API request fails for any reason
    const fallbackElements = [
      ...searchElements.map((element) =>
        isPathwaySearchEdgeElement(element)
          ? deepCopyPathwaySearchEdge(
            element,
            undefined,
            [],
            ["prune-candidate"]
          )
          : deepCopyPathwaySearchNode(
            element,
            undefined,
            [],
            ["prune-candidate"]
          )
      ),
    ];

    const loadingElements = [
      ...searchElements
        .filter(
          (element) =>
            !element.classes?.includes("prune-candidate") &&
            !isPathwaySearchEdgeElement(element)
        )
        .map((element) => element.data.id),
    ];

    const candidateSearchElements = [
      ...searchElements
        .filter((element) => !element.classes?.includes("prune-candidate"))
        .map((element) =>
          isPathwaySearchEdgeElement(element)
            ? deepCopyPathwaySearchEdge(element)
            : deepCopyPathwaySearchNode(element)
        ),
    ];

    updateCounts(candidateSearchElements, loadingElements, fallbackElements);
  }, [tree, searchElements]);

  const handlePruneCancel = useCallback(() => {
    try {
      const newElements = [
        ...searchElements.map((element) =>
          isPathwaySearchEdgeElement(element)
            ? deepCopyPathwaySearchEdge(element, undefined, undefined, [
              "prune-candidate",
            ])
            : deepCopyPathwaySearchNode(element, undefined, undefined, [
              "prune-candidate",
            ])
        ),
      ];
      setSearchElements(newElements);
      setTree(createTree(newElements));
    } catch (e) {
      console.error(e);
      updateSnackbar(true, "An unexpected error occurred.", "error");
    }
  }, [searchElements]);

  useEffect(() => {
    const q = searchParams.get("q");

    if (q !== null) {
      // Using a closure here to use a return statement outside of the react effect context
      const handleParamsChange = () => {
        let initialNode: NodeResult;
        try {
          initialNode = JSON.parse(atob(decodeURI(q)));
        } catch {
          updateSnackbar(true, "Could not read data from URL params!", "warning");
          return;
        }
        handleSearchBarSubmit(initialNode);
      }

      handleParamsChange();
    }
  }, [searchParams]);

  return (
    <Box sx={{ height: "640px", position: "relative" }}>
      {showResults && tree !== undefined ? (
        <GraphPathwayResults
          tree={tree}
          onReturnBtnClick={handleReturnBtnClick}
        />
      ) : (
        <PathwaySearchContext.Provider value={pathwayContextValue}>
          <GraphPathwaySearch
            elements={searchElements}
            loadingNodes={loadingNodes}
            onConnectionSelected={handleConnectionSelected}
            onPruneSelected={handlePruneSelected}
            onPruneConfirm={handlePruneConfirm}
            onPruneCancel={handlePruneCancel}
            onDownload={handleExport}
            onUpload={handleImport}
            onCopyCypher={handleCopyCypher}
            onSearchBarSubmit={handleSearchBarSubmit}
            onSearchBtnClick={handleSearchBtnClick}
            onSelectedNodeChange={handleSelectedNodeChange}
            onReset={resetPathway}
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
    </Box>
  );
}
