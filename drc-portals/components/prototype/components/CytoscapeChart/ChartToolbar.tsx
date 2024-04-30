import FitScreenIcon from "@mui/icons-material/FitScreen";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { IconButton, Paper, Tooltip } from "@mui/material";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/system";
import * as React from "react";

const ToolbarIconBtn = styled(IconButton)({
  borderRadius: 1,
});

type ChartToolbarProps = {
  cy: cytoscape.Core | undefined;
};

export default function ChartToolbar(chartToolbarProps: ChartToolbarProps) {
  const { cy } = chartToolbarProps;

  const onZoomIn = () => {
    if (cy !== undefined) {
      const currentZoom = cy.zoom();
      cy.zoom(currentZoom + currentZoom / (currentZoom + 1));
    }
  };

  const onZoomOut = () => {
    if (cy !== undefined) {
      const currentZoom = cy.zoom();
      cy.zoom(currentZoom - currentZoom / (currentZoom + 1));
    }
  };

  const onFit = () => {
    if (cy !== undefined) {
      cy.fit();
    }
  };

  return (
    <Paper
      sx={{
        display: "flex",
        alignItems: "center",
        color: "text.secondary",
        "& svg": {
          borderRadius: 1,
        },
      }}
    >
      <Tooltip title="Zoom In" arrow>
        <ToolbarIconBtn aria-label="zoom-in" onClick={onZoomIn}>
          <ZoomInIcon />
        </ToolbarIconBtn>
      </Tooltip>
      <Tooltip title="Zoom Out" arrow>
        <ToolbarIconBtn aria-label="zoom-in" onClick={onZoomOut}>
          <ZoomOutIcon />
        </ToolbarIconBtn>
      </Tooltip>
      <Divider orientation="vertical" variant="middle" flexItem />
      <Tooltip title="Fit Graph" arrow>
        <ToolbarIconBtn aria-label="zoom-in" onClick={onFit}>
          <FitScreenIcon />
        </ToolbarIconBtn>
      </Tooltip>
    </Paper>
  );
}
