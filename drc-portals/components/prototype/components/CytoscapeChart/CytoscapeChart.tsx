import { ClickAwayListener, Divider, Menu, MenuItem } from "@mui/material";
import {
  ElementDefinition,
  EventObject,
  EventObjectEdge,
  EventObjectNode,
  LayoutOptions,
  Stylesheet,
  use as useCytoscape,
} from "cytoscape";
// @ts-ignore
import cola from "cytoscape-cola";
import { ReactNode, useEffect, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { v4 } from "uuid";

import { ChartContainer, ChartTooltip } from "../../constants/cy";
import { CytoscapeNodeData } from "../../interfaces/cy";
import {
  createNodeTooltip,
  highlightNeighbors,
  resetHighlights,
} from "../../utils/cy";

import "./CytoscapeChart.css";

useCytoscape(cola);

interface CytoscapeChartProps {
  elements: ElementDefinition[];
  layout: LayoutOptions;
  stylesheet: string | Stylesheet | Stylesheet[];
}

export default function CytoscapeChart(cytoscapeProps: CytoscapeChartProps) {
  const cmpKey = v4();
  const { elements, layout, stylesheet } = cytoscapeProps;

  const cyRef = useRef<cytoscape.Core>();
  const [hoveredNode, setHoveredNode] = useState<CytoscapeNodeData | null>(
    null
  );
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipTitle, setTooltipTitle] = useState<ReactNode>(null);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [contextMenuItems, setContextMenuItems] = useState<JSX.Element[]>([]);
  let nodeHoverTimerId: NodeJS.Timeout | null = null;

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const contextMenuItemSelectWrapper = (fn: Function, ...args: any[]) => {
    return () => {
      fn(...args);
      handleContextMenuClose();
    };
  };

  const getStaticMenuItems = (event: EventObject) => {
    return [
      <MenuItem
        key={`${cmpKey}-static-ctx-menu-0`}
        onClick={contextMenuItemSelectWrapper(resetHighlights, event)}
      >
        Reset Highlights
      </MenuItem>,
    ];
  };

  const handleContextMenu = (event: EventObject, menuItems: JSX.Element[]) => {
    event.originalEvent.preventDefault();
    setContextMenuItems([...menuItems, ...getStaticMenuItems(event)]);
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.originalEvent.clientX + 2,
            mouseY: event.originalEvent.clientY - 6,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null
    );
  };

  const hideTooltip = () => {
    setTooltipOpen(false);
    setTooltipTitle(null);
  };

  const showTooltip = (title: ReactNode) => {
    setTooltipOpen(true);
    setTooltipTitle(title);
  };

  const handleTooltipClickAway = () => {
    setTooltipOpen(false);
  };

  const handleHoverNode = (event: EventObjectNode) => {
    event.target.addClass("hovered");

    // Note that Cytoscape.js does not support a :hover selector for nodes, so any on-hover styles we want to apply would need to be
    // handled here
    nodeHoverTimerId = setTimeout(() => {
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
    const nodeCxtMenuItems = [
      <MenuItem
        key={`${cmpKey}-node-ctx-menu-0`}
        onClick={contextMenuItemSelectWrapper(highlightNeighbors, event)}
      >
        Highlight Neighbors
      </MenuItem>,
      <Divider key={`${cmpKey}-node-ctx-menu-divider`} variant="middle" />,
    ];

    handleContextMenu(event, nodeCxtMenuItems);
    cxtTapHandleSelectState(event);
  };

  const handleCxtTapEdge = (event: EventObjectEdge) => {
    handleContextMenu(event, []);
    cxtTapHandleSelectState(event);
  };

  const handleCxtTapCanvas = (event: EventObject) => {
    // Note that everything preceding the if-block will trigger on *any* cxtTap event, allowing us to set some shared behavior
    hideTooltip();

    if (event.target === cyRef.current) {
      handleContextMenu(event, []);
      cxtTapHandleSelectState(event);
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
      showTooltip(createNodeTooltip(hoveredNode));
    }
  }, [hoveredNode]);

  return (
    <ClickAwayListener onClickAway={handleTooltipClickAway}>
      <ChartTooltip
        followCursor
        title={tooltipTitle}
        open={tooltipOpen}
        placement="right-start"
        TransitionProps={{ exit: false }} // Immediately close the tooltip, don't transition
      >
        <ChartContainer variant="outlined">
          <CytoscapeComponent
            className="cy"
            cy={(cy) => (cyRef.current = cy)}
            elements={elements}
            layout={layout}
            stylesheet={stylesheet}
          />
          <Menu
            open={contextMenu !== null && contextMenuItems.length > 0}
            onClose={handleContextMenuClose}
            anchorReference="anchorPosition"
            anchorPosition={
              contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }
          >
            {contextMenuItems}
          </Menu>
        </ChartContainer>
      </ChartTooltip>
    </ClickAwayListener>
  );
}
