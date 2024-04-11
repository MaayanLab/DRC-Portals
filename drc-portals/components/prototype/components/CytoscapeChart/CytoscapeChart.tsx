import {
  ElementDefinition,
  EventObjectNode,
  LayoutOptions,
  Stylesheet,
  use as useCytoscape,
} from "cytoscape";
// @ts-ignore
import cola from "cytoscape-cola";
import { ReactNode, useEffect, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";

import { ChartContainer, ChartTooltip } from "../../constants/cy";
import { CytoscapeNodeData } from "../../interfaces/cy";
import { createNodeTooltip } from "../../utils/cy";

import "./CytoscapeChart.css";

useCytoscape(cola);

interface CytoscapeChartProps {
  elements: ElementDefinition[];
  layout: LayoutOptions;
  stylesheet: string | Stylesheet | Stylesheet[];
}

export default function CytoscapeChart(cytoscapeProps: CytoscapeChartProps) {
  const { elements, layout, stylesheet } = cytoscapeProps;

  const cyRef = useRef<cytoscape.Core>();
  const [hoveredNode, setHoveredNode] = useState<CytoscapeNodeData | null>(
    null
  );
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipTitle, setTooltipTitle] = useState<ReactNode>(null);
  let nodeHoverTimerId: NodeJS.Timeout | null = null;

  const hideTooltip = () => {
    setTooltipOpen(false);
    setTooltipTitle(null);
  };

  const showTooltip = (title: ReactNode) => {
    setTooltipOpen(true);
    setTooltipTitle(title);
  };

  const handleHoverNode = (event: EventObjectNode) => {
    // Note that Cytoscape.js does not support a :hover selector for nodes, so any on-hover styles we want to apply would need to be
    // handled here
    nodeHoverTimerId = setTimeout(() => {
      setHoveredNode(event.target.data());
    }, 200);
  };

  const handleBlurNode = () => {
    if (nodeHoverTimerId !== null) {
      clearTimeout(nodeHoverTimerId);
      nodeHoverTimerId = null;
    }
    setHoveredNode(null);
  };

  const handleGrabNode = () => {
    hideTooltip();
  };

  const handleDragNode = () => {
    hideTooltip();
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
      cy.bind("grab", "node", handleGrabNode);
      cy.bind("drag", "node", handleDragNode);
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
      </ChartContainer>
    </ChartTooltip>
  );
}
