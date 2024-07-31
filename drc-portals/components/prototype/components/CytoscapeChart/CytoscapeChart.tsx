"use client";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import {
  ClickAwayListener,
  Divider,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
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
import { NestedMenuItem } from "mui-nested-menu";
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
  createNodeTooltip,
  hideElement,
  resetHighlights,
  selectAll,
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
  const cmpKey = useRef(`cy-chart-${v4()}`);
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
  const [toolbarHidden, setToolbarHidden] = useState(false);
  const [showToolbarHiddenTooltip, setShowToolbarHiddenTooltip] =
    useState(false);
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

  const contextMenuItemSelectWrapper = (action: Function, ...args: any[]) => {
    return () => {
      action(...args);
      handleContextMenuClose();
    };
  };

  // Menu items that are shared between nodes and edges
  const getSharedMenuItems = (event: EventObjectNode | EventObjectEdge) => {
    const items = [];

    if (event.target.hasClass("dimmed")) {
      items.push(
        createChartCxtMenuItem(
          `${cmpKey.current}-cxt-menu-show`,
          contextMenuItemSelectWrapper(showElement, event),
          "Show"
        )
      );
    } else {
      items.push(
        createChartCxtMenuItem(
          `${cmpKey.current}-cxt-menu-hide`,
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
        `${cmpKey.current}-cxt-menu-select-all`,
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
          `${cmpKey.current}-cxt-menu-reset-highlights`,
          contextMenuItemSelectWrapper(resetHighlights, event),
          "Reset Highlights"
        )
      );
    }

    if (staticCxtMenuItems !== undefined) {
      items.push(
        ...staticCxtMenuItems
          .filter((val) => val.showFn === undefined || val.showFn(event))
          .map((val) =>
            createChartCxtMenuItem(
              `${cmpKey.current}-cxt-menu-${val.key}`,
              contextMenuItemSelectWrapper(val.action, event),
              val.renderContent(event)
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
        <Divider key={`${cmpKey.current}-ctx-menu-divider`} variant="middle" />
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

  const createChartCxtMenuItem = (
    key: string,
    action: (...args: any[]) => void,
    content: ReactNode
  ) => {
    return (
      <MenuItem key={key} onClick={action}>
        {content}
      </MenuItem>
    );
  };

  const createNestedChartCxtMenuItem = (
    content: ReactNode,
    key: string,
    children: CxtMenuItem[],
    event: EventObject
  ) => {
    return (
      <NestedMenuItem
        key={`${cmpKey.current}-cxt-menu-${key}`}
        rightIcon={<KeyboardArrowRightIcon />}
        renderLabel={() => content}
        parentMenuOpen={true}
        sx={{ paddingX: "16px" }}
      >
        {children.map((child) =>
          child.children === undefined
            ? createChartCxtMenuItem(
                `${cmpKey.current}-cxt-menu-${child.key}`,
                contextMenuItemSelectWrapper(child.action, event),
                child.renderContent(event)
              )
            : createNestedChartCxtMenuItem(
                child.renderContent(event),
                child.key,
                child.children(event),
                event
              )
        )}
      </NestedMenuItem>
    );
  };

  const handleCxtTapNode = (event: EventObjectNode) => {
    const items = [...getSharedMenuItems(event)];

    if (nodeCxtMenuItems !== undefined) {
      items.push(
        ...nodeCxtMenuItems
          .filter((val) => val.showFn === undefined || val.showFn(event))
          .map((val) =>
            val.children
              ? createNestedChartCxtMenuItem(
                  val.renderContent(event),
                  val.key,
                  val.children(event),
                  event
                )
              : createChartCxtMenuItem(
                  `${cmpKey.current}-cxt-menu-${val.key}`,
                  contextMenuItemSelectWrapper(val.action, event),
                  val.renderContent(event)
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
          .map((val) =>
            createChartCxtMenuItem(
              `${cmpKey.current}-cxt-menu-${val.key}`,
              contextMenuItemSelectWrapper(val.action, event),
              val.renderContent(event)
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
        <WidgetContainer
          key={`${cmpKey.current}-toolbar`}
          sx={{ ...toolbarPosition }}
        >
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
      {legendPosition === undefined ? null : (
        <WidgetContainer
          key={`${cmpKey.current}-legend`}
          sx={{ ...legendPosition }}
        >
          <ChartLegend></ChartLegend>
        </WidgetContainer>
      )}
    </>
  );
}
