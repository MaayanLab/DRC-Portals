"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import type { SxProps, Theme } from "@mui/material/styles";
import cytoscape from "cytoscape";

import CytoscapeContainer from "./CytoscapeContainer";
import CytoscapeContextMenu, {
  type ExpandNodeActionPayload,
} from "./CytoscapeContextMenu";
import CytoscapeInfoDrawer, {
  CYTOSCAPE_INFO_DRAWER_WIDTH,
} from "./CytoscapeInfoDrawer";
import CytoscapeLegend from "./CytoscapeLegend";
import CytoscapeToolbar from "./CytoscapeToolbar";
import { buildOverviewFromElements } from "@/lib/text2cypher/cytoscape/element-aggregation";
import {
  type CytoscapeSelectedNode,
  type CytoscapeSelectedRelationship,
  useCytoscapeInteractionEvents,
} from "@/lib/text2cypher/cytoscape/interaction-events";
import {
  isFcoseLayoutOptions,
  type CytoscapeLayoutOptions,
} from "@/lib/text2cypher/cytoscape/types";

const TOOLBAR_OPEN_INSET = 4;

function getIncrementalLayoutOptions(
  layout: CytoscapeLayoutOptions,
): CytoscapeLayoutOptions {
  if (!isFcoseLayoutOptions(layout)) {
    return layout;
  }

  return {
    ...layout,
    fit: false,
    randomize: false,
    animate: false,
  };
}

interface CytoscapeChartWrapperProps {
  elements: cytoscape.ElementDefinition[];
  layout: CytoscapeLayoutOptions;
  stylesheet:
  | string
  | cytoscape.StylesheetJsonBlock
  | cytoscape.StylesheetJsonBlock[]
  | undefined;
  style?: React.CSSProperties;
  paperSx?: SxProps<Theme>;
  showLegend?: boolean;
  showToolbar?: boolean;
  showDrawer?: boolean;
  showContextMenu?: boolean;
  onExpandNode?: (payload: ExpandNodeActionPayload) => Promise<void> | void;
  onContextMenuWarning?: (message: string) => void;
  isExpandingNode?: boolean;
  expandDepth?: number;
}

export default function CytoscapeChartWrapper({
  elements,
  layout,
  stylesheet,
  style,
  paperSx,
  showLegend = true,
  showToolbar = true,
  showDrawer = true,
  showContextMenu = true,
  onExpandNode,
  onContextMenuWarning,
  isExpandingNode = false,
  expandDepth = 1,
}: CytoscapeChartWrapperProps) {
  const cyRef = useRef<cytoscape.Core | undefined>(undefined);
  const hasInitializedLayoutRef = useRef(false);
  const previousNodeIdsRef = useRef<Set<string>>(new Set());
  const activeLayoutRef = useRef<cytoscape.Layouts | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedNode, setSelectedNode] =
    useState<CytoscapeSelectedNode | null>(null);
  const [selectedRelationship, setSelectedRelationship] =
    useState<CytoscapeSelectedRelationship | null>(null);
  const isDrawerOpen = showDrawer && drawerOpen;
  const drawerOverview = useMemo(
    () => buildOverviewFromElements(elements),
    [elements],
  );
  const handleNodeTap = useCallback((node: CytoscapeSelectedNode) => {
    setSelectedNode(node);
    setSelectedRelationship(null);
  }, []);

  const handleRelationshipTap = useCallback(
    (relationship: CytoscapeSelectedRelationship) => {
      setSelectedRelationship(relationship);
      setSelectedNode(null);
    },
    [],
  );

  const handleCanvasTap = useCallback(() => {
    setSelectedNode(null);
    setSelectedRelationship(null);
  }, []);

  useCytoscapeInteractionEvents({
    cyRef,
    onNodeTap: handleNodeTap,
    onRelationshipTap: handleRelationshipTap,
    onCanvasTap: handleCanvasTap,
  });

  const nodeIds = useMemo(() => {
    const ids = new Set<string>();

    elements.forEach((element) => {
      const data = element.data;
      if (data === undefined || typeof data !== "object" || data === null) {
        return;
      }

      const asRecord = data as Record<string, unknown>;
      if (typeof asRecord.id === "string") {
        ids.add(asRecord.id);
      }
    });

    return ids;
  }, [elements]);

  useEffect(() => {
    const cy = cyRef.current;
    if (cy === undefined) {
      return;
    }

    const previousNodeIds = previousNodeIdsRef.current;
    const hadNodes = previousNodeIds.size > 0;
    const hasNewNodes = Array.from(nodeIds).some(
      (id) => !previousNodeIds.has(id),
    );

    previousNodeIdsRef.current = nodeIds;

    if (!hasInitializedLayoutRef.current) {
      hasInitializedLayoutRef.current = true;
      return;
    }

    // Skip relayout on first sync and only rerun when node additions are detected.
    if (!hadNodes || !hasNewNodes) {
      return;
    }

    activeLayoutRef.current?.stop();

    const layoutRun = cy.layout(getIncrementalLayoutOptions(layout));

    activeLayoutRef.current = layoutRun;
    layoutRun.run();
  }, [layout, nodeIds]);

  useEffect(() => {
    return () => {
      activeLayoutRef.current?.stop();
    };
  }, []);

  return (
    <Paper
      variant="outlined"
      sx={{ minHeight: 320, position: "relative", ...paperSx }}
    >
      <CytoscapeContainer
        layout={layout}
        elements={elements}
        stylesheet={stylesheet}
        style={style}
        cyRef={cyRef}
      />

      {showToolbar || showDrawer ? (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            bottom: 8,
            right: 8,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          {showToolbar ? (
            <CytoscapeToolbar
              cyRef={cyRef}
              docked
              sx={{
                position: "absolute",
                bottom: 0,
                right: isDrawerOpen
                  ? CYTOSCAPE_INFO_DRAWER_WIDTH + TOOLBAR_OPEN_INSET
                  : 0,
                pointerEvents: "auto",
                transition: (theme) =>
                  theme.transitions.create("right", {
                    duration: theme.transitions.duration.shortest,
                  }),
              }}
            />
          ) : null}

          {showDrawer ? (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                pointerEvents: "auto",
              }}
            >
              <CytoscapeInfoDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                overview={drawerOverview}
                selectedNode={selectedNode}
                selectedRelationship={selectedRelationship}
              />
            </Box>
          ) : null}
        </Box>
      ) : null}

      {showContextMenu ? (
        <CytoscapeContextMenu
          cyRef={cyRef}
          onNodeContextTap={handleNodeTap}
          onExpandNode={onExpandNode}
          onActionWarning={onContextMenuWarning}
          isExpandingNode={isExpandingNode}
          expandDepth={expandDepth}
        />
      ) : null}

      {showLegend ? (
        <div
          style={{
            position: "absolute",
            left: 8,
            bottom: 8,
            zIndex: 2,
          }}
        >
          <CytoscapeLegend elements={elements} />
        </div>
      ) : null}
    </Paper>
  );
}
