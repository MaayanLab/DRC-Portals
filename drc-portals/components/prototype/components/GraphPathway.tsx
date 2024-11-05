"use client";

import { AlertColor, Grid } from "@mui/material";

import { ElementDefinition } from "cytoscape";
import { ChangeEvent, useCallback, useState } from "react";
import { v4 } from "uuid";
import { z } from "zod";

import { fetchPathwaySearch } from "@/lib/neo4j/api";
import {
  INCOMING_CONNECTIONS,
  OUTGOING_CONNECTIONS,
} from "@/lib/neo4j/constants";
import { Direction } from "@/lib/neo4j/enums";
import { NodeResult, PathwayNode } from "@/lib/neo4j/types";

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
import { isPathwaySearchEdgeElement } from "../utils/pathway-search";
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
  const PATHWAY_DATA_PARSE_ERROR =
    "Failed to parse pathway data import. Please check the data format.";
  const PATHWAY_DATA_PARSE_SUCCESS = "Pathway data imported successfully.";

  const updateSnackbar = (open: boolean, msg: string, severity: AlertColor) => {
    setSnackbarMsg(msg);
    setSnackbarOpen(open);
    setSnackbarSeverity(severity);
  };

  const createTree = (elements: PathwaySearchElement[]) => {
    const sources = new Set<string>();
    const targets = new Set<string>();
    elements
      .filter((el) => isPathwaySearchEdgeElement(el))
      .forEach((edge) => {
        sources.add(edge.data.source);
        targets.add(edge.data.target);
      });
    const rootNodes = sources.difference(targets);

    if (rootNodes.size !== 1) {
      console.error(
        "GraphPathway Error: Could not find root node of the pathway."
      );
      return undefined;
    }

    const root = elements.find(
      (el) => el.data.id === Array.from(rootNodes)[0]
    ) as PathwaySearchNode | undefined;

    if (root === undefined) {
      console.error(
        "GraphPathway Error: Could not find root node of the pathway."
      );
      return undefined;
    }

    const createTreeFromRoot = (root: PathwaySearchNode): PathwayNode => {
      let parentEdge: PathwaySearchEdge | undefined = undefined;
      const childIds = new Set<string>();

      for (const edge of elements.filter((el) =>
        isPathwaySearchEdgeElement(el)
      )) {
        if (edge.data.target === root.data.id) {
          parentEdge = edge;
        }
        if (edge.data.source === root.data.id) {
          childIds.add(edge.data.target);
        }
      }

      return {
        id: root.data.id,
        label: root.data.dbLabel,
        props:
          root.data.displayLabel === root.data.dbLabel
            ? undefined
            : {
                name: root.data.displayLabel,
              },
        relationshipToParent:
          parentEdge === undefined
            ? undefined
            : {
                id: parentEdge.data.id,
                type: parentEdge.data.type,
                direction: (parentEdge.classes || []).includes(
                  "source-arrow-only"
                )
                  ? Direction.INCOMING
                  : Direction.OUTGOING,
              },
        children: (
          elements.filter(
            (el) =>
              childIds.has(el.data.id) && // el is a child of the root
              !isPathwaySearchEdgeElement(el) && // el is not an edge
              el.classes?.includes("path-element") // el is part of the path
          ) as PathwaySearchNode[]
        )
          .map((node) => createTreeFromRoot(node))
          .filter((tree) => tree !== undefined),
      };
    };
    return createTreeFromRoot(root);
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

  const getConnectedElements = (
    sourceLabel: string,
    sourceId: string
  ): { nodes: PathwaySearchNode[]; edges: PathwaySearchEdge[] } => {
    const nodes: PathwaySearchNode[] = [];
    const edges: PathwaySearchEdge[] = [];

    // TODO: In the future we should dynamically load the connections of the specified node based on the current state of the tree
    Array.from(OUTGOING_CONNECTIONS.get(sourceLabel)?.entries() || []).forEach(
      ([relationship, labels]) => {
        labels.forEach((label) => {
          const targetId = v4();
          nodes.push(
            createPathwaySearchNode({
              id: targetId,
              displayLabel: label,
              dbLabel: label,
            })
          );
          edges.push(
            createPathwaySearchEdge({
              id: v4(),
              displayLabel: relationship,
              type: relationship,
              source: sourceId,
              target: targetId,
            })
          );
        });
      }
    );
    Array.from(INCOMING_CONNECTIONS.get(sourceLabel)?.entries() || []).forEach(
      ([relationship, labels]) => {
        labels.forEach((label) => {
          const targetId = v4();
          nodes.push(
            createPathwaySearchNode({
              id: targetId,
              displayLabel: label,
              dbLabel: label,
            })
          );
          edges.push(
            createPathwaySearchEdge(
              {
                id: v4(),
                displayLabel: relationship,
                type: relationship,
                source: sourceId,
                target: targetId,
              },
              ["source-arrow-only"]
            )
          );
        });
      }
    );

    return { nodes, edges };
  };

  const deepCopyPathwaySearchNode = (
    node: PathwaySearchNode
  ): PathwaySearchNode => ({
    classes: [...(node.classes || [])],
    data: { ...node.data },
  });

  const deepCopyPathwaySearchEdge = (
    edge: PathwaySearchEdge
  ): PathwaySearchEdge => ({
    classes: [...(edge.classes || [])],
    data: { ...edge.data },
  });

  const handleReset = useCallback(() => {
    setResultElements([]);
    setSearchElements([]);
  }, []);

  const addNodeToPath = useCallback(
    (node: PathwaySearchNode) => {
      const connectedEdge = searchElements.filter(
        (element) =>
          isPathwaySearchEdgeElement(element) &&
          element.data.target === node.data.id
      )[0] as PathwaySearchEdge | undefined;

      // This should never happen, but log an error just in case...
      if (connectedEdge === undefined) {
        console.error(
          `GraphPathway Error: No incoming edge for node ${node.data.id}. Aborting.`
        );
        return;
      }

      const { nodes: newNodes, edges: newEdges } = getConnectedElements(
        node.data.dbLabel,
        node.data.id
      );

      setSearchElements([
        {
          data: { ...node.data },
          classes: [...(node.classes || []), "path-element"],
        },
        ...newNodes,
        ...searchElements
          .filter(
            (element) =>
              element.data.id !== node.data.id &&
              element.data.id !== connectedEdge.data.id
          )
          .map((element) =>
            isPathwaySearchEdgeElement(element)
              ? deepCopyPathwaySearchEdge(element)
              : deepCopyPathwaySearchNode(element)
          ),
        {
          data: { ...connectedEdge.data },
          classes: [...(connectedEdge.classes || []), "path-element"],
        },
        ...newEdges,
      ]);
    },
    [searchElements]
  );

  const updatePathNode = useCallback(
    (node: PathwaySearchNode) => {
      setSearchElements([
        deepCopyPathwaySearchNode(node),
        ...searchElements
          .filter((element) => element.data.id !== node.data.id)
          .map((element) =>
            isPathwaySearchEdgeElement(element)
              ? deepCopyPathwaySearchEdge(element)
              : deepCopyPathwaySearchNode(element)
          ),
      ]);
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
    try {
      const query = btoa(JSON.stringify(tree));
      const response = await fetchPathwaySearch(query);

      if (!response.ok) {
        updateSnackbar(true, BASIC_SEARCH_ERROR_MSG, "error");
      } else {
        const data = await response.json();
        const elements = createCytoscapeElements(data);

        if (elements.length === 0) {
          updateSnackbar(true, NO_RESULTS_ERROR_MSG, "warning");
        } else {
          setShowResults(true);
          setResultElements(elements);
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

    const cvTermDBLabel = cvTerm.labels[0];
    const { nodes, edges } = getConnectedElements(cvTermDBLabel, cvTerm.uuid);
    setSearchElements([
      createPathwaySearchNode(
        {
          id: cvTerm.uuid,
          displayLabel: getNodeDisplayProperty(cvTermDBLabel, cvTerm),
          dbLabel: cvTermDBLabel,
        },
        // TODO: Should probably have a constant for this style class, and the other classes for that matter
        ["path-element"]
      ),
      ...nodes,
      ...edges,
    ]);
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
