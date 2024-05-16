"use client";

import { Grid } from "@mui/material";
import { EventObject, EventObjectEdge, EventObjectNode } from "cytoscape";
import { useEffect, useRef, useState } from "react";

import {
  SCHEMA_ELEMENTS,
  SCHEMA_LAYOUT,
  INITIAL_NODE_POSITIONS,
  SCHEMA_STYLESHEET,
} from "../constants/cy";
import {
  CxtMenuItem,
  EdgeCxtMenuItem,
  NodeCxtMenuItem,
  CytoscapeReference,
  CytoscapeNodeData,
} from "../interfaces/cy";
import { SchemaData } from "../interfaces/schema";
import { resetChart } from "../utils/cy";
import { convertPathToSearchValue, isPathEligible } from "../utils/schema";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";
import GraphEntityDetails from "./GraphEntityDetails";

type GraphSchemaContainerProps = {
  onPathSearch: (state: string) => void;
};

export default function GraphSchema(cmpProps: GraphSchemaContainerProps) {
  const { onPathSearch } = cmpProps;
  const [path, setPath] = useState<SchemaData[]>([]);
  const [entityDetails, setEntityDetails] = useState<
    CytoscapeNodeData | undefined
  >(undefined);
  const pathRef = useRef(path);
  const customTools = [
    // Reset Chart button
    (cyRef: CytoscapeReference) =>
      resetChart(
        "schema-chart-toolbar-reset-btn",
        "Reset Chart",
        INITIAL_NODE_POSITIONS,
        cyRef
      ),
  ];

  useEffect(() => {
    pathRef.current = path;
  }, [path]);

  const searchPath = () => {
    if (pathRef.current.length > 0) {
      onPathSearch(
        JSON.stringify({ value: convertPathToSearchValue(pathRef.current) })
      );
    }
  };

  const resetPath = (event: EventObject) => {
    setPath([]);
    event.cy.elements().removeClass("path-element");
  };

  const appendNodeToPath = (event: EventObjectNode) => {
    setPath((prevPath) => {
      const data = event.target.data();
      const pathCopy = [...prevPath];

      event.cy.batch(() => {
        event.cy.elements().removeClass("path-eligible");
        event.target.addClass("path-element");
        event.target.connectedEdges().addClass("path-eligible");
      });
      pathCopy.push({ id: data.id, label: data.label });
      return pathCopy;
    });
  };

  const appendEdgeToPath = (event: EventObjectEdge) => {
    setPath((prevPath) => {
      const data = event.target.data();
      const pathCopy = [...prevPath];

      event.cy.batch(() => {
        event.cy.elements().removeClass("path-eligible");
        event.target.addClass("path-element");
        event.target.connectedNodes().addClass("path-eligible");
      });
      pathCopy.push({
        id: data.id,
        label: data.label,
        source: data.source,
        target: data.target,
      });
      return pathCopy;
    });
  };

  const staticCxtMenuItems: CxtMenuItem[] = [
    {
      fn: searchPath,
      title: "Search Path",
      showFn: () => pathRef.current.length > 0,
    },
    {
      fn: resetPath,
      title: "Reset Path",
      showFn: () => pathRef.current.length > 0,
    },
  ];
  const nodeCxtMenuItems: NodeCxtMenuItem[] = [
    {
      fn: (event: EventObjectNode) => setEntityDetails(event.target.data()),
      title: "Show Details",
    },
    {
      fn: appendNodeToPath,
      title: "Add to Path",
      showFn: (event) => pathRef.current.length === 0 || isPathEligible(event),
    },
  ];
  const edgeCxtMenuItems: EdgeCxtMenuItem[] = [
    {
      fn: appendEdgeToPath,
      title: "Add to Path",
      showFn: (event) => pathRef.current.length === 0 || isPathEligible(event),
    },
  ];

  return (
    <Grid
      container
      item
      spacing={1}
      xs={12}
      sx={{
        height: "640px",
      }}
    >
      <Grid
        item
        xs={12}
        lg={entityDetails === undefined ? 12 : 9}
        sx={{ position: "relative", height: "inherit" }}
      >
        <CytoscapeChart
          elements={SCHEMA_ELEMENTS}
          layout={SCHEMA_LAYOUT}
          stylesheet={SCHEMA_STYLESHEET}
          legendPosition={{ top: 10, left: 10 }}
          toolbarPosition={{ top: 10, right: 10 }}
          customTools={customTools}
          staticCxtMenuItems={staticCxtMenuItems}
          nodeCxtMenuItems={nodeCxtMenuItems}
          edgeCxtMenuItems={edgeCxtMenuItems}
        ></CytoscapeChart>
      </Grid>
      {entityDetails !== undefined ? (
        <GraphEntityDetails
          entityDetails={entityDetails}
          onCloseDetails={() => setEntityDetails(undefined)}
        />
      ) : null}
    </Grid>
  );
}
