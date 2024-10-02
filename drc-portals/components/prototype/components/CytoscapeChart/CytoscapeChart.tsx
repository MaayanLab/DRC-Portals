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
import dagre from "cytoscape-dagre";
// @ts-ignore
import d3Force from "cytoscape-d3-force";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";

import { ChartContainer, WidgetContainer } from "../../constants/cy";
import { CytoscapeEvent, CytoscapeNodeData } from "../../interfaces/cy";
import { PositionOffsets } from "../../interfaces/shared";
import { CustomToolbarFnFactory } from "../../types/cy";
import {
  createNodeTooltip,
  hideElement,
  resetHighlights,
  showElement,
} from "../../utils/cy";

import { ChartCxtMenu } from "./ChartCxtMenu";
import ChartCxtMenuItem from "./ChartCxtMenuItem";
import ChartLegend from "./ChartLegend";
import ChartToolbar from "./ChartToolbar";
import { ChartTooltip } from "./ChartTooltip";
import "./CytoscapeChart.css";

cytoscape.use(d3Force);
cytoscape.use(dagre);

interface CytoscapeChartProps {
  elements: ElementDefinition[];
  layout: LayoutOptions;
  stylesheet: string | Stylesheet | Stylesheet[];
  cxtMenuEnabled: boolean;
  tooltipEnabled: boolean;
  legendPosition?: PositionOffsets;
  toolbarPosition?: PositionOffsets;
  tooltipBoxStyleProps?: CSSProperties;
  tooltipContentProps?: TypographyProps;
  customTools?: CustomToolbarFnFactory[];
  selectionCxtMenuItems?: ReactNode[];
  nodeCxtMenuItems?: ReactNode[];
  edgeCxtMenuItems?: ReactNode[];
  canvasCxtMenuItems?: ReactNode[];
  legend?: Map<string, ReactNode>;
  autoungrabify?: boolean;
  customEventHandlers?: CytoscapeEvent[];
}

export default function CytoscapeChart(cmpProps: CytoscapeChartProps) {
  const {
    elements,
    layout,
    stylesheet,
    cxtMenuEnabled,
    tooltipEnabled,
    legendPosition,
    toolbarPosition,
    tooltipBoxStyleProps,
    tooltipContentProps,
    customTools,
    selectionCxtMenuItems,
    nodeCxtMenuItems,
    edgeCxtMenuItems,
    canvasCxtMenuItems,
    legend,
    autoungrabify,
    customEventHandlers,
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

    if (event.target.hasClass("transparent")) {
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

  // TODO: Consider refactoring this as "sharedMenuItems" and make it an optional prop to the component. Ultimately, it should probably be
  // up to the parent what context menu items are avaialable, and if they provide none, don't show a context menu at all.
  const getStaticMenuItems = (event: EventObject) => {
    const items: ReactNode[] = [];

    if (
      event.cy.elements(".highlight").length > 0 ||
      event.cy.elements(".transparent").length > 0
    ) {
      items.push(
        <ChartCxtMenuItem
          key="cxt-menu-reset-highlights"
          renderContent={() => "Reset Highlights"}
          action={resetHighlights}
        ></ChartCxtMenuItem>
      );
    }

    if (
      selectionCxtMenuItems !== undefined &&
      event.cy.elements(":selected").length > 0
    ) {
      items.push(...selectionCxtMenuItems);
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
      const items: ReactNode[] = [];

      if (canvasCxtMenuItems !== undefined) {
        items.push(...canvasCxtMenuItems);
      }

      handleContextMenu(event, items);
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

      // TODO: Ideally, the above bindings would be defined by the parent exclusively, but for now keeping them separate because they are
      // core to the interaction with the component and would be tricky to refactor out.
      customEventHandlers?.forEach((interaction) => {
        cy.bind(interaction.event, interaction.target, interaction.callback);
      });
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
          open={tooltipEnabled && tooltipOpen}
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
              autoungrabify={autoungrabify}
            />
          </ChartContainer>
        </ChartTooltip>
      </ClickAwayListener>
      <ClickAwayListener onClickAway={handleContextMenuClose}>
        <ChartCxtMenu
          open={
            cxtMenuEnabled && contextMenuOpen && contextMenuItems.length > 0
          }
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
