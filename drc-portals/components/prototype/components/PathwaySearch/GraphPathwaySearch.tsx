"use client";

import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  CircularProgress,
  Fab,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";

import { Core, EventObject, EventObjectEdge, EventObjectNode } from "cytoscape";
import { ChangeEvent, Fragment, useCallback, useEffect, useState } from "react";

import { NodeResult } from "@/lib/neo4j/types";

import CytoscapeChart from "../CytoscapeChart/CytoscapeChart";
import PathwaySearchBar from "../SearchBar/PathwaySearchBar";
import { PATHWAY_SEARCH_STYLESHEET, EULER_LAYOUT } from "../../constants/cy";
import {
  NodeFiltersContainer,
  PathwayModeBtnContainer,
} from "../../constants/pathway-search";
import { SearchBarContainer } from "../../constants/search-bar";
import { VisuallyHiddenInput } from "../../constants/shared";
import { CytoscapeEvent } from "../../interfaces/cy";
import { PathwaySearchNode } from "../../interfaces/pathway-search";
import { CustomToolbarFnFactory } from "../../types/cy";
import { PathwaySearchElement } from "../../types/pathway-search";
import { isPathwaySearchEdgeElement } from "../../utils/pathway-search";

import PathwayNodeFilters from "./PathwayNodeFilters";

interface GraphPathwaySearchProps {
  elements: PathwaySearchElement[];
  loading: boolean;
  onSearchBarSubmit: (node: NodeResult) => void;
  onSearchBtnClick: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (files: ChangeEvent<HTMLInputElement>) => void;
  onSelectedNodeChange: (
    node: PathwaySearchNode | undefined,
    reason: string
  ) => void;
}

