import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { createArrowDividerElement } from "../../utils/shared";
import {
  ADMIN_NODE_COLOR,
  BIOSAMPLE_RELATED_NODE_COLOR,
  CONTAINER_NODE_COLOR,
  CORE_NODE_COLOR,
  FILE_RELATED_NODE_COLOR,
  SUBJECT_RELATED_NODE_COLOR,
  TERM_NODE_COLOR,
} from "../../constants/shared";

export default function ChartLegend() {
  const legend = new Map<string, JSX.Element>(
    new Map([
      [
        "Admin Node",
        <CircleIcon sx={{ color: ADMIN_NODE_COLOR }} fontSize="small" />,
      ],
      [
        "Container Node",
        <CircleIcon sx={{ color: CONTAINER_NODE_COLOR }} fontSize="small" />,
      ],
      [
        "Core Node",
        <CircleIcon sx={{ color: CORE_NODE_COLOR }} fontSize="small" />,
      ],
      [
        "Term Node",
        <CircleIcon sx={{ color: TERM_NODE_COLOR }} fontSize="small" />,
      ],
      [
        "File Related Node",
        <CircleIcon sx={{ color: FILE_RELATED_NODE_COLOR }} fontSize="small" />,
      ],
      [
        "Subject Related Node",
        <CircleIcon
          sx={{ color: SUBJECT_RELATED_NODE_COLOR }}
          fontSize="small"
        />,
      ],
      [
        "Biosample Related Node",
        <CircleIcon
          sx={{ color: BIOSAMPLE_RELATED_NODE_COLOR }}
          fontSize="small"
        />,
      ],
      ["Relationship", createArrowDividerElement(false)],
    ])
  );

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon color="secondary" />}>
        <Typography variant="h6">Legend</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack>
          {Array.from(legend.entries()).map(([key, el]) => (
            <Box display="flex" sx={{ m: 1, alignItems: "center" }}>
              <Typography sx={{ marginRight: 1 }}>{key}</Typography>
              {el}
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
