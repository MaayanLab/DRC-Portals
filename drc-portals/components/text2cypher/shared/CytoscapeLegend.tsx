"use client";

import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import cytoscape from "cytoscape";
import { useMemo, useState } from "react";

import { buildLegendFromElements } from "@/lib/text2cypher/cytoscape/element-aggregation";

interface CytoscapeLegendProps {
  elements: cytoscape.ElementDefinition[];
}
const EDGE_ICON_COLOR = "#797979";

export default function CytoscapeLegend({ elements }: CytoscapeLegendProps) {
  const [expanded, setExpanded] = useState(true);

  const { nodeItems, hasEdges } = useMemo(() => {
    const { nodeItems: aggregatedNodeItems, hasEdges: aggregatedHasEdges } =
      buildLegendFromElements(elements);

    return {
      nodeItems: aggregatedNodeItems,
      hasEdges: aggregatedHasEdges,
    };
  }, [elements]);

  if (nodeItems.length === 0 && !hasEdges) {
    return null;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        px: 1,
        py: 0.5,
        bgcolor: "background.paper",
        width: "fit-content",
        maxWidth: { xs: 220, sm: 280 },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between" }}
        spacing={1}
      >
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Legend
        </Typography>
        <IconButton
          size="small"
          onClick={() => setExpanded((prev) => !prev)}
          aria-label={expanded ? "Collapse legend" : "Expand legend"}
        >
          {expanded ? (
            <ExpandMoreIcon fontSize="inherit" />
          ) : (
            <ExpandLessIcon fontSize="inherit" />
          )}
        </IconButton>
      </Stack>
      <Collapse in={expanded} timeout={150}>
        <Divider sx={{ my: 0.5 }} />
        <Box sx={{ maxHeight: 150, overflowY: "auto", pr: 0.5 }}>
          <Stack spacing={0.75}>
            {nodeItems.map((item) => (
              <Stack
                key={item.label}
                direction="row"
                spacing={0.75}
                sx={{ alignItems: "center", minWidth: 0 }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: item.color,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary" }}
                  noWrap
                  title={item.label}
                >
                  {item.label}
                </Typography>
              </Stack>
            ))}
            {hasEdges ? (
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ alignItems: "center" }}
              >
                <ArrowRightAltIcon
                  sx={{ color: EDGE_ICON_COLOR, fontSize: 14 }}
                />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Relationships
                </Typography>
              </Stack>
            ) : null}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}
