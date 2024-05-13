import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
} from "../interfaces/cy";
import { SchemaData } from "../interfaces/schema";
import { resetChart } from "../utils/cy";
import { convertPathToSearchValue, isPathEligible } from "../utils/schema";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";

type GraphSchemaContainerProps = {
  onPathSearch: (state: string) => void;
};

export default function GraphSchemaContainer(
  cmpProps: GraphSchemaContainerProps
) {
  const { onPathSearch } = cmpProps;
  const [path, setPath] = useState<SchemaData[]>([]);
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
    <Grid item xs={12}>
      <Accordion>
        <AccordionSummary
          sx={{ height: "inherit" }}
          expandIcon={<ExpandMoreIcon color="secondary" />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography color="secondary">
            View Interactive Graph Schema
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            height: "640px",
            position: "relative",
          }}
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
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
}
