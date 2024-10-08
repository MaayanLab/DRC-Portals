"use client";

import PublishIcon from "@mui/icons-material/Publish";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { Grid, IconButton, Tooltip } from "@mui/material";

import cytoscape, {
  ElementDefinition,
  EventObjectEdge,
  EventObjectNode,
  NodeSingular,
} from "cytoscape";
import { produce } from "immer";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useState } from "react";
import { v4 } from "uuid";

import {
  ANATOMY_LABEL,
  ASSAY_TYPE_LABEL,
  ASSOCIATED_WITH_TYPE,
  COMPOUND_LABEL,
  CONTAINS_TYPE,
  DCC_LABEL,
  DISEASE_LABEL,
  GENERATED_BY_ASSAY_TYPE_TYPE,
  IS_RACE_TYPE,
  NCBI_TAXONOMY_LABEL,
  PATHWAY_INCOMING_CONNECTIONS,
  PATHWAY_OUTGOING_CONNECTIONS,
  SAMPLED_FROM_TYPE,
  SUBJECT_RACE_LABEL,
  SUBJECT_SEX_LABEL,
} from "@/lib/neo4j/constants";
import { Direction } from "@/lib/neo4j/enums";
import {
  NodeResult,
  PathwayNode,
  PathwayRelationship,
} from "@/lib/neo4j/types";

import { DAGRE_LAYOUT, DAGRE_STYLESHEET } from "../constants/cy";
import { NodeFiltersContainer } from "../constants/pathway-search";
import { SearchBarContainer } from "../constants/search-bar";
import {
  CytoscapeEdge,
  CytoscapeEvent,
  CytoscapeNode,
  CytoscapeNodeData,
} from "../interfaces/cy";
import { CustomToolbarFnFactory } from "../types/cy";
import { createCytoscapeEdge, createCytoscapeNode } from "../utils/cy";
import { findNode, traverseTree } from "../utils/pathway-search";
import { createVerticalDividerElement } from "../utils/shared";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";
import PathwayNodeFilters from "./PathwaySearch/PathwayNodeFilters";
import PathwaySearchBar from "./SearchBar/PathwaySearchBar";

