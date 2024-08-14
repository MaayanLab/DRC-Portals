import FitScreenIcon from "@mui/icons-material/FitScreen";
import Rotate90DegreesCwIcon from "@mui/icons-material/Rotate90DegreesCw";
import Rotate90DegreesCcwIcon from "@mui/icons-material/Rotate90DegreesCcw";
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

  const handleRotate = (angle: number) => {
    const cy = cyRef.current;
    if (cy !== undefined && layout !== undefined) {
      const center = { x: cy.width() / 2, y: cy.height() / 2 };
      const rad = angle * (Math.PI / 180); // Convert angle to radians

      cy.batch(() => {
        cy.nodes().forEach((node) => {
          const pos = node.position();
          const x = pos.x - center.x;
          const y = pos.y - center.y;
          const newX = x * Math.cos(rad) - y * Math.sin(rad) + center.x;
          const newY = x * Math.sin(rad) + y * Math.cos(rad) + center.y;

          node.position({ x: newX, y: newY });
          lockD3ForceNode(node);
        });
      });
      cy.layout(layout).run();
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

      <Tooltip title="Rotate Clockwise" arrow>
        <IconButton aria-label="rotate-cw" onClick={() => handleRotate(90)}>
          <Rotate90DegreesCwIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Rotate Counter Clockwise" arrow>
        <IconButton aria-label="rotate-ccw" onClick={() => handleRotate(-90)}>
          <Rotate90DegreesCcwIcon />
        </IconButton>
      </Tooltip>
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