export default function GraphPathwaySearch(cmpProps: GraphPathwaySearchProps) {
  const {
    elements,
    loading,
    onReset,
    onExport,
    onImport,
    onSearchBarSubmit,
    onSearchBtnClick,
    onSelectedNodeChange,
  } = cmpProps;
  const [selectedNode, setSelectedNode] = useState<PathwaySearchNode>();

  const handleSelectedNodeChange = useCallback(
    (id: string | undefined, cy: Core) => {
      if (id === undefined) {
        setSelectedNode(undefined);
      } else {
        const node = cy.nodes().$id(id);
        const newSelectedNode = {
          classes: node.classes(),
          data: node.data(),
        };

        setSelectedNode(newSelectedNode);
        onSelectedNodeChange(newSelectedNode, "select");
      }
    },
    [onSelectedNodeChange]
  );

  const handleNodeFilterChange = useCallback(
    (value: string) => {
      if (selectedNode !== undefined) {
        const newSelectedNode: PathwaySearchNode = {
          classes: [...(selectedNode.classes || [])],
          data: {
            ...selectedNode.data,
            displayLabel: value || selectedNode.data.dbLabel,
          },
        };
        setSelectedNode(newSelectedNode);
        onSelectedNodeChange(newSelectedNode, "update");
      }
    },
    [selectedNode]
  );

  const customTools: CustomToolbarFnFactory[] = [
    () => {
      return (
        <Fragment key="pathway-search-chart-toolbar-reset-search">
          <Tooltip title="Start Over" arrow>
            <IconButton aria-label="start-over" onClick={onReset}>
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </Fragment>
      );
    },
    () => {
      return (
        <Fragment key="pathway-search-chart-toolbar-export-pathway">
          <Tooltip title="Export Pathway" arrow>
            <IconButton aria-label="export-pathway" onClick={onExport}>
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        </Fragment>
      );
    },
    () => {
      return (
        <Fragment key="pathway-search-chart-toolbar-import-pathway">
          <Tooltip title="Import Pathway" arrow>
            <IconButton aria-label="export-pathway" component="label">
              <FileUploadIcon />
              <VisuallyHiddenInput
                accept=".json,application/json"
                id="pathway-import-input"
                type="file"
                onClick={(event) => {
                  // Reset value on each click, this allows the user to submit the same file multiple times
                  const target = event.target as HTMLInputElement;
                  target.value = "";
                }}
                onChange={onImport}
              />
            </IconButton>
          </Tooltip>
        </Fragment>
      );
    },
  ];

  const customEventHandlers: CytoscapeEvent[] = [
    {
      event: "tap",
      callback: (event: EventObject) => {
        if (event.target === event.cy) {
          handleSelectedNodeChange(undefined, event.cy);
        }
      },
    },
    {
      event: "tap",
      target: "node",
      callback: (event: EventObjectNode) => {
        handleSelectedNodeChange(event.target.id(), event.cy);
      },
    },
    {
      event: "tap",
      target: "edge",
      callback: (event: EventObjectEdge) => {
        const targetNode = event.target.source().hasClass("path-element")
          ? event.target.target()
          : event.target.source();
        handleSelectedNodeChange(targetNode.id(), event.cy);
      },
    },
    {
      event: "mouseover",
      target: "node",
      callback: (event: EventObjectNode) => {
        event.target.connectedEdges().addClass("solid");
      },
    },
    {
      event: "mouseout",
      target: "node",
      callback: (event: EventObjectNode) => {
        event.target.connectedEdges().removeClass("solid");
      },
    },
    {
      event: "mouseover",
      target: "edge",
      callback: (event: EventObjectEdge) => {
        event.target.connectedNodes().addClass("solid");
      },
    },
    {
      event: "mouseout",
      target: "edge",
      callback: (event: EventObjectEdge) => {
        event.target.connectedNodes().removeClass("solid");
      },
    },
  ];

  useEffect(() => {
    // If the source elements have changed, make sure the selectedNode is updated with any new data
    if (selectedNode !== undefined) {
      const newSelectedNode = elements.find(
        (el) =>
          !isPathwaySearchEdgeElement(el) && el.data.id === selectedNode.data.id
      ) as PathwaySearchNode | undefined;

      if (newSelectedNode !== undefined) {
        setSelectedNode({
          classes: [...(newSelectedNode.classes || [])],
          data: { ...newSelectedNode.data },
        });
      } else {
        // TODO: This should currently never happen, but it might be possible if/when we allow removing nodes from the pathway
        console.warn("Selected node does not exist in current elements list!");
      }
    }
  }, [elements]);

  return (
    <Grid item xs={12} sx={{ position: "relative", height: "inherit" }}>
      {elements.length === 0 ? (
        <SearchBarContainer>
          <PathwaySearchBar onSubmit={onSearchBarSubmit}></PathwaySearchBar>
        </SearchBarContainer>
      ) : (
        <PathwayModeBtnContainer>
          <Tooltip title="Search Path" arrow placement="left">
            <Box sx={{ position: "relative" }}>
              <Fab
                aria-label="search-path"
                color="secondary"
                size="large"
                onClick={onSearchBtnClick}
              >
                <SearchIcon />
              </Fab>
              {loading && (
                <CircularProgress
                  color="primary"
                  size={68} // This should be the FAB diameter + 4
                  sx={{
                    position: "absolute",
                    top: -6,
                    left: -6,
                    zIndex: 1,
                  }}
                />
              )}
            </Box>
          </Tooltip>
        </PathwayModeBtnContainer>
      )}
      {selectedNode === undefined ? null : (
        <NodeFiltersContainer>
          <PathwayNodeFilters
            node={selectedNode}
            onChange={handleNodeFilterChange}
          ></PathwayNodeFilters>
        </NodeFiltersContainer>
      )}
      <CytoscapeChart
        elements={elements}
        layout={EULER_LAYOUT}
        stylesheet={PATHWAY_SEARCH_STYLESHEET}
        cxtMenuEnabled={false}
        tooltipEnabled={false}
        toolbarPosition={{ top: 10, right: 10 }}
        customTools={customTools}
        autoungrabify={true}
        customEventHandlers={customEventHandlers}
      ></CytoscapeChart>
    </Grid>
  );
}
