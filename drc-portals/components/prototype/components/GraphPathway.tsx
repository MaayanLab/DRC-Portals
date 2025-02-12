"use client";

import { AlertColor, Grid } from "@mui/material";

import { NodeSingular } from "cytoscape";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { z } from "zod";

import { Direction } from "@/lib/neo4j/enums";
import {
  NodeResult,
  PathwayNode,
  PathwaySearchResultRow,
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
  const pathwayContextValue: PathwaySearchContextProps = useMemo(
    () => ({ tree }),
    [tree]
  );
  const PATHWAY_DATA_PARSE_ERROR =
    "Failed to parse pathway data import. Please check the data format.";
  const PATHWAY_DATA_PARSE_SUCCESS = "Pathway data imported successfully.";

  const updateSnackbar = (open: boolean, msg: string, severity: AlertColor) => {
    setSnackbarMsg(msg);
    setSnackbarOpen(open);
    setSnackbarSeverity(severity);
  };

  const handleReset = useCallback(() => {
    setSearchElements([]);
  }, []);

  const updatePathNode = useCallback(
    (node: PathwaySearchNode) => {
      // Update search elements with the updated node and a copy of the rest
      const newElements = [
        deepCopyPathwaySearchNode(node),
        ...searchElements
          .filter((el) => el.data.id !== node.data.id)
          .map((element) =>
            isPathwaySearchEdgeElement(element)
              ? deepCopyPathwaySearchEdge(element)
              : deepCopyPathwaySearchNode(element)
          ),
      ];
      setSearchElements(newElements);
      setTree(createTree(newElements));
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
    const initialTree = createTree([initialNode]);
    setTree(initialTree);

    if (initialTree !== undefined) {
      setSearchElements([initialNode]);
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

  const handleConnectionSelected = useCallback(
    (item: ConnectionMenuItem) => {
      const newElements = [
        createPathwaySearchNode(
          {
            id: item.nodeId,
            displayLabel: item.label,
            dbLabel: item.label,
          },
          ["path-element"]
        ),
        ...searchElements.map((element) =>
          isPathwaySearchEdgeElement(element)
            ? deepCopyPathwaySearchEdge(element)
            : deepCopyPathwaySearchNode(element)
        ),
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
      setTree(createTree(newElements));
      setSearchElements(newElements);
    },
    [searchElements]
  );

  const handlePruneSelected = useCallback(
    (node: NodeSingular) => {
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
    },
    [searchElements]
  );

  const handlePruneConfirm = useCallback(() => {
    const newElements = [
      ...searchElements
        .filter((element) => !element.classes?.includes("prune-candidate"))
        .map((element) =>
          isPathwaySearchEdgeElement(element)
            ? deepCopyPathwaySearchEdge(element)
            : deepCopyPathwaySearchNode(element)
        ),
    ];
    setSearchElements(newElements);
    setTree(createTree(newElements));
  }, [searchElements]);

  const handlePruneCancel = useCallback(() => {
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
  }, [searchElements]);

  return (
    <Grid
      container
      spacing={1}
      xs={12}
      sx={{
        height: "640px",
      }}
    >
      {showResults && tree !== undefined ? (
        <GraphPathwayResults
          tree={tree}
          onReturnBtnClick={handleReturnBtnClick}
        />
      ) : (
        <PathwaySearchContext.Provider value={pathwayContextValue}>
          <GraphPathwaySearch
            elements={searchElements}
            onConnectionSelected={handleConnectionSelected}
            onPruneSelected={handlePruneSelected}
            onPruneConfirm={handlePruneConfirm}
            onPruneCancel={handlePruneCancel}
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
