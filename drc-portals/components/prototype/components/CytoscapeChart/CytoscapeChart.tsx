"use client";

import {
  ClickAwayListener,
  Divider,
  MenuList,
  Paper,
  TypographyProps,
} from "@mui/material";
import { Instance } from "@popperjs/core";
import {
  ElementDefinition,
  EventObject,
  EventObjectEdge,
  EventObjectNode,
  LayoutOptions,
  Stylesheet,
} from "cytoscape";
import cytoscape from "cytoscape";
// @ts-ignore
import d3Force from "cytoscape-d3-force";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { v4 } from "uuid";

import { ChartContainer, WidgetContainer } from "../../constants/cy";
import {
  CxtMenuItem,
  EdgeCxtMenuItem,
  NodeCxtMenuItem,
  CytoscapeNodeData,
} from "../../interfaces/cy";
import { PositionOffsets } from "../../interfaces/shared";
import { CustomToolbarFnFactory } from "../../types/cy";
import {
  createChartCxtMenuItem,
  createNodeTooltip,
  hideElement,
  highlightNeighbors,
  resetHighlights,
  selectAll,
  selectNeighbors,
  showElement,
} from "../../utils/cy";

import { ChartCxtMenu } from "./ChartCxtMenu";
import ChartLegend from "./ChartLegend";
import ChartToolbar from "./ChartToolbar";
import { ChartTooltip } from "./ChartTooltip";
import "./CytoscapeChart.css";

cytoscape.use(d3Force);

type CytoscapeChartProps = {
  elements: ElementDefinition[];
  layout: LayoutOptions;
  stylesheet: string | Stylesheet | Stylesheet[];
  legendPosition?: PositionOffsets;
  toolbarPosition?: PositionOffsets;
  tooltipBoxStyleProps?: CSSProperties;
  tooltipContentProps?: TypographyProps;
  customTools?: CustomToolbarFnFactory[];
  staticCxtMenuItems?: CxtMenuItem[];
  nodeCxtMenuItems?: NodeCxtMenuItem[];
  edgeCxtMenuItems?: EdgeCxtMenuItem[];
};

