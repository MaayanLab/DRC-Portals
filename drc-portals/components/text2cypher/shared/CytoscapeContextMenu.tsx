"use client";

import HubIcon from "@mui/icons-material/Hub";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import CircularProgress from "@mui/material/CircularProgress";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import type { VirtualElement } from "@popperjs/core";
import cytoscape from "cytoscape";
import {
  type CytoscapeSelectedNode,
  type CytoscapeReference,
  toSelectedNode,
} from "@/lib/text2cypher/cytoscape/interaction-events";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ContextMenuActionId = "centerOnNode" | "selectNeighbors" | "expandNode";

export interface ExpandNodeActionPayload {
  nodeId: string;
  nodeLabel: string;
  nodeUuid: string;
  depth: number;
}

interface ContextMenuNode {
  id: string;
  label: string | null;
  data: Record<string, unknown>;
}

interface ContextMenuState {
  mouseX: number;
  mouseY: number;
  node: ContextMenuNode;
}

interface CytoscapeContextMenuProps {
  cyRef: CytoscapeReference;
  onNodeContextTap?: (node: CytoscapeSelectedNode) => void;
  onExpandNode?: (payload: ExpandNodeActionPayload) => Promise<void> | void;
  onActionWarning?: (message: string) => void;
  isExpandingNode?: boolean;
  expandDepth?: number;
}

const getPointerPosition = (
  event: cytoscape.EventObjectNode,
): { mouseX: number; mouseY: number } => {
  const nativeEvent = event.originalEvent;

  if (
    nativeEvent !== undefined &&
    nativeEvent !== null &&
    "clientX" in nativeEvent &&
    "clientY" in nativeEvent
  ) {
    return {
      mouseX: Number(nativeEvent.clientX),
      mouseY: Number(nativeEvent.clientY),
    };
  }

  const cy = event.cy;
  const containerRect = cy.container()?.getBoundingClientRect();
  const renderedPosition = event.renderedPosition;

  if (containerRect !== undefined && renderedPosition !== undefined) {
    return {
      mouseX: containerRect.left + renderedPosition.x,
      mouseY: containerRect.top + renderedPosition.y,
    };
  }

  return { mouseX: 0, mouseY: 0 };
};

const normalizeNodeData = (value: unknown): Record<string, unknown> => {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return {};
};

const readNodeUuid = (nodeData: Record<string, unknown>): string => {
  if (typeof nodeData._uuid === "string" && nodeData._uuid.trim()) {
    return nodeData._uuid.trim();
  }

  const properties = normalizeNodeData(nodeData.properties);
  if (typeof properties._uuid === "string" && properties._uuid.trim()) {
    return properties._uuid.trim();
  }

  return "";
};

