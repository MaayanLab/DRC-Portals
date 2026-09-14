"use client";

import { RefObject, useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import IconButton from "@mui/material/IconButton";
import type { SxProps, Theme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import DownloadIcon from "@mui/icons-material/Download";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import cytoscape from "cytoscape";

const ZOOM_STEP = 1.25;

interface CytoscapeToolbarProps {
  cyRef: RefObject<cytoscape.Core | undefined>;
  docked?: boolean;
  sx?: SxProps<Theme>;
}

export default function CytoscapeToolbar({
  cyRef,
  docked = false,
  sx,
}: CytoscapeToolbarProps) {
  const [expanded, setExpanded] = useState(true);

  const handleZoomIn = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) {
      return;
    }

    cy.zoom({
      level: cy.zoom() * ZOOM_STEP,
      renderedPosition: {
        x: cy.width() / 2,
        y: cy.height() / 2,
      },
    });
  }, [cyRef]);

  const handleZoomOut = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) {
      return;
    }

    cy.zoom({
      level: cy.zoom() / ZOOM_STEP,
      renderedPosition: {
        x: cy.width() / 2,
        y: cy.height() / 2,
      },
    });
  }, [cyRef]);

  const handleFitChart = useCallback(() => {
    cyRef.current?.fit();
  }, [cyRef]);

  const handleExportPng = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) {
      return;
    }

    const dataUrl = cy.png({
      full: true,
      scale: 2,
      bg: "#ffffff",
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "cytoscape-graph.png";
    link.click();
  }, [cyRef]);

  return (
    <Box
      sx={{
        position: docked ? "relative" : "absolute",
        bottom: docked ? "auto" : 8,
        right: docked ? "auto" : 8,
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        p: 0.5,
        ...sx,
      }}
    >
      <Tooltip
        title={expanded ? "Collapse toolbar" : "Expand toolbar"}
        placement="left"
      >
        <IconButton
          size="small"
          aria-label={expanded ? "Collapse toolbar" : "Expand toolbar"}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? (
            <ExpandMoreIcon fontSize="small" />
          ) : (
            <ExpandLessIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Divider flexItem sx={{ width: "100%", my: 0.25 }} />

          <Tooltip title="Zoom in" placement="left">
            <IconButton
              size="small"
              aria-label="Zoom in"
              onClick={handleZoomIn}
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Zoom out" placement="left">
            <IconButton
              size="small"
              aria-label="Zoom out"
              onClick={handleZoomOut}
            >
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Fit chart" placement="left">
            <IconButton
              size="small"
              aria-label="Fit chart"
              onClick={handleFitChart}
            >
              <CenterFocusStrongIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider flexItem sx={{ width: "100%", my: 0.25 }} />

          <Tooltip title="Export PNG" placement="left">
            <IconButton
              size="small"
              aria-label="Export PNG"
              onClick={handleExportPng}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Collapse>
    </Box>
  );
}
