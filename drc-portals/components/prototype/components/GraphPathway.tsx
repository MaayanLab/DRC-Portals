"use client";

import SearchIcon from "@mui/icons-material/Search";
import { Button, Grid, Tooltip } from "@mui/material";

import { Core, ElementDefinition, NodeSingular } from "cytoscape";
import { produce } from "immer";
import { useCallback, useRef, useState } from "react";
import { v4 } from "uuid";

import { fetchPathwaySearch } from "@/lib/neo4j/api";
import {
  INCOMING_CONNECTIONS,
  OUTGOING_CONNECTIONS,
} from "@/lib/neo4j/constants";
import { Direction } from "@/lib/neo4j/enums";
import { NodeResult, PathwayNode } from "@/lib/neo4j/types";

import {
  NodeFiltersContainer,
  PathwayModeBtnContainer,
} from "../constants/pathway-search";
import {
  NO_RESULTS_ERROR_MSG,
  SearchBarContainer,
} from "../constants/search-bar";
import { NODE_CLASS_MAP } from "../constants/shared";
import {
  PathwaySearchEdge,
  PathwaySearchEdgeData,
  PathwaySearchNode,
  PathwaySearchNodeData,
} from "../interfaces/pathway-search";
import { PathwaySearchElement } from "../types/pathway-search";
import { getNodeDisplayProperty } from "../utils/shared";
import { isPathwaySearchEdgeElement } from "../utils/pathway-search";
import { createCytoscapeElements } from "../utils/cy";

import { CytoscapeContext } from "./CytoscapeChart/CytoscapeContext";
import PathwayNodeFilters from "./PathwaySearch/PathwayNodeFilters";
import PathwaySearchBar from "./SearchBar/PathwaySearchBar";
import GraphPathwayResults from "./PathwaySearch/GraphPathwayResults";
import GraphPathwaySearch from "./PathwaySearch/GraphPathwaySearch";

export default function GraphPathway() {
  const [resultElements, setResultElements] = useState<ElementDefinition[]>([]);
  const [searchElements, setSearchElements] = useState<PathwaySearchElement[]>(
    []
  );
  const [showResults, setShowResults] = useState(false);
  const [selectedNode, setSelectedNode] = useState<PathwaySearchNode>();
  const pathwaySearchContext = { cyRef: useRef<Core>() };

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

  const onReset = useCallback(() => {
    setResultElements([]);
    setSearchElements([]);
    setSelectedNode(undefined);
  }, []);

  const onSelectedNodeChange = useCallback(
    (id: string | undefined, cy: Core) => {
      if (id === undefined) {
        setSelectedNode(undefined);
      } else {
        const node = cy.nodes().$id(id);

        if (!node.hasClass("path-element")) {
          addPathNode(node, cy);
        }

        setSelectedNode({
          classes: node.classes(),
          data: node.data(),
        });
      }
    },
    []
  );

  const handleNodeFilterChange = useCallback(
    (value: string) => {
      if (selectedNode !== undefined) {
        const newSelectedNode: PathwaySearchNode = {
          classes: selectedNode.classes,
          data: {
            ...selectedNode.data,
            displayLabel: value,
          },
        };
        setSelectedNode(newSelectedNode);
        handleUpdateSearchElements([newSelectedNode]);
      }
    },
    [selectedNode]
  );

  const handleUpdateSearchElements = useCallback(
    (elements: PathwaySearchElement[]) => {
      setSearchElements(
        produce((draft) => {
          elements.forEach((element) => {
            const existingElementIdx = draft.findIndex(
              (el) => el.data.id === element.data.id
            );

            if (existingElementIdx === -1) {
              if (isPathwaySearchEdgeElement(element)) {
                draft.push(element);
              } else {
                draft.unshift(element);
              }
            } else {
              draft.splice(existingElementIdx, 1, element);
            }
          });
        })
      );
    },
    []
  );

  const createTree = () => {
    const pathwaySearchCy = pathwaySearchContext.cyRef.current;

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

  const getResults = async () => {
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

  const returnToSearch = () => {
    setShowResults(false);
    setResultElements([]);
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

  const handleSubmit = (cvTerm: NodeResult) => {
    // TODO: Direct node results *should* always have at least one label since they are required on all Neo4j nodes, so maybe this check
    // isn't necessary? If we had validation on the search request response we could throw an error before reaching this point...
    if (cvTerm.labels === undefined || cvTerm.labels.length === 0) {
      console.warn("CV term search returned node with no labels! Aborting.");
      return;
    }

    const cvTermDBLabel = cvTerm.labels[0];
    const { nodes, edges } = getConnectedElements(cvTermDBLabel, cvTerm.uuid);
    setSearchElements([
      // TODO: Should probably have a constant for this style class, and the other classes for that matter
      createPathwaySearchNode(
        {
          id: cvTerm.uuid,
          displayLabel: getNodeDisplayProperty(cvTermDBLabel, cvTerm),
          dbLabel: cvTermDBLabel,
        },
        ["path-element"]
      ),
      ...nodes,
      ...edges,
    ]);
  };

  const addPathNode = (node: NodeSingular, cy: cytoscape.Core) => {
    // Get selected node data, and get new data for its connected nodes and relationships
    const data: PathwaySearchNodeData = node.data();
    const edge = node.connectedEdges().first();
    const { nodes: newNodes, edges: newEdges } = getConnectedElements(
      data.dbLabel,
      data.id
    );

    // TODO: Should probably have a constant for this style class, and the other classes for that matter
    edge.addClass("path-element");
    node.addClass("path-element");

    const prevNodes = [...Array.from(cy.nodes())].map((n) => ({
      classes: [...n.classes()],
      data: n.data(),
    }));
    const prevEdges = [...Array.from(cy.edges())].map((e) => ({
      classes: [...e.classes()],
      data: e.data(),
    }));

    setSearchElements([...prevNodes, ...newNodes, ...prevEdges, ...newEdges]);
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
          onReturnClick={returnToSearch}
        />
      ) : (
        <Grid item xs={12} sx={{ position: "relative", height: "inherit" }}>
          {searchElements.length === 0 ? (
            <SearchBarContainer>
              <PathwaySearchBar onSubmit={handleSubmit}></PathwaySearchBar>
            </SearchBarContainer>
          ) : (
            <PathwayModeBtnContainer>
              <Tooltip title="Search Path" arrow placement="left">
                <Button
                  aria-label="search-path"
                  color="secondary"
                  variant="contained"
                  size="large"
                  sx={{ height: "64px", width: "64px", borderRadius: "50%" }}
                  onClick={getResults}
                >
                  <SearchIcon />
                </Button>
              </Tooltip>
            </PathwayModeBtnContainer>
          )}
          {selectedNode === undefined ? null : (
            <NodeFiltersContainer>
              <PathwayNodeFilters
                node={selectedNode}
                onChange={handleNodeFilterChange}
              ></PathwayNodeFilters>
            </NodeFiltersContainer>
          )}
          <CytoscapeContext.Provider value={pathwaySearchContext}>
            <GraphPathwaySearch
              elements={searchElements}
              onSelectedNodeChange={onSelectedNodeChange}
              onReset={onReset}
            />
          </CytoscapeContext.Provider>
        </Grid>
      )}
    </Grid>
  );
}
