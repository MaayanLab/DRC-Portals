import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RestoreIcon from "@mui/icons-material/Restore";
import { Position } from "cytoscape";

import {
  SCHEMA_ELEMENTS,
  SCHEMA_LAYOUT,
  SCHEMA_NODES,
  SCHEMA_STYLESHEET,
} from "../constants/cy";
import { CytoscapeReference } from "../interfaces/cy";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";

export default function GraphSchemaContainer() {
  // TODO: Custom context menu options:
  //  - Prepend to Path: prepends a node or relationship to the path array
  //  - Append to Path: appends a node or relationship to the path array
  //  - Search Path

  const INITIAL_NODE_POSITIONS = new Map<string, Position>(
    SCHEMA_NODES.map((el) => [
      el.data.id,
      { x: el.position.x, y: el.position.y },
    ])
  );

  const resetChart = (cyRef: CytoscapeReference) => {
    const fn = () => {
      const cy = cyRef.current;
      if (cy !== undefined) {
        cy.batch(() => {
          // Reset node positions
          cy.nodes().forEach((el) => {
            el.position(INITIAL_NODE_POSITIONS.get(el.id()) as Position);
          });

          // Reset styles
          cy.elements().removeClass("highlight dimmed");
        });
      }
    };
    return (
      <Tooltip key="schema-chart-toolbar-reset-btn" title="Reset Chart" arrow>
        <IconButton
          sx={{ borderRadius: 1 }}
          aria-label="reset-chart"
          onClick={fn}
        >
          <RestoreIcon />
        </IconButton>
      </Tooltip>
    );
  };

  const customTools = [resetChart];

  return (
    <Accordion>
      <AccordionSummary
        sx={{ height: "inherit" }}
        expandIcon={<ExpandMoreIcon color="secondary" />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography color="secondary">View Interactive Graph Schema</Typography>
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
        ></CytoscapeChart>
      </AccordionDetails>
    </Accordion>
  );
}
