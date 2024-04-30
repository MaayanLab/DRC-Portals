import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  SCHEMA_ELEMENTS,
  SCHEMA_LAYOUT,
  SCHEMA_STYLESHEET,
} from "../constants/cy";

import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";

export default function GraphSchemaContainer() {
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
        ></CytoscapeChart>
      </AccordionDetails>
    </Accordion>
  );
}
