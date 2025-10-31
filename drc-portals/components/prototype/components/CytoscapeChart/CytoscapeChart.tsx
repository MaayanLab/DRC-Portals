"use client";

import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import {
  ClickAwayListener,
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
  Position,
  // @ts-ignore
  Stylesheet,
} from "cytoscape";
import cytoscape from "cytoscape";
import euler from "cytoscape-euler";
import klay from "cytoscape-klay";
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
import { CytoscapeEvent, CytoscapeNodeData } from "../../interfaces/cy";
import { CxtMenuItem } from "../../interfaces/cxt-menu";
import { PositionOffsets } from "../../interfaces/shared";
import { CustomToolbarFnFactory, CytoscapeReference } from "../../types/cy";
import { createNodeTooltip, rebindEventHandlers } from "../../utils/cy";

import { ChartCxtMenu } from "./ChartCxtMenu";
import ChartLegend from "./ChartLegend";
import ChartToolbar from "./ChartToolbar";
import { ChartTooltip } from "./ChartTooltip";
import "./CytoscapeChart.css";

// @ts-ignore
cytoscape.use(euler);
cytoscape.use(klay);

interface CytoscapeChartProps {
  cyRef: CytoscapeReference;
  elements: ElementDefinition[];
  layout: LayoutOptions;
  stylesheet: string | Stylesheet | Stylesheet[];
  cxtMenuEnabled: boolean;
  tooltipEnabled: boolean;
  hoverCxtMenuEnabled: boolean;
  legendPosition?: PositionOffsets;
  toolbarPosition?: PositionOffsets;
  tooltipBoxStyleProps?: CSSProperties;
  tooltipContentProps?: TypographyProps;
  customTools?: CustomToolbarFnFactory[];
  staticCxtMenuItems?: CxtMenuItem[];
  nodeCxtMenuItems?: CxtMenuItem[];
  edgeCxtMenuItems?: CxtMenuItem[];
  canvasCxtMenuItems?: CxtMenuItem[];
  legend?: Map<string, ReactNode>;
  autoungrabify?: boolean;
  boxSelectionEnabled?: boolean;
  zoom?: number;
  maxZoom?: number;
  customEvents?: CytoscapeEvent[];
}