export default function GraphPathwaySearch() {
  const router = useRouter();
  const [elements, setElements] = useState<ElementDefinition[]>([]);
  const [tree, setTree] = useState<PathwayNode>();
  const [selectedNodeId, setSelectedNodeId] = useState<string>();
  const [selectedNode, setSelectedNode] = useState<PathwayNode>();

  const reset = () => {
    setElements([]);
    setTree(undefined);
  };

  const getResults = () => {
    if (tree !== undefined) {
      const query = btoa(JSON.stringify(traverseTree(tree)));
      router.push(`/data/c2m2/graph/search/pathway/results?q=${query}`);
    }
  };

  const handleAddElements = useCallback((elements: ElementDefinition[]) => {
    setElements(
      produce((draft) => {
        draft.push(...elements);
      })
    );
  }, []);

  const handleAddNodeChild = useCallback(
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

  // TODO: Should consolidate these updates, need to make sure we're not repeating code more than necessary
  const handleAddOrUpdateNodeFilter = useCallback(
    (nodeId: string, label: string, value: string) => {
      setTree(
        produce((draft) => {
          if (draft !== undefined) {
            const node = findNode(nodeId, draft);
            if (node !== undefined) {
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
                  [
                    SUBJECT_SEX_LABEL,
                    {
                      id: v4(),
                      type: ASSOCIATED_WITH_TYPE,
                      direction: Direction.OUTGOING,
                    },
                  ],
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
                      type: ASSOCIATED_WITH_TYPE,
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
                    ASSAY_TYPE_LABEL,
                    {
                      id: v4(),
                      type: GENERATED_BY_ASSAY_TYPE_TYPE,
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
                    DCC_LABEL,
                    {
                      id: v4(),
                      type: CONTAINS_TYPE,
                      direction: Direction.INCOMING,
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
    setElements([
      // TODO: Should probably have a constant for this style class, and the other classes for that matter
      createCytoscapeNode(cvTerm, ["path-element"]),
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

      handleAddNodeChild(nodeParentId, {
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
      // TODO: Use an immer handler here instead?
      setElements([...pathNodes, ...nodes, ...pathEdges, ...edges]);
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
      handleAddNodeChild(nodeParentId, {
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

  const customTools: CustomToolbarFnFactory[] = [
    () => {
      return (
        <Fragment key="pathway-search-chart-toolbar-reset-search">
          <Tooltip title="Start Over" arrow>
            <IconButton aria-label="start-over" onClick={reset}>
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </Fragment>
      );
    },
    () => createVerticalDividerElement("pathway-search-reset-toolbar-divider"),
    () => {
      return (
        <Fragment key="pathway-search-chart-toolbar-find-results">
          <Tooltip title="Find Results" arrow>
            <span>
              <IconButton
                aria-label="find-results"
                onClick={getResults}
                disabled={tree === undefined}
              >
                <PublishIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Fragment>
      );
    },
  ];

  const customEventHandlers: CytoscapeEvent[] = [
    {
      event: "tap",
      target: "node",
      callback: (event: EventObjectNode) => {
        // TODO: Should probably have a constant for this style class, and the other classes for that matter
        if (!event.target.hasClass("path-element")) {
          addNodeToPathV1(event.target, event.cy);
          // addNodeToPathV2(event.target, event.cy);
        }
        setSelectedNodeId(event.target.id());
      },
    },
    {
      event: "unselect",
      callback: (event) => {
        // TODO: A little bit hacky...but it does make sure that selectedNodeId is reset. Look into setting "unselectify" on the chart, that
        // way we can have precise control over selections
        setSelectedNodeId(undefined);
      },
    },
    {
      event: "tap",
      target: "edge",
      callback: (event: EventObjectEdge) => {
        const targetNode = event.target.source().hasClass("path-element")
          ? event.target.target()
          : event.target.source();

        if (!targetNode.hasClass("path-element")) {
          addNodeToPathV1(targetNode, event.cy);
          // addNodeToPathV2(targetNode, event.cy);
        }
      },
    },
    {
      event: "mouseover",
      target: "node",
      callback: (event: EventObjectNode) => {
        // TODO: try prevent default, that might be a way to avoid unnecessary bindings
        event.target.connectedEdges().addClass("solid");
      },
    },
    {
      event: "mouseout",
      target: "node",
      callback: (event: EventObjectNode) => {
        event.target.connectedEdges().removeClass("solid");
      },
    },
    {
      event: "mouseover",
      target: "edge",
      callback: (event: EventObjectEdge) => {
        event.target.connectedNodes().addClass("solid");
      },
    },
    {
      event: "mouseout",
      target: "edge",
      callback: (event: EventObjectEdge) => {
        event.target.connectedNodes().removeClass("solid");
      },
    },
  ];

  useEffect(() => {
    if (selectedNodeId === undefined) {
      console.log("setSelectedNode");
      setSelectedNode(undefined);
    } else if (tree !== undefined) {
      console.log("setSelectedNode");
      console.log(findNode(selectedNodeId, tree));
      setSelectedNode(findNode(selectedNodeId, tree));
    }
  }, [selectedNodeId]);

  useEffect(() => {
    console.log(tree);
  }, [tree]);

  return (
    <>
      <Grid
        container
        spacing={1}
        xs={12}
        sx={{
          height: "640px",
        }}
      >
        <Grid item xs={12} sx={{ position: "relative", height: "inherit" }}>
          {tree === undefined ? (
            <SearchBarContainer>
              <PathwaySearchBar onSubmit={handleSubmit}></PathwaySearchBar>
            </SearchBarContainer>
          ) : null}
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
          <CytoscapeChart
            elements={elements}
            layout={DAGRE_LAYOUT}
            stylesheet={DAGRE_STYLESHEET}
            cxtMenuEnabled={false}
            tooltipEnabled={false}
            toolbarPosition={{ top: 10, right: 10 }}
            customTools={customTools}
            autoungrabify={true}
            customEventHandlers={customEventHandlers}
          ></CytoscapeChart>
        </Grid>
      </Grid>
    </>
  );
}
