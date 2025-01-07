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
  Core,
  ElementDefinition,
  EventObject,
  EventObjectEdge,
  EventObjectNode,
  LayoutOptions,
  Layouts,
  NodeSingular,
  Position,
  Stylesheet,
} from "cytoscape";
import cytoscape from "cytoscape";
// @ts-ignore
import d3Force from "cytoscape-d3-force";
import euler from "cytoscape-euler";
import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CytoscapeComponent from "react-cytoscapejs";

import { ChartContainer, WidgetContainer } from "../../constants/cy";
import {
  ChartRadialMenuItemProps,
  ChartRadialMenuPosition,
  CytoscapeEvent,
  CytoscapeNodeData,
} from "../../interfaces/cy";
import { PositionOffsets } from "../../interfaces/shared";
import { AnimationFn, CustomToolbarFnFactory } from "../../types/cy";
import {
  createNodeTooltip,
  hideElement,
  rebindEventHandlers,
  resetHighlights,
  setChartCursor,
  showElement,
} from "../../utils/cy";

import { ChartCxtMenu } from "./ChartCxtMenu";
import ChartCxtMenuItem from "./ChartCxtMenuItem";
import ChartLegend from "./ChartLegend";
import { ChartRadialMenu } from "./ChartRadialMenu";
import ChartToolbar from "./ChartToolbar";
import { ChartTooltip } from "./ChartTooltip";
import "./CytoscapeChart.css";

