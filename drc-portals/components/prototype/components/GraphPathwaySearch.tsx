"use client";

import { Grid } from "@mui/material";

import { ElementDefinition, EventObjectEdge, EventObjectNode } from "cytoscape";
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
  const [elements, setElements] = useState<ElementDefinition[]>([]);

  // TODO: Would be very interesting to implement this as a tree rather than an array...could enable branching queries. Basically, we could
  // break the tree down into a single MATCH per path down the tree from the root to each leaf, then union the results of the distinct
  // nodes and relationships found. Could be a very powerful way to create complicated queries, though it would need benchmarking. Would
  // probably need to run the queries in parallel or the request would be too slow, but running too many at the same time could be a
  // problem if we have many users accessing the db at once...
  // - How would we encapsulate edge data in the tree? Non-root nodes in the tree have an edge/direction property?
  const pathRef = useRef<string[]>([]); // May want to useState here instead for loading/unloading the search bar, filters, etc.

  const getConnectedElements = (
    label: string,
    id: string
  ): { nodes: CytoscapeNode[]; edges: CytoscapeEdge[] } => {
    const nodes: CytoscapeNode[] = [];
    const edges: CytoscapeEdge[] = [];

    // TODO: Create a subset of outgoing/incoming connections with only the choices we care about for this view
    // - I.e., remove file-related nodes, biosample related nodes, etc.
    // - I.e. i.e., term nodes can be sources, but they cannot be targets
    // - Admin nodes are neither sources nor targets
    // - Also, the core/container nodes have their own subset of connections because their term relationships are instead expressed as filters...complicated!

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

  const addNodeToPathFromEventV1 = (event: EventObjectNode) => {
    if (event.target.hasClass("path-element")) {
      // TODO: May want to enable some behavior when an element already in the path is selected, but for now, do nothing.
      return;
    }

    const path = pathRef.current;
    if (path !== undefined) {
      // Get selected node data, and get new data for its connected nodes and relationships
      const selectedNode: CytoscapeNodeData = event.target.data();
      const selectedNodeLabels = selectedNode.neo4j?.labels || [];
      const { nodes, edges } =
        selectedNodeLabels.length > 0
          ? getConnectedElements(selectedNodeLabels[0], selectedNode.id)
          : { nodes: [], edges: [] };
      const newElements: ElementDefinition[] = [...nodes, ...edges];

      // Then, add the selected node and the edge connecting it to the previous head of the path
      path.push(
        // Note that this *should* be a single value array, TODO: enforce that this is a singular edge?
        ...event.target.connectedEdges().map((edge) => edge.data("id"))
      );
      path.push(selectedNode.id);
      path.forEach((id) => {
        const element = event.cy.getElementById(id);
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

  const addNodeToPathFromEventV2 = (event: EventObjectNode) => {
    if (event.target.hasClass("path-element")) {
      // TODO: May want to enable some behavior when an element already in the path is selected, but for now, do nothing.
      return;
    }

    const path = pathRef.current;
    if (path !== undefined) {
      // Get selected node data, and get new data for its connected nodes and relationships
      const selectedNode: CytoscapeNodeData = event.target.data();
      const selectedNodeLabels = selectedNode.neo4j?.labels || [];
      const { nodes, edges } =
        selectedNodeLabels.length > 0
          ? getConnectedElements(selectedNodeLabels[0], selectedNode.id)
          : { nodes: [], edges: [] };

      // Then, add the selected node and the edge connecting it to the previous head of the path
      path.push(event.target.connectedEdges().first().id());
      path.push(selectedNode.id);
      path.forEach((id) => {
        event.cy.getElementById(id).addClass("path-element");
      });

      // Finally, update state
      setElements([
        ...nodes,
        ...event.cy.elements().map((element) => {
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
        addNodeToPathFromEventV1(event);
        // addNodeToPathFromEventV2(event);
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
