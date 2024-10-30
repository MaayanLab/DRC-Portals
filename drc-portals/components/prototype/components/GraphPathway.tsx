"use client";

import { Grid } from "@mui/material";

import { Core, ElementDefinition, NodeSingular } from "cytoscape";
import { useCallback, useRef, useState } from "react";
import { v4 } from "uuid";

import { fetchPathwaySearch } from "@/lib/neo4j/api";
import {
  INCOMING_CONNECTIONS,
  OUTGOING_CONNECTIONS,
} from "@/lib/neo4j/constants";
import { Direction } from "@/lib/neo4j/enums";
import { NodeResult, PathwayNode } from "@/lib/neo4j/types";

import { NO_RESULTS_ERROR_MSG } from "../constants/search-bar";
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
import { getNodeDisplayProperty } from "../utils/shared";

import { CytoscapeContext } from "./CytoscapeChart/CytoscapeContext";
import GraphPathwayResults from "./PathwaySearch/GraphPathwayResults";
import GraphPathwaySearch from "./PathwaySearch/GraphPathwaySearch";

export default function GraphPathway() {
  const [resultElements, setResultElements] = useState<ElementDefinition[]>([]);
  const [searchElements, setSearchElements] = useState<PathwaySearchElement[]>(
    []
  );
  const [showResults, setShowResults] = useState(false);
  const pathwaySearchCyRef = useRef<Core>();
  const pathwaySearchContext = { cyRef: pathwaySearchCyRef };

  const createTree = () => {
    const pathwaySearchCy = pathwaySearchCyRef.current;

    if (pathwaySearchCy !== undefined) {
      const roots = pathwaySearchCy.nodes().roots();

      if (roots.length !== 1) {
        console.error(
          "GraphPathway Error: Could not find root node of the pathway."
        );
        return undefined;
      }

      const root = roots.first();

      const createTreeFromRoot = (
        node: NodeSingular
      ): PathwayNode | undefined => {
        const nodeData: PathwaySearchNodeData = node.data();
        const edgesToParent = node.incomers().edges();

        if (edgesToParent.length > 1) {
          console.warn(
            "GraphPathway Warning: Found node with more than one parent. Skipping."
          );
          return undefined;
        }

        const parentEdge =
          edgesToParent.length === 0 ? undefined : edgesToParent.first();

        return {
          id: nodeData.id,
          label: nodeData.dbLabel,
          props:
            nodeData.displayLabel === nodeData.dbLabel
              ? undefined
              : {
                  name: nodeData.displayLabel,
                },
          relationshipToParent:
            parentEdge === undefined
              ? undefined
              : {
                  id: parentEdge.id(),
                  type: parentEdge.data("type"),
                  direction: parentEdge.hasClass("source-arrow-only")
                    ? Direction.INCOMING
                    : Direction.OUTGOING,
                },
          children: node
            .outgoers(".path-element")
            .nodes()
            .map((node) => createTreeFromRoot(node))
            .filter((tree) => tree !== undefined),
        };
      };
      return createTreeFromRoot(root);
    }
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

  const handleSearchBtnClick = async () => {
    const tree = createTree();
    try {
      const query = btoa(JSON.stringify(tree));
      const response = await fetchPathwaySearch(query);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const elements = createCytoscapeElements(data);

      if (elements.length === 0) {
        console.warn(NO_RESULTS_ERROR_MSG);
      } else {
        setShowResults(true);
        setResultElements(elements);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
        <CytoscapeContext.Provider value={pathwaySearchContext}>
          <GraphPathwaySearch
            elements={searchElements}
            onSearchBarSubmit={handleSearchBarSubmit}
            onSearchBtnClick={handleSearchBtnClick}
            onSelectedNodeChange={handleSelectedNodeChange}
            onReset={handleReset}
          />
        </CytoscapeContext.Provider>
      )}
    </Grid>
  );
}