cytoscape.use(d3Force);
cytoscape.use(euler);

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
  customAnimations?: AnimationFn[];
  selectionCxtMenuItems?: ReactNode[];
  nodeCxtMenuItems?: ReactNode[];
  edgeCxtMenuItems?: ReactNode[];
  canvasCxtMenuItems?: ReactNode[];
  radialMenuItems?: ChartRadialMenuItemProps[];
  legend?: Map<string, ReactNode>;
  autoungrabify?: boolean;
  boxSelectionEnabled?: boolean;
  zoom?: number;
  maxZoom?: number;
  customEvents?: CytoscapeEvent[];
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
    customAnimations,
    selectionCxtMenuItems,
    nodeCxtMenuItems,
    edgeCxtMenuItems,
    canvasCxtMenuItems,
    radialMenuItems,
    legend,
    autoungrabify,
    boxSelectionEnabled,
    zoom,
    maxZoom,
    customEvents,
  } = cmpProps;

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
  const [radialMenuOpen, setRadialMenuOpen] = useState(false);
  const [radialMenuNode, setRadialMenuNode] = useState<NodeSingular>();
  const cyRef = useRef<Core>();
  const cyLayoutRef = useRef<Layouts>();
  const contextMenuPosRef = useRef<Position>({
    x: 0,
    y: 0,
  });
  const radialMenuPosRef = useRef<ChartRadialMenuPosition>({
    x: 0,
    y: 0,
    r: 0,
  });
  const tooltipPositionRef = useRef<Position>({
    x: 0,
    y: 0,
  });
  const popperRef = useRef<Instance>(null);
  const prevCustomEventsRef = useRef<CytoscapeEvent[]>([]);
  const prevDefaultEventsRef = useRef<CytoscapeEvent[]>([]);
  let nodeHoverTimerId: NodeJS.Timeout | null = null;

  const handleContextMenuClose = () => {
    setContextMenuOpen(false);
  };

  const handleRadialMenuClick = () => {
    setRadialMenuOpen(false);
  };

  const handleRadialMenuItemClick = () => {
    setRadialMenuOpen(false);
  };

  const handleRadialMenuClickAway = () => {
    setRadialMenuOpen(false);
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
  const getStaticMenuItems = useCallback(
    (event: EventObject) => {
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
    },
    [selectionCxtMenuItems]
  );

  const handleContextMenu = useCallback(
    (event: EventObject, menuItems: ReactNode[]) => {
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
    },
    [getStaticMenuItems]
  );

  const hideTooltip = () => {
    setTooltipOpen(false);
    setTooltipTitle(null);
  };

  const showTooltip = useCallback(
    (title: ReactNode) => {
      // Don't show the tooltip if the context menu is open
      if (!contextMenuOpen) {
        setTooltipOpen(true);
        setTooltipTitle(title);
      }
    },
    [contextMenuOpen]
  );

  const handleHideToolbarBtnClicked = useCallback(() => {
    setToolbarHidden(!toolbarHidden);
    setShowToolbarHiddenTooltip(false);
  }, [toolbarHidden]);

  const handleHoverNode = (event: EventObjectNode) => {
    if (radialMenuItems !== undefined) {
      setChartCursor(event.cy, "pointer");
    }

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
    if (radialMenuItems !== undefined) {
      setChartCursor(event.cy, "default");
    }

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

  const handleCxtTapNode = useCallback(
    (event: EventObjectNode) => {
      const items = [...getSharedMenuItems(event)];

      if (nodeCxtMenuItems !== undefined) {
        items.push(...nodeCxtMenuItems);
      }

      handleContextMenu(event, items);
    },
    [nodeCxtMenuItems]
  );

  const handleCxtTapEdge = useCallback(
    (event: EventObjectEdge) => {
      const items = [...getSharedMenuItems(event)];

      if (edgeCxtMenuItems !== undefined) {
        items.push(...edgeCxtMenuItems);
      }

      handleContextMenu(event, items);
    },
    [edgeCxtMenuItems]
  );

  const handleCxtTapCanvas = useCallback(
    (event: EventObject) => {
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
    },
    [canvasCxtMenuItems]
  );

  const openRadialMenuAtNode = (node: NodeSingular) => {
    const nodePos = node.renderedPosition();
    setRadialMenuOpen(true);
    setRadialMenuNode(node);
    radialMenuPosRef.current = {
      x: nodePos.x,
      y: nodePos.y,
      r: node.renderedOuterWidth() / 2,
    };
  };

  const handleTapNode = useCallback(
    (event: EventObjectNode) => {
      // Normally we open the radial menu when a node is selected via the user tapping it. However, if the menu is then closed without
      // *deselecting* the node (for example by clicking somewhere outside of the canvas), they won't be able to reopen the radial menu
      // until the node is deselected. We get around this by introducing this edge case.
      if (
        event.target.selected() &&
        !radialMenuOpen &&
        radialMenuItems !== undefined
      ) {
        openRadialMenuAtNode(event.target);
      }
    },
    [radialMenuOpen, radialMenuItems]
  );

  const handleTapSelectNode = useCallback(
    (event: EventObjectNode) => {
      if (radialMenuItems !== undefined) {
        openRadialMenuAtNode(event.target);
      }
    },
    [radialMenuItems]
  );

  const handleTapEnd = () => {
    setRadialMenuOpen(false);
  };

  const handleDragPan = () => {
    setRadialMenuOpen(false);
  };

  const handleZoom = () => {
    setRadialMenuOpen(false);
  };

  const defaultEvents: CytoscapeEvent[] = useMemo(
    () => [
      { event: "mouseover", target: "node", callback: handleHoverNode },
      { event: "mouseout", target: "node", callback: handleBlurNode },
      { event: "mouseover", target: "edge", callback: handleHoverEdge },
      { event: "mouseout", target: "edge", callback: handleBlurEdge },
      { event: "grab", target: "node", callback: handleGrabNode },
      { event: "drag", target: "node", callback: handleDragNode },
      { event: "cxttap", callback: handleCxtTapCanvas },
      { event: "cxttap", target: "node", callback: handleCxtTapNode },
      { event: "cxttap", target: "edge", callback: handleCxtTapEdge },
      { event: "tap", target: "node", callback: handleTapNode },
      { event: "tapend", callback: handleTapEnd },
      { event: "tapselect", target: "node", callback: handleTapSelectNode },
      { event: "dragpan", callback: handleDragPan },
      { event: "zoom", callback: handleZoom },
    ],
    [
      handleHoverNode,
      handleBlurNode,
      handleHoverEdge,
      handleBlurEdge,
      handleGrabNode,
      handleDragNode,
      handleCxtTapCanvas,
      handleCxtTapNode,
      handleCxtTapEdge,
      handleTapSelectNode,
    ]
  );

  const runLayout = useCallback(() => {
    const cy = cyRef.current;
    if (cy !== undefined) {
      // Stop any existing animations
      cy.stop();

      // We haven't started the first layout yet
      if (cyLayoutRef.current === undefined) {
        // Create a new layout and set the ref
        cyLayoutRef.current = cy.layout(layout);

        // Run the layout
        cyLayoutRef.current.run();
      } else {
        // Stop the existing layout (it may already be stopped)
        cyLayoutRef.current.stop();

        // Reset the ref
        cyLayoutRef.current = cy.layout(layout);

        // Start the new layout
        cyLayoutRef.current.run();
      }

      // Run the custom animations
      if (customAnimations !== undefined) {
        // TODO: It would be good to have a "Stop Animation" listener if the animation can signal that it should be manually stopped
        customAnimations.forEach((fn) => fn(cy));
      }
    }
  }, [layout, customAnimations]);

  useEffect(() => {
    const prevCustomEvents = prevCustomEventsRef.current;
    const newCustomEvents = customEvents || [];
    rebindEventHandlers(cyRef, prevCustomEvents, newCustomEvents);
    prevCustomEventsRef.current = newCustomEvents;
  }, [customEvents]);

  useEffect(() => {
    const prevDefaultEvents = prevDefaultEventsRef.current;
    const newDefaultEvents = defaultEvents || [];
    rebindEventHandlers(cyRef, prevDefaultEvents, newDefaultEvents);
    prevDefaultEventsRef.current = newDefaultEvents;
  }, [defaultEvents]);

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
  }, [hoveredNode, tooltipBoxStyleProps, tooltipContentProps]);

  useEffect(() => {
    // Make sure the cursor style on the chart is reset whenever the radial menu is opened/closed
    const cy = cyRef.current;
    if (cy !== undefined) {
      setChartCursor(cy, "default");
    }

    if (!radialMenuOpen) {
      // Make sure the radial menu node is reset anytime the menu is closed
      setRadialMenuNode(undefined);
    }
  }, [radialMenuOpen]);

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
              zoom={zoom}
              maxZoom={maxZoom}
              autoungrabify={autoungrabify}
              boxSelectionEnabled={boxSelectionEnabled}
            />
            {radialMenuItems === undefined ||
            radialMenuNode === undefined ? null : (
              <ChartRadialMenu
                open={radialMenuOpen}
                node={radialMenuNode}
                position={radialMenuPosRef.current}
                menuItems={radialMenuItems}
                onMenuClick={handleRadialMenuClick}
                onMenuItemClick={handleRadialMenuItemClick}
                onClickAway={handleRadialMenuClickAway}
              ></ChartRadialMenu>
            )}
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
