import FitScreenIcon from "@mui/icons-material/FitScreen";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { IconButton, Paper, Tooltip } from "@mui/material";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/system";
import { v4 } from "uuid";

import { CustomToolbarFnFactory, CytoscapeReference } from "../../types/cy";

type ChartToolbarProps = {
  cyRef: CytoscapeReference;
  customTools?: CustomToolbarFnFactory[];
};

export default function ChartToolbar(cmpProps: ChartToolbarProps) {
  const cmpKey = `chart-toolbar-${v4()}`;
  const { cyRef, customTools } = cmpProps;

  const ToolbarIconBtn = styled(IconButton)({
    borderRadius: 1,
  });

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
        : [
            ...customTools.map((factoryFn) => factoryFn(cyRef)),
            <Divider
              key={`${cmpKey}-custom-divider`}
              orientation="vertical"
              variant="middle"
              flexItem
            />,
          ]}
      <Tooltip title="Zoom In" arrow>
        <ToolbarIconBtn aria-label="zoom-in" onClick={handleZoomIn}>
          <ZoomInIcon />
        </ToolbarIconBtn>
      </Tooltip>
      <Tooltip title="Zoom Out" arrow>
        <ToolbarIconBtn aria-label="zoom-in" onClick={handleZoomOut}>
          <ZoomOutIcon />
        </ToolbarIconBtn>
      </Tooltip>
      <Divider orientation="vertical" variant="middle" flexItem />
      <Tooltip title="Fit Graph" arrow>
        <ToolbarIconBtn aria-label="zoom-in" onClick={handleFit}>
          <FitScreenIcon />
        </ToolbarIconBtn>
      </Tooltip>
    </Paper>
  );
}
