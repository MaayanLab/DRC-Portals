"use client";

import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { IconButton, Tooltip } from "@mui/material";

import cytoscape, {
  ElementDefinition,
  EventObjectEdge,
  EventObjectNode,
} from "cytoscape";
import { Fragment } from "react";

import { PATHWAY_SEARCH_STYLESHEET, EULER_LAYOUT } from "../../constants/cy";

import { CytoscapeEvent } from "../../interfaces/cy";
import { CustomToolbarFnFactory } from "../../types/cy";

import CytoscapeChart from "../CytoscapeChart/CytoscapeChart";

interface GraphPathwaySearchProps {
  elements: ElementDefinition[];
  onSelectedNodeChange: (id: string | undefined, cy: cytoscape.Core) => void;
  onReset: () => void;
}

export default function GraphPathwaySearch(cmpProps: GraphPathwaySearchProps) {
  const { elements, onSelectedNodeChange, onReset } = cmpProps;

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
      target: "node",
      callback: (event: EventObjectNode) => {
        onSelectedNodeChange(event.target.id(), event.cy);
      },
    },
    {
      event: "unselect",
      callback: (event) => {
        // TODO: Using "unselect" is a little bit hacky...but it does make sure that the selected node is reset. Look into setting "
        // unselectify" on the chart, that way we can have precise control over selections
        onSelectedNodeChange(undefined, event.cy);
      },
    },
    {
      event: "tap",
      target: "edge",
      callback: (event: EventObjectEdge) => {
        const targetNode = event.target.source().hasClass("path-element")
          ? event.target.target()
          : event.target.source();
        onSelectedNodeChange(targetNode.id(), event.cy);
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

  return (
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
  );
}
