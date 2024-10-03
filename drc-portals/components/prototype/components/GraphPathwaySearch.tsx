"use client";

import { Grid } from "@mui/material";

import cytoscape, {
  ElementDefinition,
  EventObjectEdge,
  EventObjectNode,
  NodeSingular,
} from "cytoscape";
import { useRef, useState } from "react";
import { v4 } from "uuid";

import {
  PATHWAY_INCOMING_CONNECTIONS,
  PATHWAY_OUTGOING_CONNECTIONS,
} from "@/lib/neo4j/constants";
import { NodeResult } from "@/lib/neo4j/types";

import { DAGRE_LAYOUT, DAGRE_STYLESHEET } from "../constants/cy";
import { SearchBarContainer } from "../constants/search-bar";
import {
  CytoscapeEdge,
  CytoscapeEvent,
  CytoscapeNode,
  CytoscapeNodeData,
} from "../interfaces/cy";
import { createCytoscapeEdge, createCytoscapeNode } from "../utils/cy";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";
import PathwaySearchBar from "./SearchBar/PathwaySearchBar";

export default function GraphPathwaySearch() {
  // TODO: Use immer for better immutable state management?
  const [elements, setElements] = useState<ElementDefinition[]>([]);
  const pathRef = useRef<string[]>([]); // May want to useState here instead for loading/unloading the search bar, filters, etc.

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
    const path = pathRef.current;
    if (path !== undefined) {
      path.push(cvTerm.uuid);
    }

    // TODO: It's worth noting we do not set a selected node upon initial load, but it's possible there is a reason to do it
    const { nodes, edges } = getConnectedElements(
      cvTerm.labels[0],
      cvTerm.uuid
    );
    setElements([
      createCytoscapeNode(cvTerm, ["path-element"]),
      ...nodes,
      ...edges,
    ]);
  };

  const addNodeToPathV1 = (node: NodeSingular, cy: cytoscape.Core) => {
    if (node.hasClass("path-element")) {
      // TODO: May want to enable some behavior when an element already in the path is selected, but for now, do nothing.
      return;
    }

    const path = pathRef.current;
    if (path !== undefined) {
      // Get selected node data, and get new data for its connected nodes and relationships
      const selectedNodeData: CytoscapeNodeData = node.data();
      const selectedNodeLabels = selectedNodeData.neo4j?.labels || [];
      const { nodes, edges } =
        selectedNodeLabels.length > 0
          ? getConnectedElements(selectedNodeLabels[0], selectedNodeData.id)
          : { nodes: [], edges: [] };
      const newElements: ElementDefinition[] = [...nodes, ...edges];

      // Then, add the selected node and the edge connecting it to the previous head of the path
      path.push(node.connectedEdges().first().id(), selectedNodeData.id);
      path.forEach((id) => {
        const element = cy.getElementById(id);
        if (element.isNode()) {
          newElements.unshift({
            classes: [...element.classes(), "path-element"],
            data: element.data(),
          });
        }

        // Typing is odd here for some reason, hence the extra `if` rather than an `else` or `else if`
        if (element.isEdge()) {
          // Edges must appear AFTER all nodes or Cytoscape will throw an error complaining about missing nodes
          newElements.push({
            classes: [...element.classes(), "path-element"],
            data: element.data(),
          });
        }
      });

      // Finally, update state
      setElements(newElements);
    }
  };

  const addNodeToPathV2 = (node: NodeSingular, cy: cytoscape.Core) => {
    if (node.hasClass("path-element")) {
      // TODO: May want to enable some behavior when an element already in the path is selected, but for now, do nothing.
      return;
    }

    const path = pathRef.current;
    if (path !== undefined) {
      // Get selected node data, and get new data for its connected nodes and relationships
      const selectedNodeData: CytoscapeNodeData = node.data();
      const selectedNodeLabels = selectedNodeData.neo4j?.labels || [];
      const { nodes, edges } =
        selectedNodeLabels.length > 0
          ? getConnectedElements(selectedNodeLabels[0], selectedNodeData.id)
          : { nodes: [], edges: [] };

      // Then, add the selected node and the edge connecting it to the previous head of the path
      path.push(node.connectedEdges().first().id(), selectedNodeData.id);
      path.forEach((id) => {
        cy.getElementById(id).addClass("path-element");
      });

      // Finally, update state
      setElements([
        ...nodes,
        ...cy.elements().map((element) => {
          return { classes: element.classes(), data: element.data() };
        }),
        ...edges,
      ]);
    }
  };

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
        if (pathRef.current !== undefined) {
          const path = pathRef.current;
          const sourceInPath = path.includes(event.target.source().data("id"));
          const targetNode = sourceInPath
            ? event.target.target()
            : event.target.source();

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
          {/* TODO: This needs to disappear after the initial load, which I suppose could be achieved by looking at the path length */}
          <SearchBarContainer>
            <PathwaySearchBar onSubmit={handleSubmit}></PathwaySearchBar>
          </SearchBarContainer>
          <CytoscapeChart
            elements={elements}
            layout={DAGRE_LAYOUT}
            stylesheet={DAGRE_STYLESHEET}
            cxtMenuEnabled={false}
            tooltipEnabled={false}
            toolbarPosition={{ top: 10, right: 10 }}
            autoungrabify={true}
            customEventHandlers={customEventHandlers}
          ></CytoscapeChart>
        </Grid>
      </Grid>
    </>
  );
}
