import FitScreenIcon from "@mui/icons-material/FitScreen";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { Box, IconButton, Paper, Tooltip } from "@mui/material";
import Divider from "@mui/material/Divider";
import { LayoutOptions } from "cytoscape";
import { useState } from "react";

import { CustomToolbarFnFactory, CytoscapeReference } from "../../types/cy";

type ChartToolbarProps = {
  cyRef: CytoscapeReference;
  customTools?: CustomToolbarFnFactory[];
  layout?: LayoutOptions;
};

export default function ChartToolbar(cmpProps: ChartToolbarProps) {
  const { cyRef, customTools, layout } = cmpProps;
  const [hidden, setHidden] = useState(false);
  const [showHideTooltip, setShowHideTooltip] = useState(false);

  // TODO: Note that the current implementation is tightly coupled to Cytoscape. An alternative implementation would have the toolbar
  // simply notify the parent element that one of the options was chosen, and then the parent can decide what to do then.

  const handleZoomIn = () => {
    const cy = cyRef.current;
    if (cy !== undefined) {
      const currentZoom = cy.zoom();
      cy.zoom(currentZoom + currentZoom / (currentZoom + 1));
    }
  };

  const handleZoomOut = () => {
    const cy = cyRef.current;
    if (cy !== undefined) {
      const currentZoom = cy.zoom();
      cy.zoom(currentZoom - currentZoom / (currentZoom + 1));
    }
  };

  const handleFit = () => {
    const cy = cyRef.current;
    if (cy !== undefined) {
      cy.fit();
    }
  };

  const handleHideTooltipBtnClicked = () => {
    setHidden(!hidden);
    setShowHideTooltip(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Tooltip
        open={showHideTooltip}
        title={hidden ? "Show Toolbar" : "Hide Toolbar"}
        disableHoverListener
        onMouseEnter={() => setShowHideTooltip(true)}
        onMouseLeave={() => setShowHideTooltip(false)}
        TransitionProps={{ exit: false }}
        arrow
      >
        <IconButton onClick={handleHideTooltipBtnClicked}>
          {hidden ? (
            <KeyboardDoubleArrowLeftIcon />
          ) : (
            <KeyboardDoubleArrowRightIcon />
          )}
        </IconButton>
      </Tooltip>
      {hidden ? null : (
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
          {customTools === undefined
            ? null
            : [...customTools.map((factoryFn) => factoryFn(cyRef, layout))]}
          <Divider orientation="vertical" variant="middle" flexItem />
          <Tooltip title="Zoom In" arrow>
            <IconButton aria-label="zoom-in" onClick={handleZoomIn}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out" arrow>
            <IconButton aria-label="zoom-out" onClick={handleZoomOut}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fit Graph" arrow>
            <IconButton aria-label="fit-graph" onClick={handleFit}>
              <FitScreenIcon />
            </IconButton>
          </Tooltip>
        </Paper>
      )}
    </Box>
  );
}
