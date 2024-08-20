import FitScreenIcon from "@mui/icons-material/FitScreen";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { IconButton, Paper, Tooltip } from "@mui/material";
import Divider from "@mui/material/Divider";
import { LayoutOptions } from "cytoscape";

import { CustomToolbarFnFactory, CytoscapeReference } from "../../types/cy";
import { lockD3ForceNode } from "../../utils/cy";

type ChartToolbarProps = {
  cyRef: CytoscapeReference;
  customTools?: CustomToolbarFnFactory[];
  layout?: LayoutOptions;
};

export default function ChartToolbar(cmpProps: ChartToolbarProps) {
  const { cyRef, customTools, layout } = cmpProps;

  // TODO: Note that the current implementation is tightly coupled to Cytoscape. An alternative implementation would have the toolbar
  // simply notify the parent element that one of the options was chosen, and then the parent can decide what to do then.

  const handleZoom = (zoomOut: boolean) => {
    const cy = cyRef.current;
    if (cy !== undefined) {
      let currentZoom = cy.zoom();
      const zoomModifier =
        (currentZoom / (currentZoom + 1)) * (zoomOut ? -1 : 1);
      const center = { x: cy.width() / 2, y: cy.height() / 2 };

      cy.zoom({
        level: currentZoom + zoomModifier,
        renderedPosition: center,
      });
    }
  };

  const handleFit = () => {
    const cy = cyRef.current;
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
      {customTools === undefined
        ? null
        : [...customTools.map((factoryFn) => factoryFn(cyRef, layout))]}
      <Divider orientation="vertical" variant="middle" flexItem />
      <Tooltip title="Zoom In" arrow>
        <IconButton aria-label="zoom-in" onClick={() => handleZoom(false)}>
          <ZoomInIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Zoom Out" arrow>
        <IconButton aria-label="zoom-out" onClick={() => handleZoom(true)}>
          <ZoomOutIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Fit Graph" arrow>
        <IconButton aria-label="fit-graph" onClick={handleFit}>
          <FitScreenIcon />
        </IconButton>
      </Tooltip>
    </Paper>
  );
}
