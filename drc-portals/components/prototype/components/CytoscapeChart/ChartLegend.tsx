import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ReactNode } from "react";

interface ChartLegendProps {
  legend: Map<string, ReactNode>;
}

export default function ChartLegend(cmpProps: ChartLegendProps) {
  const { legend } = cmpProps;

  return (
    <Accordion disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon color="secondary" />}>
        <Typography variant="h6">Legend</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {legend.size > 0 ? (
          <Stack>
            {Array.from(legend.entries()).map(([key, el]) => (
              <Box
                key={`legend-${key}`}
                display="flex"
                sx={{ m: 1, alignItems: "center" }}
              >
                <Typography sx={{ marginRight: 1 }}>{key}</Typography>
                {el}
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography>No details to show!</Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