export default function CytoscapeChart(cmpProps: CytoscapeChartProps) {
  const cmpKey = `cy-chart-${v4()}`;
  const {
    elements,
    layout,
    stylesheet,
    legendPosition,
    toolbarPosition,
    tooltipBoxStyleProps,
    tooltipContentProps,
    customTools,
    staticCxtMenuItems,
    nodeCxtMenuItems,
    edgeCxtMenuItems,
  } = cmpProps;

  const cyRef = useRef<cytoscape.Core>();
  const [hoveredNode, setHoveredNode] = useState<CytoscapeNodeData | null>(
    null
  );
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipTitle, setTooltipTitle] = useState<ReactNode>(null);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuItems, setContextMenuItems] = useState<ReactNode[]>([]);
  const contextMenuPosRef = useRef<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });
  const tooltipPositionRef = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const popperRef = useRef<Instance>(null);
  let nodeHoverTimerId: NodeJS.Timeout | null = null;

  const handleContextMenuClose = () => {
    setContextMenuOpen(false);
  };

  const contextMenuItemSelectWrapper = (fn: Function, ...args: any[]) => {
    return () => {
      fn(...args);
      handleContextMenuClose();
    };
  };

  // Menu items that are shared between nodes and edges
  const getSharedMenuItems = (event: EventObjectNode | EventObjectEdge) => {
    const items = [];

    if (event.target.hasClass("dimmed")) {
      items.push(
        createChartCxtMenuItem(
          `${cmpKey}-shared-ctx-menu-0`,
          contextMenuItemSelectWrapper(showElement, event),
          "Show"
        )
      );
    } else {
      items.push(
        createChartCxtMenuItem(
          `${cmpKey}-shared-ctx-menu-1`,
          contextMenuItemSelectWrapper(hideElement, event),
          "Hide"
        )
      );
    }

    return items;
  };

  const getStaticMenuItems = (event: EventObject) => {
    const items = [
      createChartCxtMenuItem(
        `${cmpKey}-static-ctx-menu-0`,
        contextMenuItemSelectWrapper(selectAll, event),
        "Select All"
      ),
    ];

    if (
      event.cy.elements(".highlight").length > 0 ||
      event.cy.elements(".dimmed").length > 0
    ) {
      items.push(
        createChartCxtMenuItem(
          `${cmpKey}-static-ctx-menu-1`,
          contextMenuItemSelectWrapper(resetHighlights, event),
          "Reset Highlights"
        )
      );
    }

    if (staticCxtMenuItems !== undefined) {
      items.push(
        ...staticCxtMenuItems
          .filter((val) => val.showFn === undefined || val.showFn(event))
          .map((val, idx) =>
            createChartCxtMenuItem(
              `${cmpKey}-custom-static-ctx-menu-${idx}`,
              contextMenuItemSelectWrapper(val.fn, event),
              val.title
            )
          )
      );
    }

    return items;
  };

  const handleContextMenu = (event: EventObject, menuItems: JSX.Element[]) => {
    const staticMenuItems = getStaticMenuItems(event);
    if (menuItems.length > 0 && staticMenuItems.length > 0) {
      menuItems.push(
        <Divider key={`${cmpKey}-ctx-menu-divider`} variant="middle" />
      );
    }
    menuItems.push(...staticMenuItems);

    setContextMenuItems(menuItems);
    setContextMenuOpen(true);
  };

  const hideTooltip = () => {
    setTooltipOpen(false);
    setTooltipTitle(null);
  };

  const showTooltip = (title: ReactNode) => {
    // Don't show the tooltip if the context menu is open
    if (!contextMenuOpen) {
      setTooltipOpen(true);
      setTooltipTitle(title);
    }
  };

  const handleHoverNode = (event: EventObjectNode) => {
    event.target.addClass("hovered");

    // Note that Cytoscape.js does not support a :hover selector for nodes, so any on-hover styles we want to apply would need to be
    // handled here
    nodeHoverTimerId = setTimeout(() => {
      tooltipPositionRef.current = {
        x: event.originalEvent.clientX,
        y: event.originalEvent.clientY,
      };

      if (popperRef.current != null) {
        popperRef.current.update();
      }
      setHoveredNode(event.target.data());
    }, 200);
  };

  const handleBlurNode = (event: EventObjectNode) => {
    event.target.removeClass("hovered");

    if (nodeHoverTimerId !== null) {
      clearTimeout(nodeHoverTimerId);
      nodeHoverTimerId = null;
    }
    setHoveredNode(null);
  };

  const handleHoverEdge = (event: EventObjectEdge) => {
    event.target.addClass("hovered");
  };

  const handleBlurEdge = (event: EventObjectEdge) => {
    event.target.removeClass("hovered");
  };

  const handleGrabNode = () => {
    hideTooltip();
  };

  const handleDragNode = () => {
    hideTooltip();
  };

  const cxtTapHandleSelectState = (event: EventObject) => {
    // If the target was the canvas or otherwise not already selected, deselect all
    if (event.target === cyRef.current || !event.target.selected()) {
      event.cy.elements().deselect();
    }

    // Then, select the target if it's not the canvas
    if (event.target !== cyRef.current) {
      event.target.select();
    }
  };

  const handleCxtTapNode = (event: EventObjectNode) => {
    const items = [
      createChartCxtMenuItem(
        `${cmpKey}-node-ctx-menu-0`,
        contextMenuItemSelectWrapper(highlightNeighbors, event),
        "Highlight Neighbors"
      ),
      createChartCxtMenuItem(
        `${cmpKey}-node-ctx-menu-1`,
        contextMenuItemSelectWrapper(selectNeighbors, event),
        "Select Neighbors"
      ),
      ...getSharedMenuItems(event),
    ];

    if (nodeCxtMenuItems !== undefined) {
      items.push(
        ...nodeCxtMenuItems
          .filter((val) => val.showFn === undefined || val.showFn(event))
          .map((val, idx) =>
            createChartCxtMenuItem(
              `${cmpKey}-custom-node-ctx-menu-${idx}`,
              contextMenuItemSelectWrapper(val.fn, event),
              val.title
            )
          )
      );
    }

    handleContextMenu(event, items);
  };

  const handleCxtTapEdge = (event: EventObjectEdge) => {
    const items = [...getSharedMenuItems(event)];

    if (edgeCxtMenuItems !== undefined) {
      items.push(
        ...edgeCxtMenuItems
          .filter((val) => val.showFn === undefined || val.showFn(event))
          .map((val, idx) =>
            createChartCxtMenuItem(
              `${cmpKey}-custom-edge-ctx-menu-${idx}`,
              contextMenuItemSelectWrapper(val.fn, event),
              val.title
            )
          )
      );
    }

    handleContextMenu(event, items);
  };

  const handleCxtTapCanvas = (event: EventObject) => {
    // Note that everything preceding the if-block will trigger on *any* cxtTap event, allowing us to set some shared behavior
    hideTooltip();
    cxtTapHandleSelectState(event);
    contextMenuPosRef.current = {
      x: event.originalEvent.clientX,
      y: event.originalEvent.clientY,
    };

    if (event.target === cyRef.current) {
      handleContextMenu(event, []);
    }
  };

  const runLayout = () => {
    const cy = cyRef.current;
    if (cy) {
      cy.layout(layout).run();
    }
  };

  useEffect(() => {
    const cy = cyRef.current;
    if (cy) {
      // Interaction callbacks
      cy.bind("mouseover", "node", handleHoverNode);
      cy.bind("mouseout", "node", handleBlurNode);
      cy.bind("mouseover", "edge", handleHoverEdge);
      cy.bind("mouseout", "edge", handleBlurEdge);
      cy.bind("grab", "node", handleGrabNode);
      cy.bind("drag", "node", handleDragNode);
      cy.bind("cxttap", handleCxtTapCanvas);
      cy.bind("cxttap", "node", handleCxtTapNode);
      cy.bind("cxttap", "edge", handleCxtTapEdge);
    }
  }, []);

  useEffect(() => {
    // We need to rerun the layout when the elements change, otherwise they won't be drawn properly
    runLayout();
  }, [elements]);

  // TODO: This is clearly redundant with the elements effect, but since we may be changing layout independent of the elements in the
  // future, I think this should stay as is
  useEffect(() => {
    runLayout();
  }, [layout]);

  useEffect(() => {
    const cy = cyRef.current;
    if (cy) {
      cy.style(stylesheet);
    }
  }, [stylesheet]);

  useEffect(() => {
    if (hoveredNode === null) {
      hideTooltip();
    } else {
      showTooltip(
        createNodeTooltip(
          hoveredNode,
          tooltipBoxStyleProps,
          tooltipContentProps
        )
      );
    }
  }, [hoveredNode]);

  return (
    <>
      <ClickAwayListener onClickAway={hideTooltip}>
        <ChartTooltip
          title={tooltipTitle}
          open={tooltipOpen}
          position={tooltipPositionRef.current}
          popperRef={popperRef}
        >
          <ChartContainer variant="outlined">
            <CytoscapeComponent
              className="cy"
              cy={(cy) => (cyRef.current = cy)}
              elements={elements}
              layout={layout}
              stylesheet={stylesheet}
            />
          </ChartContainer>
        </ChartTooltip>
      </ClickAwayListener>
      <ClickAwayListener onClickAway={handleContextMenuClose}>
        <ChartCxtMenu
          open={contextMenuOpen && contextMenuItems.length > 0}
          position={contextMenuPosRef.current}
        >
          <Paper>
            <MenuList>{contextMenuItems}</MenuList>
          </Paper>
        </ChartCxtMenu>
      </ClickAwayListener>
      {toolbarPosition === undefined ? null : (
        <WidgetContainer key={`${cmpKey}-toolbar`} sx={{ ...toolbarPosition }}>
          <ChartToolbar cyRef={cyRef} customTools={customTools}></ChartToolbar>
        </WidgetContainer>
      )}
      {legendPosition === undefined ? null : (
        <WidgetContainer key={`${cmpKey}-legend`} sx={{ ...legendPosition }}>
          <ChartLegend></ChartLegend>
        </WidgetContainer>
      )}
    </>
  );
}
