import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
  styled,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  SCHEMA_ELEMENTS,
  SCHEMA_LAYOUT,
  SCHEMA_STYLESHEET,
} from "../constants/cy";

import ChartLegend from "./CytoscapeChart/ChartLegend";
import CytoscapeChart from "./CytoscapeChart/CytoscapeChart";

const LegendContainer = styled(Box)({
  flexGrow: 1,
  position: "absolute",
  top: 10,
  left: 10,
  zIndex: 1,
  padding: "inherit",
});

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
        <LegendContainer>
          <ChartLegend></ChartLegend>
        </LegendContainer>
        <CytoscapeChart
          elements={SCHEMA_ELEMENTS}
          layout={SCHEMA_LAYOUT}
          stylesheet={SCHEMA_STYLESHEET}
        ></CytoscapeChart>
      </AccordionDetails>
    </Accordion>
  );
}
