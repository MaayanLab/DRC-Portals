"use client";

import SearchIcon from "@mui/icons-material/Search";
import { Grid, Tooltip } from "@mui/material";

import cytoscape, { ElementDefinition, NodeSingular } from "cytoscape";
import { produce } from "immer";
import { useCallback, useState } from "react";
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
import {
  CytoscapeEdge,
  CytoscapeNode,
  CytoscapeNodeData,
} from "../interfaces/cy";
import {
  createCytoscapeEdge,
  createCytoscapeElements,
  createCytoscapeNode,
} from "../utils/cy";
import { findNode, traverseTree } from "../utils/pathway-search";

import PathwayNodeFilters from "./PathwaySearch/PathwayNodeFilters";
import PathwaySearchBar from "./SearchBar/PathwaySearchBar";
import GraphPathwayResults from "./PathwaySearch/GraphPathwayResults";
import GraphPathwaySearch from "./PathwaySearch/GraphPathwaySearch";
import { Button } from "@mui/material";

export default function GraphPathway() {
  const [resultElements, setResultElements] = useState<ElementDefinition[]>([]);
  const [searchElements, setSearchElements] = useState<ElementDefinition[]>([]);
  const [tree, setTree] = useState<PathwayNode>();
  const [showResults, setShowResults] = useState(false);
  const [selectedNode, setSelectedNode] = useState<PathwayNode>();

  const onReset = useCallback(() => {
    setResultElements([]);
    setSearchElements([]);
    setTree(undefined);
    setSelectedNode(undefined);
  }, []);

  const onSelectedNodeChange = useCallback(
    (id: string | undefined, cy: cytoscape.Core) => {
      if (id === undefined) {
        setSelectedNode(undefined);
      } else if (tree !== undefined) {
        const cyNode = cy.getElementById(id);
        let selectedNode: PathwayNode | undefined;

        if (!cyNode.hasClass("path-element")) {
          selectedNode = addNodeToPath(cyNode, cy);
        } else {
          selectedNode = findNode(id, tree);
        }

        setSelectedNode(selectedNode);
      }
    },
    [tree]
  );

  const getResults = async () => {
    if (tree !== undefined) {
      const query = btoa(JSON.stringify(traverseTree(tree)));

      try {
        const response = await fetchPathwaySearch(query);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const cytoscapeElements = createCytoscapeElements(data);

        if (cytoscapeElements.length === 0) {
          console.warn(NO_RESULTS_ERROR_MSG);
        } else {
          setShowResults(true);
          setResultElements(cytoscapeElements);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const returnToSearch = () => {
    setShowResults(false);
    setResultElements([]);
  };

  const handleAddNodeToTree = useCallback(
    (nodeId: string, child: PathwayNode) => {
      setTree(
        produce((draft) => {
          if (draft !== undefined) {
            const node = findNode(nodeId, draft);
            if (node !== undefined) {
              node.children.push(child);
            }
          }
        })
      );
    },
    []
  );

  const handleAddOrUpdateNodeFilter = useCallback(
    (nodeId: string, value: string) => {
      setTree(
        produce((draft) => {
          if (draft !== undefined) {
            const node = findNode(nodeId, draft);
            if (node !== undefined) {
              // Treat "" as removing the filter
              if (value === "") {
                delete node.props?.name;
                return;
              }

              // Otherwise, update props with the new name
              node.props = { ...node.props, name: value };
            }
          }
        })
      );
    },
    []
  );

  const getConnectedElements = (
    label: string,
    id: string
  ): { nodes: CytoscapeNode[]; edges: CytoscapeEdge[] } => {
    const nodes: CytoscapeNode[] = [];
    const edges: CytoscapeEdge[] = [];

    // TODO: In the future we should dynamically load the connections of the specified node based on the current state of the tree
    Array.from(OUTGOING_CONNECTIONS.get(label)?.entries() || []).forEach(
      ([relationship, labels]) => {
        labels.forEach((label) => {
          const node = {
            uuid: v4(),
            labels: [label],
            properties: {},
          };
          nodes.push(createCytoscapeNode(node));
          edges.push(
            createCytoscapeEdge({
              uuid: v4(),
              type: relationship,
              properties: {},
              startUUID: id,
              endUUID: node.uuid,
            })
          );
        });
      }
    );
    Array.from(INCOMING_CONNECTIONS.get(label)?.entries() || []).forEach(
      ([relationship, labels]) => {
        labels.forEach((label) => {
          const node = {
            uuid: v4(),
            labels: [label],
            properties: {},
          };
          nodes.push(createCytoscapeNode(node));
          edges.push(
            createCytoscapeEdge(
              {
                uuid: v4(),
                type: relationship,
                properties: {},
                startUUID: id,
                endUUID: node.uuid,
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

    // TODO: It's worth noting we do not set a selected node upon initial load, but it's possible there is a reason to do it
    const { nodes, edges } = getConnectedElements(
      cvTerm.labels[0],
      cvTerm.uuid
    );
    setSearchElements([
      // TODO: Should probably have a constant for this style class, and the other classes for that matter
      createCytoscapeNode(cvTerm, ["path-element"], true),
      ...nodes,
      ...edges,
    ]);
    setTree({
      id: cvTerm.uuid,
      label: cvTerm.labels[0],
      props: cvTerm.properties,
      children: [],
    });
  };

  const addNodeToPath = (node: NodeSingular, cy: cytoscape.Core) => {
    // Get selected node data, and get new data for its connected nodes and relationships
    const nodeData: CytoscapeNodeData = node.data();
    const nodeLabels = nodeData.neo4j?.labels;
    if (nodeLabels !== undefined && nodeLabels.length > 0) {
      const edge = node.connectedEdges().first();
      // "Parent" is always the source node (i.e., the one higher in the tree), even if the edge is visually going "up" the tree
      const nodeParentId = edge.source().id();
      const { nodes, edges } = getConnectedElements(nodeLabels[0], nodeData.id);

      // TODO: Should probably have a constant for this style class, and the other classes for that matter
      edge.addClass("path-element");
      node.addClass("path-element");

      const prevNodes = [node, ...Array.from(cy.nodes())].map((n) => ({
        classes: [...n.classes()],
        data: n.data(),
      }));
      const prevEdges = [edge, ...Array.from(cy.edges())].map((e) => ({
        classes: [...e.classes()],
        data: e.data(),
      }));

      const newTreeNode: PathwayNode = {
        id: node.id(),
        label: nodeLabels[0],
        children: [],
        relationshipToParent: {
          id: edge.id(),
          type: edge.data("neo4j").type,
          direction: edge.hasClass("source-arrow-only")
            ? Direction.INCOMING
            : Direction.OUTGOING,
          props: edge.data("neo4j").properties,
        },
        props: nodeData.neo4j?.properties,
      };
      handleAddNodeToTree(nodeParentId, newTreeNode);
      setSearchElements([...prevNodes, ...nodes, ...prevEdges, ...edges]);
      return newTreeNode;
    } else {
      // TODO: Need to have better handling of this error even if it *should* never happen, but logging the issue should suffice for now
      console.error("Attempted to add node to path with no labels! Aborting.");
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
          onReturnClick={returnToSearch}
        />
      ) : (
        <Grid item xs={12} sx={{ position: "relative", height: "inherit" }}>
          {tree === undefined ? (
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
                onChange={(value) =>
                  handleAddOrUpdateNodeFilter(selectedNode.id, value)
                }
              ></PathwayNodeFilters>
            </NodeFiltersContainer>
          )}
          <GraphPathwaySearch
            elements={searchElements}
            onSelectedNodeChange={onSelectedNodeChange}
            onReset={onReset}
          />
        </Grid>
      )}
    </Grid>
  );
}
