"use client";

import { Grid } from "@mui/material";
import { EventObject, EventObjectEdge, EventObjectNode } from "cytoscape";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  SCHEMA_ELEMENTS,
  SCHEMA_LAYOUT,
  SCHEMA_STYLESHEET,
} from "../constants/cy";
import {
  CxtMenuItem,
  EdgeCxtMenuItem,
  NodeCxtMenuItem,
  CytoscapeNodeData,
} from "../interfaces/cy";
import { SchemaData } from "../types/schema";
import { convertPathToSearchValue, isPathEligible } from "../utils/schema";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";
import GraphEntityDetails from "./GraphEntityDetails";

export default function GraphSchema() {
  const router = useRouter();
  const [path, setPath] = useState<SchemaData[]>([]);
  const [entityDetails, setEntityDetails] = useState<
    CytoscapeNodeData | undefined
  >(undefined);
  const pathRef = useRef(path);

  useEffect(() => {
    pathRef.current = path;
  }, [path]);

  const updateQuery = (state: string) => {
    const query = btoa(state);
    router.push(`search?q=${query}`);
  };

  const searchPath = () => {
    if (pathRef.current.length > 0) {
      updateQuery(
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
          tooltipContentProps={{ noWrap: false }}
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