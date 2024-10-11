"use client";

import SearchIcon from "@mui/icons-material/Search";
import { Grid, Tooltip } from "@mui/material";

import cytoscape, { ElementDefinition, NodeSingular } from "cytoscape";
import { produce } from "immer";
import { useCallback, useState } from "react";
import { v4 } from "uuid";

import { fetchPathwaySearch } from "@/lib/neo4j/api";
import {
  ANALYSIS_TYPE_LABEL,
  ANATOMY_LABEL,
  ASSAY_TYPE_LABEL,
  ASSOCIATED_WITH_TYPE,
  COMPOUND_LABEL,
  CONTAINS_TYPE,
  DATA_TYPE_LABEL,
  DISEASE_LABEL,
  FILE_FORMAT_LABEL,
  GENERATED_BY_ANALYSIS_TYPE_TYPE,
  GENERATED_BY_ASSAY_TYPE_TYPE,
  ID_NAMESPACE_LABEL,
  IS_DATA_TYPE_TYPE,
  IS_ETHNICITY_TYPE,
  IS_FILE_FORMAT_TYPE,
  IS_GRANULARITY_TYPE,
  IS_RACE_TYPE,
  IS_SEX_TYPE,
  NCBI_TAXONOMY_LABEL,
  PATHWAY_INCOMING_CONNECTIONS,
  PATHWAY_OUTGOING_CONNECTIONS,
  PREPPED_VIA_TYPE,
  SAMPLE_PREP_METHOD_LABEL,
  SAMPLED_FROM_TYPE,
  SUBJECT_ETHNICITY_LABEL,
  SUBJECT_GRANULARITY_LABEL,
  SUBJECT_RACE_LABEL,
  SUBJECT_SEX_LABEL,
  TESTED_FOR_TYPE,
} from "@/lib/neo4j/constants";
import { Direction } from "@/lib/neo4j/enums";
import {
  NodeResult,
  PathwayNode,
  PathwayRelationship,
} from "@/lib/neo4j/types";

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
          selectedNode = addNodeToPathV1(cyNode, cy);
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

  const handleAddElements = useCallback((elements: ElementDefinition[]) => {
    setSearchElements(
      produce((draft) => {
        draft.push(...elements);
      })
    );
  }, []);

  const handleAddNode = useCallback((nodeId: string, child: PathwayNode) => {
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
  }, []);

  // TODO: Should consolidate these updates, need to make sure we're not repeating code more than necessary
  const handleAddOrUpdateNodeFilter = useCallback(
    (nodeId: string, label: string, value: string) => {
      setTree(
        produce((draft) => {
          if (draft !== undefined) {
            const node = findNode(nodeId, draft);
            if (node !== undefined) {
              // Treat "" as removing the filter; Set children as everything but the edited label and return
              if (value === "") {
                node.children = node.children.filter(
                  (child) => child.label !== label
                );
                return;
              }

              const existingFilter = node.children.find(
                (child) => child.label === label
              );

              // If the node already had a filter for this label, update it with the new value
              if (existingFilter !== undefined) {
                existingFilter.props = { ...existingFilter.props, name: value };
              } else {
                // TODO: This is a hack. Since these artificial filter pathways don't actually exist on the canvas, we have to somehow map
                // the node label to the corresponding relationship, otherwise we wouldn't be able to add it to the match statement on the
                // backend. Refactoring the implementation to take advantage of literal filter nodes on both the canvas and in the tree
                // would solve this problem, because the relationship would actually exist on the canvas and we could pull both the type
                // and the direction from it.
                const LABEL_TO_REL_OBJ_MAP: ReadonlyMap<
                  string,
                  PathwayRelationship
                > = new Map([
                  // File related nodes
                  [
                    ASSAY_TYPE_LABEL,
                    {
                      id: v4(),
                      type: GENERATED_BY_ASSAY_TYPE_TYPE,
                      direction: Direction.OUTGOING,
                    },
                  ],
                  [
                    DATA_TYPE_LABEL,
                    {
                      id: v4(),
                      type: IS_DATA_TYPE_TYPE,
                      direction: Direction.OUTGOING,
                    },
                  ],
                  [
                    FILE_FORMAT_LABEL,
                    {
                      id: v4(),
                      type: IS_FILE_FORMAT_TYPE,
                      direction: Direction.OUTGOING,
                    },
                  ],
                  [
                    ANALYSIS_TYPE_LABEL,
                    {
                      id: v4(),
                      type: GENERATED_BY_ANALYSIS_TYPE_TYPE,
                      direction: Direction.OUTGOING,
                    },
                  ],
                  // Subject related nodes
                  [
                    SUBJECT_SEX_LABEL,
                    {
                      id: v4(),
                      type: IS_SEX_TYPE,
                      direction: Direction.OUTGOING,
                    },
                  ],
                  [
                    SUBJECT_RACE_LABEL,
                    {
                      id: v4(),
                      type: IS_RACE_TYPE,
                      direction: Direction.OUTGOING,
                    },
                  ],
                  [
                    SUBJECT_GRANULARITY_LABEL,
                    {
                      id: v4(),
                      type: IS_GRANULARITY_TYPE,
                      direction: Direction.OUTGOING,
                    },
                  ],
                  [
                    SUBJECT_ETHNICITY_LABEL,
                    {
                      id: v4(),
                      type: IS_ETHNICITY_TYPE,
                      direction: Direction.OUTGOING,
                    },
                  ],
                  // Biosample related nodes
                  [
                    SAMPLE_PREP_METHOD_LABEL,
                    {
                      id: v4(),
                      type: PREPPED_VIA_TYPE,
                      direction: Direction.OUTGOING,
                    },
                  ],
                  // Term nodes
                  [
                    NCBI_TAXONOMY_LABEL,
                    {
                      id: v4(),
                      type: ASSOCIATED_WITH_TYPE,
                      direction: Direction.OUTGOING,
                    },
                  ],
                  [
                    DISEASE_LABEL,
                    {
                      id: v4(),
                      type: TESTED_FOR_TYPE,
                      direction: Direction.OUTGOING,
                    },
                  ],
                  [
                    COMPOUND_LABEL,
                    {
                      id: v4(),
                      type: ASSOCIATED_WITH_TYPE,
                      direction: Direction.OUTGOING,
                    },
                  ],
                  [
                    ANATOMY_LABEL,
                    {
                      id: v4(),
                      type: SAMPLED_FROM_TYPE,
                      direction: Direction.OUTGOING,
                    },
                  ],
                  // Admin nodes
                  [
                    ID_NAMESPACE_LABEL,
                    {
                      id: v4(),
                      type: CONTAINS_TYPE,
                      direction: Direction.INCOMING,
                    },
                  ],
                ]);

                // Otherwise add the filter as a new child
                node.children.push({
                  id: v4(),
                  label: label,
                  props: { name: value },
                  relationshipToParent: LABEL_TO_REL_OBJ_MAP.get(label),
                  children: [],
                });
              }
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

    Array.from(
      PATHWAY_OUTGOING_CONNECTIONS.get(label)?.entries() || []
    ).forEach(([relationship, labels]) => {
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
    });
    Array.from(
      PATHWAY_INCOMING_CONNECTIONS.get(label)?.entries() || []
    ).forEach(([relationship, labels]) => {
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
    });

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

  // TODO: As time permits, need to simplify the logic here, it's fairly straightforward on paper but the implementation is too verbose...
  const addNodeToPathV1 = (node: NodeSingular, cy: cytoscape.Core) => {
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
      const pathNodes = [node, ...Array.from(cy.nodes(".path-element"))].map(
        (n) => {
          return { classes: [...n.classes(), "path-element"], data: n.data() };
        }
      );
      const pathEdges = [edge, ...Array.from(cy.edges(".path-element"))].map(
        (e) => {
          return { classes: [...e.classes(), "path-element"], data: e.data() };
        }
      );

      const newNode: PathwayNode = {
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
      handleAddNode(nodeParentId, newNode);
      // TODO: Use an immer handler here instead?
      setSearchElements([...pathNodes, ...nodes, ...pathEdges, ...edges]);
      return newNode;
    } else {
      // TODO: Need to have better handling of this error even if it *should* never happen, but logging the issue should suffice for now
      console.error("Attempted to add node to path with no labels! Aborting.");
    }
  };

  const addNodeToPathV2 = (node: NodeSingular, cy: cytoscape.Core) => {
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
      handleAddNode(nodeParentId, {
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
      });
      handleAddElements([...nodes, ...edges]);
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
                onChange={(label, value) =>
                  handleAddOrUpdateNodeFilter(selectedNode.id, label, value)
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
