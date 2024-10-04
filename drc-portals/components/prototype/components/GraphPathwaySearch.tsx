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
import { Fragment, useCallback, useState } from "react";
import { v4 } from "uuid";

import {
  PATHWAY_INCOMING_CONNECTIONS,
  PATHWAY_OUTGOING_CONNECTIONS,
} from "@/lib/neo4j/constants";
import { Direction } from "@/lib/neo4j/enums";
import { NodeResult, PathwayNode } from "@/lib/neo4j/types";

import { DAGRE_LAYOUT, DAGRE_STYLESHEET } from "../constants/cy";
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

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";
import PathwaySearchBar from "./SearchBar/PathwaySearchBar";
import { createVerticalDividerElement } from "../utils/shared";

export default function GraphPathwaySearch() {
  const router = useRouter();
  const [elements, setElements] = useState<ElementDefinition[]>([]);
  const [tree, setTree] = useState<PathwayNode>();

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

  // TODO: Just pass an entire PathwayNode object here?
  const handleUpdateTreeNodeProp = useCallback(
    (nodeId: string, update: Partial<PathwayNode>) => {
      setTree(
        produce((draft) => {
          if (draft !== undefined) {
            let node = findNode(nodeId, draft);
            if (node !== undefined) {
              node = { ...node, ...update };
            }
          }
        })
      );
    },
    []
  );

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
    // TODO: Should probably have a constant for this style class, and the other classes for that matter
    if (node.hasClass("path-element")) {
      // TODO: May want to enable some behavior when an element already in the path is selected, but for now, do nothing.
      return;
    }

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
    // TODO: Should probably have a constant for this style class, and the other classes for that matter
    if (node.hasClass("path-element")) {
      // TODO: May want to enable some behavior when an element already in the path is selected, but for now, do nothing.
      return;
    }

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
        addNodeToPathV1(event.target, event.cy);
        // addNodeToPathV2(event.target, event.cy);
      },
    },
    {
      event: "tap",
      target: "edge",
      callback: (event: EventObjectEdge) => {
        const targetNode = event.target.source().hasClass("path-element")
          ? event.target.target()
          : event.target.source();
        addNodeToPathV1(targetNode, event.cy);
        // addNodeToPathV2(targetNode, event.cy);
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