export default function CytoscapeChart(cmpProps: CytoscapeChartProps) {
  const {
    cyRef,
    elements,
    layout,
    stylesheet,
    cxtMenuEnabled,
    tooltipEnabled,
    hoverCxtMenuEnabled,
    legendPosition,
    toolbarPosition,
    tooltipBoxStyleProps,
    tooltipContentProps,
    customTools,
    staticCxtMenuItems,
    nodeCxtMenuItems,
    edgeCxtMenuItems,
    canvasCxtMenuItems,
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
  const [contextMenuItems, setContextMenuItems] = useState<CxtMenuItem[]>([]);
  const contextMenuPosRef = useRef<Position>({
    x: 0,
    y: 0,
  });
  const tooltipPositionRef = useRef<Position>({
    x: 0,
    y: 0,
  });
  const popperRef = useRef<Instance>(null);
  const prevCustomEventsRef = useRef<CytoscapeEvent[]>([]);
  const prevDefaultEventsRef = useRef<CytoscapeEvent[]>([]);
  const [nodeHoverTimerId, setNodeHoverTimerId] =
    useState<NodeJS.Timeout | null>(null);
  const [closeNodeCxtTimerId, setCloseNodeCxtTimerId] =
    useState<NodeJS.Timeout | null>(null);
  const [longTouchHeld, setLongTouchHeld] = useState(false);

  const handleContextMenuClose = () => {
    setContextMenuOpen(false);
    setContextMenuItems([]);
  };

  const handleContextMenu = useCallback(
    (event: EventObject, menuItems: CxtMenuItem[]) => {
      if (staticCxtMenuItems !== undefined && staticCxtMenuItems.length > 0) {
        menuItems.push(...staticCxtMenuItems);
      }

      setContextMenuEvent(event);
      setContextMenuItems(menuItems);
      setContextMenuOpen(true);
    },
    [staticCxtMenuItems]
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
    event.target.addClass("hovered");

    // Note that Cytoscape.js does not support a :hover selector for nodes, so any on-hover styles we want to apply would need to be
    // handled here
    setNodeHoverTimerId(
      setTimeout(() => {
        tooltipPositionRef.current = {
          x: event.originalEvent.clientX,
          y: event.originalEvent.clientY,
        };

        if (popperRef.current != null) {
          popperRef.current.update();
        }
        setHoveredNode(event.target.data());
      }, 500)
    );
  };

  const handleBlurNode = useCallback(
    (event: EventObjectNode) => {
      event.target.removeClass("hovered");

      if (nodeHoverTimerId !== null) {
        clearTimeout(nodeHoverTimerId);
        setNodeHoverTimerId(null);
      }
      setHoveredNode(null);
    },
    [nodeHoverTimerId]
  );

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

  const handleCxtTap = (event: EventObject) => {
    hideTooltip();
    cxtTapHandleSelectState(event);
    contextMenuPosRef.current = {
      x: event.originalEvent.clientX,
      y: event.originalEvent.clientY,
    };
  };

  const openNodeCxt = useCallback(
    (event: EventObjectNode) => {
      const items = [];

      if (nodeCxtMenuItems !== undefined) {
        items.push(...nodeCxtMenuItems);
      }

      handleContextMenu(event, items);
    },
    [nodeCxtMenuItems]
  );

  const openEdgeCxt = useCallback(
    (event: EventObjectEdge) => {
      const items = [];

      if (edgeCxtMenuItems !== undefined) {
        items.push(...edgeCxtMenuItems);
      }

      handleContextMenu(event, items);
    },
    [edgeCxtMenuItems]
  );

  const openCanvasCxt = useCallback(
    (event: EventObject) => {
      if (event.target === cyRef.current) {
        const items = [];

        if (canvasCxtMenuItems !== undefined) {
          items.push(...canvasCxtMenuItems);
        }

        handleContextMenu(event, items);
      }
    },
    [canvasCxtMenuItems]
  );

  const handleCtrlTap = useCallback((event: EventObject) => {
    if (event.originalEvent.ctrlKey) {
      handleCxtTap(event);
    }
  }, [handleCxtTap]);

  const handleNodeCtrlTap = useCallback(
    (event: EventObject) => {
      if (event.originalEvent.ctrlKey) {
        openNodeCxt(event);
      }
    },
    [openNodeCxt]
  );


  const handleEdgeCtrlTap = useCallback(
    (event: EventObject) => {
      if (event.originalEvent.ctrlKey) {
        openEdgeCxt(event);
      }
    },
    [openEdgeCxt]
  );

  const handleCanvasCtrlTap = useCallback(
    (event: EventObject) => {
      if (event.originalEvent.ctrlKey) {
        openCanvasCxt(event);
      }
    },
    [openCanvasCxt]
  );

  const handleLongTap = (event: EventObject) => {
    hideTooltip();
    cxtTapHandleSelectState(event);

    let x: number;
    let y: number;
    // Cytoscape.js explicitly types originalEvent as a MouseEvent, even though it *can* also be a TouchEvent
    // @ts-ignore
    const targetTouches = event.originalEvent.targetTouches;

    if (targetTouches !== undefined && targetTouches.length > 0) {
      setLongTouchHeld(true);

      // @ts-ignore
      x = targetTouches[0].clientX;
      // @ts-ignore
      y = targetTouches[0].clientY;
    } else {
      x = event.originalEvent.clientX;
      y = event.originalEvent.clientY;
    }

    contextMenuPosRef.current = {
      x,
      y,
    };
  }

  const handleNodeTapEnd = useCallback(
    (event: EventObject) => {
      // If this is true then the user is on a touch device and triggered a taphold
      if (longTouchHeld) {
        openNodeCxt(event);
      }
      setLongTouchHeld(false);
    },
    [longTouchHeld, openNodeCxt]
  );


  const handleEdgeTapEnd = useCallback(
    (event: EventObject) => {
      // If this is true then the user is on a touch device and triggered a taphold
      if (longTouchHeld) {
        openEdgeCxt(event);
      }
      setLongTouchHeld(false);
    },
    [longTouchHeld, openEdgeCxt]
  );

  const handleCanvasTapEnd = useCallback(
    (event: EventObject) => {
      // If this is true then the user is on a touch device and triggered a taphold
      if (longTouchHeld) {
        openCanvasCxt(event);
      }
      setLongTouchHeld(false);
    },
    [longTouchHeld, openCanvasCxt]
  );

  const clearCloseNodeCxtTimer = useCallback(() => {
    if (closeNodeCxtTimerId !== null) {
      clearTimeout(closeNodeCxtTimerId);
      setCloseNodeCxtTimerId(null);
    }
  }, [closeNodeCxtTimerId]);

  const openNodeHoverCxt = (event: EventObjectNode) => {
    // Make sure we don't accidentally close the menu if the user quickly hovered between nodes
    clearCloseNodeCxtTimer();

    contextMenuPosRef.current = {
      x: event.originalEvent.clientX + 3, // Need a bit of extra spacing to prevent a premature mouseleave event
      y: event.originalEvent.clientY,
    };
    openNodeCxt(event);
  };

  const closeNodeHoverCxt = () => {
    setCloseNodeCxtTimerId(
      setTimeout(() => {
        handleContextMenuClose();
      }, 250)
    );
  };

  const handleCxtMenuMouseEnter = () => {
    clearCloseNodeCxtTimer();
  };

  const handleCxtMenuMouseLeave = () => {
    setCloseNodeCxtTimerId(
      setTimeout(() => {
        handleContextMenuClose();
      }, 250)
    );
  };

  const defaultEvents: CytoscapeEvent[] = useMemo(
    () => [
      { event: "mouseover", target: "node", callback: handleHoverNode },
      { event: "mouseout", target: "node", callback: handleBlurNode },
      { event: "mouseover", target: "edge", callback: handleHoverEdge },
      { event: "mouseout", target: "edge", callback: handleBlurEdge },
      { event: "grab", target: "node", callback: handleGrabNode },
      { event: "drag", target: "node", callback: handleDragNode },
      { event: "tap", callback: handleCtrlTap }, // Shared tap behavior
      ...(cxtMenuEnabled
        ? [
          { event: "tap", callback: handleCanvasCtrlTap }, // Canvas specific tap behavior
          { event: "tap", target: "node", callback: handleNodeCtrlTap },
          { event: "tap", target: "edge", callback: handleEdgeCtrlTap },
        ]
        : []),
      { event: "taphold", callback: handleLongTap }, // Shared taphold behavior
      ...(cxtMenuEnabled
        ? [
          { event: "tapend", callback: handleCanvasTapEnd }, // Canvas specific taphold behavior
          { event: "tapend", target: "node", callback: handleNodeTapEnd },
          { event: "tapend", target: "edge", callback: handleEdgeTapEnd },
        ]
        : []),
      { event: "cxttap", callback: handleCxtTap }, // Shared cxttap behavior
      ...(cxtMenuEnabled
        ? [
          { event: "cxttap", callback: openCanvasCxt }, // Canvas specific cxttap behavior
          { event: "cxttap", target: "node", callback: openNodeCxt },
          { event: "cxttap", target: "edge", callback: openEdgeCxt },
        ]
        : []),
      ...(hoverCxtMenuEnabled
        ? [
          {
            event: "mouseover",
            target: "node",
            callback: openNodeHoverCxt,
          },
          {
            event: "mouseout",
            target: "node",
            callback: closeNodeHoverCxt,
          },
        ]
        : []),
    ],
    [
      cxtMenuEnabled,
      hoverCxtMenuEnabled,
      handleHoverNode,
      handleBlurNode,
      handleHoverEdge,
      handleBlurEdge,
      handleGrabNode,
      handleDragNode,
      openCanvasCxt,
      openNodeCxt,
      openEdgeCxt,
      handleCtrlTap,
      handleCanvasCtrlTap,
      handleNodeCtrlTap,
      handleEdgeCtrlTap,
      handleNodeTapEnd,
      handleEdgeTapEnd,
      handleCanvasTapEnd
    ]
  );

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
            {/* @ts-ignore */}
            <CytoscapeComponent
              className="cy"
              // @ts-ignore
              cy={(cy) => (cyRef.current = cy)}
              elements={elements}
              layout={layout}
              stylesheet={stylesheet}
              zoom={zoom}
              maxZoom={maxZoom}
              autoungrabify={autoungrabify}
              boxSelectionEnabled={boxSelectionEnabled}
            />
          </ChartContainer>
        </ChartTooltip>
      </ClickAwayListener>
      <ChartCxtMenu
        open={contextMenuOpen && contextMenuItems.length > 0}
        items={contextMenuItems}
        position={contextMenuPosRef.current}
        event={contextMenuEvent}
        onClose={handleContextMenuClose}
      ></ChartCxtMenu>
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
