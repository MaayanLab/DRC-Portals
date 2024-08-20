"use client";

import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import {
  ClickAwayListener,
  Divider,
  IconButton,
  Tooltip,
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

import { ChartContainer, WidgetContainer } from "../../constants/cy";
import { CytoscapeNodeData } from "../../interfaces/cy";
import { PositionOffsets } from "../../interfaces/shared";
import { CustomToolbarFnFactory } from "../../types/cy";
import {
  createNodeTooltip,
  hideElement,
  resetHighlights,
  selectAll,
  showElement,
} from "../../utils/cy";

import { ChartCxtMenu } from "./ChartCxtMenu";
import ChartCxtMenuItem from "./ChartCxtMenuItem";
import ChartLegend from "./ChartLegend";
import ChartToolbar from "./ChartToolbar";
import { ChartTooltip } from "./ChartTooltip";
import "./CytoscapeChart.css";

cytoscape.use(d3Force);

interface CytoscapeChartProps {
  elements: ElementDefinition[];
  layout: LayoutOptions;
  stylesheet: string | Stylesheet | Stylesheet[];
  legendPosition?: PositionOffsets;
  toolbarPosition?: PositionOffsets;
  tooltipBoxStyleProps?: CSSProperties;
  tooltipContentProps?: TypographyProps;
  customTools?: CustomToolbarFnFactory[];
  staticCxtMenuItems?: ReactNode[];
  nodeCxtMenuItems?: ReactNode[];
  edgeCxtMenuItems?: ReactNode[];
  legend?: Map<string, ReactNode>;
}

export default function CytoscapeChart(cmpProps: CytoscapeChartProps) {
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
    legend,
  } = cmpProps;

  const cyRef = useRef<cytoscape.Core>();
  const [hoveredNode, setHoveredNode] = useState<CytoscapeNodeData | null>(
    null
  );
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipTitle, setTooltipTitle] = useState<ReactNode>(null);
  const [toolbarHidden, setToolbarHidden] = useState(false);
  const [showToolbarHiddenTooltip, setShowToolbarHiddenTooltip] =
    useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuEvent, setContextMenuEvent] = useState<EventObject>();
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

  // Menu items that are shared between nodes and edges
  const getSharedMenuItems = (event: EventObjectNode | EventObjectEdge) => {
    const items: ReactNode[] = [];

    if (event.target.hasClass("dimmed")) {
      items.push(
        <ChartCxtMenuItem
          key="cxt-menu-show"
          renderContent={(event) => "Show"}
          action={showElement}
        ></ChartCxtMenuItem>
      );
    } else {
      items.push(
        <ChartCxtMenuItem
          key="cxt-menu-hide"
          renderContent={(event) => "Hide"}
          action={hideElement}
        ></ChartCxtMenuItem>
      );
    }

    return items;
  };

  const getStaticMenuItems = (event: EventObject) => {
    const items: ReactNode[] = [
      <ChartCxtMenuItem
        key="cxt-menu-select-all"
        renderContent={() => "Select All"}
        action={selectAll}
      ></ChartCxtMenuItem>,
    ];

    if (
      event.cy.elements(".highlight").length > 0 ||
      event.cy.elements(".dimmed").length > 0
    ) {
      items.push(
        <ChartCxtMenuItem
          key="cxt-menu-reset-highlights"
          renderContent={() => "Reset Highlights"}
          action={resetHighlights}
        ></ChartCxtMenuItem>
      );
    }

    if (staticCxtMenuItems !== undefined) {
      items.push(...staticCxtMenuItems);
    }

    return items;
  };

  const handleContextMenu = (event: EventObject, menuItems: ReactNode[]) => {
    const staticMenuItems = getStaticMenuItems(event);
    if (menuItems.length > 0 && staticMenuItems.length > 0) {
      menuItems.push(
        <Divider key={`ctx-menu-static-item-divider`} variant="middle" />
      );
    }
    menuItems.push(...staticMenuItems);

    setContextMenuEvent(event);
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

  const handleHideToolbarBtnClicked = () => {
    setToolbarHidden(!toolbarHidden);
    setShowToolbarHiddenTooltip(false);
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
    }, 500);
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
    const items = [...getSharedMenuItems(event)];

    if (nodeCxtMenuItems !== undefined) {
      items.push(...nodeCxtMenuItems);
    }

    handleContextMenu(event, items);
  };

  const handleCxtTapEdge = (event: EventObjectEdge) => {
    const items = [...getSharedMenuItems(event)];

    if (edgeCxtMenuItems !== undefined) {
      items.push(...edgeCxtMenuItems);
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
          event={contextMenuEvent}
          onClose={handleContextMenuClose}
        >
          {contextMenuItems}
        </ChartCxtMenu>
      </ClickAwayListener>
      {toolbarPosition === undefined ? null : (
        <WidgetContainer key="cy-chart-toolbar" sx={{ ...toolbarPosition }}>
          <Tooltip
            open={showToolbarHiddenTooltip}
            title={toolbarHidden ? "Show Toolbar" : "Hide Toolbar"}
            disableHoverListener
            onMouseEnter={() => setShowToolbarHiddenTooltip(true)}
            onMouseLeave={() => setShowToolbarHiddenTooltip(false)}
            TransitionProps={{ exit: false }}
            arrow
          >
            <IconButton onClick={handleHideToolbarBtnClicked}>
              {toolbarHidden ? (
                <KeyboardDoubleArrowLeftIcon />
              ) : (
                <KeyboardDoubleArrowRightIcon />
              )}
            </IconButton>
          </Tooltip>
          {toolbarHidden ? null : (
            <ChartToolbar
              cyRef={cyRef}
              customTools={customTools}
              layout={layout}
            ></ChartToolbar>
          )}
        </WidgetContainer>
      )}
      {legendPosition !== undefined && legend !== undefined ? (
        <WidgetContainer key="cy-chart-legend" sx={{ ...legendPosition }}>
          <ChartLegend legend={legend}></ChartLegend>
        </WidgetContainer>
      ) : null}
    </>
  );
}