export default function CytoscapeContextMenu({
  cyRef,
  onNodeContextTap,
  onExpandNode,
  onActionWarning,
  isExpandingNode = false,
  expandDepth = 1,
}: CytoscapeContextMenuProps) {
  // `menuState` controls both visibility and the current retargeted node context.
  const [menuState, setMenuState] = useState<ContextMenuState | null>(null);
  const menuPaperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frameId: number | null = null;
    let unbind: (() => void) | null = null;

    const bindEvents = () => {
      const cy = cyRef.current;
      if (cy === undefined) {
        frameId = window.requestAnimationFrame(bindEvents);
        return;
      }

      const handleNodeContextMenu = (event: cytoscape.EventObjectNode) => {
        // A new right-click always replaces the existing state so the menu retargets in place.
        const position = getPointerPosition(event);
        const node = event.target;
        const data = normalizeNodeData(node.data());
        const label = typeof data.label === "string" ? data.label : null;

        onNodeContextTap?.(toSelectedNode(event));

        setMenuState({
          mouseX: position.mouseX,
          mouseY: position.mouseY,
          node: {
            id: node.id(),
            label,
            data,
          },
        });
      };

      const suppressBrowserContextMenu = (event: Event) => {
        event.preventDefault();
      };

      cy.on("cxttap", "node", handleNodeContextMenu);
      cy.container()?.addEventListener(
        "contextmenu",
        suppressBrowserContextMenu,
      );

      unbind = () => {
        cy.off("cxttap", "node", handleNodeContextMenu);
        cy.container()?.removeEventListener(
          "contextmenu",
          suppressBrowserContextMenu,
        );
      };
    };

    bindEvents();

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      unbind?.();
    };
  }, [cyRef, onNodeContextTap]);

  const selectedNode = menuState?.node ?? null;

  const handleClose = useCallback(() => {
    // Closing clears the current anchor and node context.
    setMenuState(null);
  }, []);

  // The Popper stays mounted only while a node context is active.
  const menuOpen = menuState !== null;

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleDocumentMouseDown = (event: MouseEvent) => {
      // Left-click outside closes the menu; right-click is left alone so Cytoscape can retarget.
      if (event.button !== 0) {
        return;
      }

      const menuPaper = menuPaperRef.current;
      const target = event.target;

      if (menuPaper === null || !(target instanceof Node)) {
        return;
      }

      if (!menuPaper.contains(target)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, [handleClose, menuOpen]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Escape should close the open menu even if focus moved away during retargeting.
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      handleClose();
    };

    window.addEventListener("keydown", handleGlobalKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [handleClose, menuOpen]);

  const anchorEl = useMemo<VirtualElement | null>(() => {
    if (menuState === null) {
      return null;
    }

    // Anchor the Popper at the exact right-click coordinates.
    const x = menuState.mouseX;
    const y = menuState.mouseY;

    return {
      getBoundingClientRect: () => {
        return new DOMRect(x, y, 0, 0);
      },
    };
  }, [menuState]);

  const actions = useMemo(
    () => [
      {
        id: "centerOnNode" as ContextMenuActionId,
        label: "Center on node",
        icon: <MyLocationIcon fontSize="small" />,
      },
      {
        id: "selectNeighbors" as ContextMenuActionId,
        label: "Select Neighbors",
        icon: <SelectAllIcon fontSize="small" />,
      },
      ...(onExpandNode
        ? [
          {
            id: "expandNode" as ContextMenuActionId,
            label: isExpandingNode ? "Expanding..." : "Expand",
            icon: isExpandingNode ? (
              <CircularProgress size={16} thickness={5} color="inherit" />
            ) : (
              <HubIcon fontSize="small" />
            ),
          },
        ]
        : []),
    ],
    [isExpandingNode, onExpandNode],
  );

  const runAction = useCallback(
    async (actionId: ContextMenuActionId) => {
      const cy = cyRef.current;
      const node = selectedNode;

      if (node === null) {
        handleClose();
        return;
      }

      if (actionId === "centerOnNode" && cy !== undefined) {
        const cyNode = cy.getElementById(node.id);
        if (cyNode.nonempty()) {
          cy.animate(
            {
              center: { eles: cyNode },
            },
            {
              duration: 250,
            },
          );
        }
      }

      if (actionId === "selectNeighbors" && cy !== undefined) {
        const cyNode = cy.getElementById(node.id);

        if (cyNode.nonempty()) {
          const selection = cyNode.union(cyNode.neighborhood());

          cy.$(":selected").unselect();
          selection.select();
        }
      }

      if (actionId === "expandNode") {
        if (isExpandingNode) {
          handleClose();
          return;
        }

        const nodeUuid = readNodeUuid(node.data);

        if (!nodeUuid) {
          onActionWarning?.(
            "Cannot expand this node because it does not include a _uuid property.",
          );
          handleClose();
          return;
        }

        const nodeLabel =
          typeof node.data.label === "string" ? node.data.label : "";

        try {
          await onExpandNode?.({
            nodeLabel,
            nodeId: node.id,
            nodeUuid,
            depth: expandDepth,
          });
        } catch (error) {
          console.warn("[CytoscapeContextMenu] expand failed", error);
        }
      }

      handleClose();
    },
    [
      cyRef,
      expandDepth,
      handleClose,
      isExpandingNode,
      onActionWarning,
      onExpandNode,
      selectedNode,
    ],
  );

  return (
    <Popper
      open={menuOpen}
      anchorEl={anchorEl}
      placement="bottom-start"
      //   strategy="fixed"
      modifiers={[
        {
          name: "offset",
          options: {
            offset: [0, 4],
          },
        },
      ]}
      sx={{ zIndex: 1600 }}
    >
      <Paper
        ref={menuPaperRef}
        sx={{
          minWidth: 200,
        }}
      >
        <MenuList autoFocusItem={menuOpen} dense>
          {actions.map((action) => (
            <MenuItem
              key={action.id}
              disabled={action.id === "expandNode" && isExpandingNode}
              onClick={() => {
                void runAction(action.id);
              }}
            >
              <ListItemIcon>{action.icon}</ListItemIcon>
              <ListItemText>{action.label}</ListItemText>
            </MenuItem>
          ))}
        </MenuList>
      </Paper>
    </Popper>
  );
}
