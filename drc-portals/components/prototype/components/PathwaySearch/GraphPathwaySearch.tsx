"use client";

import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";
import { Button, Grid, IconButton, Tooltip } from "@mui/material";

import {
  Core,
  ElementDefinition,
  EventObject,
  EventObjectEdge,
  EventObjectNode,
} from "cytoscape";
import { Fragment, useCallback, useState } from "react";

import { NodeResult } from "@/lib/neo4j/types";

import CytoscapeChart from "../CytoscapeChart/CytoscapeChart";
import PathwaySearchBar from "../SearchBar/PathwaySearchBar";
import { PATHWAY_SEARCH_STYLESHEET, EULER_LAYOUT } from "../../constants/cy";
import {
  NodeFiltersContainer,
  PathwayModeBtnContainer,
} from "../../constants/pathway-search";
import { SearchBarContainer } from "../../constants/search-bar";
import { CytoscapeEvent } from "../../interfaces/cy";
import { PathwaySearchNode } from "../../interfaces/pathway-search";
import { CustomToolbarFnFactory } from "../../types/cy";

import PathwayNodeFilters from "./PathwayNodeFilters";

interface GraphPathwaySearchProps {
  elements: ElementDefinition[];
  onSearchBarSubmit: (node: NodeResult) => void;
  onSearchBtnClick: () => void;
  onReset: () => void;
  onSelectedNodeChange: (
    node: PathwaySearchNode | undefined,
    reason: string
  ) => void;
}

export default function GraphPathwaySearch(cmpProps: GraphPathwaySearchProps) {
  const {
    elements,
    onReset,
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
  ];

  const customEventHandlers: CytoscapeEvent[] = [
    {
      event: "tap",
      callback: (event: EventObject) => {
        console.log(`tap`);
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

  // TODO: if elements changes, need to make sure the selected node is updated to reflect whatever the new data is for that node (if any)

  return (
    <Grid item xs={12} sx={{ position: "relative", height: "inherit" }}>
      {elements.length === 0 ? (
        <SearchBarContainer>
          <PathwaySearchBar onSubmit={onSearchBarSubmit}></PathwaySearchBar>
        </SearchBarContainer>
      ) : (
        <PathwayModeBtnContainer>
          <Tooltip title="Search Path" arrow placement="left">
            <Button
              aria-label="search-path"
              color="secondary"
              variant="contained"
              size="large"
              sx={{ height: "64px", width: "64px", borderRadius: "50%" }}
              onClick={onSearchBtnClick}
            >
              <SearchIcon />
            </Button>
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
