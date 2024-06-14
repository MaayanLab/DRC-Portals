import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { IconButton, Menu, MenuItem, Paper, Tooltip } from "@mui/material";
import Divider from "@mui/material/Divider";
import { MouseEvent, useState } from "react";
import { v4 } from "uuid";

import { CustomToolbarFnFactory, CytoscapeReference } from "../../types/cy";

type ChartToolbarProps = {
  cyRef: CytoscapeReference;
  customTools?: CustomToolbarFnFactory[];
};

export default function ChartToolbar(cmpProps: ChartToolbarProps) {
  const cmpKey = `chart-toolbar-${v4()}`;
  const { cyRef, customTools } = cmpProps;

  const [downloadMenuAnchorEl, setDownloadMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const downloadMenuOpen = Boolean(downloadMenuAnchorEl);
  const handleDownloadBtnClick = (event: MouseEvent<HTMLButtonElement>) => {
    setDownloadMenuAnchorEl(event.currentTarget);
  };
  const handleDownloadMenuClose = () => {
    setDownloadMenuAnchorEl(null);
  };

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

  const handleDownloadJSON = () => {
    const cy = cyRef.current;
    if (cy !== undefined) {
      const data = {
        nodes: cy.nodes().map((n) => n.data()),
        edges: cy.edges().map((e) => e.data()),
      };
      const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
        JSON.stringify(data)
      )}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = "c2m2-graph-data.json";

      link.click();
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
      <Tooltip title="Download Data" arrow>
        <IconButton
          id={`${cmpKey}-download-data-btn`}
          aria-controls={
            downloadMenuOpen ? `${cmpKey}-download-data-menu` : undefined
          }
          aria-haspopup="true"
          aria-expanded={downloadMenuOpen ? "true" : undefined}
          aria-label="download-data"
          onClick={handleDownloadBtnClick}
        >
          <FileDownloadIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id={`${cmpKey}-download-data-menu`}
        anchorEl={downloadMenuAnchorEl}
        open={downloadMenuOpen}
        onClose={handleDownloadMenuClose}
        elevation={2}
        MenuListProps={{
          "aria-labelledby": `${cmpKey}-download-data-btn`,
        }}
      >
        <MenuItem onClick={handleDownloadJSON}>JSON</MenuItem>
      </Menu>
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
  );
}
