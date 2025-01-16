"use client";

import ErrorIcon from "@mui/icons-material/Error";
import HubIcon from "@mui/icons-material/Hub";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Box, CircularProgress } from "@mui/material";
import { NestedMenuItem } from "mui-nested-menu";
import { useCallback, useContext, useEffect, useState } from "react";

import { ConnectionMenuItem } from "@/components/prototype/interfaces/pathway-search";
import { PathwaySearchElement } from "@/components/prototype/types/pathway-search";
import { createTree } from "@/components/prototype/utils/pathway-search";
import {
  createDirectedRelationshipElement,
  createNodeElement,
} from "@/components/prototype/utils/shared";
import { fetchPathwaySearchConnections } from "@/lib/neo4j/api";
import { Direction } from "@/lib/neo4j/enums";
import { PathwayConnectionsResult } from "@/lib/neo4j/types";

import { ChartCxtMenuContext } from "../ChartCxtMenuContext";
import ChartCxtMenuItem from "../ChartCxtMenuItem";

interface AddConnectionMenuItemProps {
  elements: PathwaySearchElement[];
  onConnectionSelected: (item: ConnectionMenuItem) => void;
}

export default function AddConnectionMenuItem(
  cmpProps: AddConnectionMenuItemProps
) {
  const { elements, onConnectionSelected } = cmpProps;
  const [loading, setLoading] = useState(false);
  const [getConnectionsError, setGetConnectionsError] =
    useState<boolean>(false);
  const [subMenuItems, setSubMenuItems] = useState<ConnectionMenuItem[]>([]);
  const context = useContext(ChartCxtMenuContext);

  const getRightIcon = useCallback(() => {
    if (loading) {
      return (
        <CircularProgress aria-label="loading" color="inherit" size={20} />
      );
    } else if (getConnectionsError) {
      return <ErrorIcon aria-label="error" color="error" />;
    } else if (subMenuItems.length > 0) {
      return <KeyboardArrowRightIcon aria-label="show-all-rels" />;
    } else {
      return null;
    }
  }, [loading, getConnectionsError]);

  const setConnectionOptions = useCallback(
    async (nodeId: string, signal: AbortSignal) => {
      setLoading(true);
      try {
        const tree = createTree(elements);
        const btoaTree = btoa(JSON.stringify(tree));

        const response = await fetchPathwaySearchConnections(
          btoaTree,
          [nodeId],
          { signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: PathwayConnectionsResult = await response.json();
        const nodeMap = new Map<string, string>(
          data.connectedNodes.map((node) => [node.id, node.label])
        );

        setSubMenuItems(
          data.connectedEdges
            .sort((a, b) => {
              if (
                a.direction === Direction.OUTGOING &&
                b.direction === Direction.INCOMING
              ) {
                return -1;
              } else if (
                a.direction === Direction.INCOMING &&
                b.direction === Direction.OUTGOING
              ) {
                return 1;
              } else {
                return 0;
              }
            })
            .map((edge) => {
              if (edge.source === nodeId) {
                const nodeLabel = nodeMap.get(edge.target);
                if (nodeLabel === undefined) {
                  console.warn(
                    `Could not find node match for edge target id "${edge.target}" for edge with id "${edge.id}"`
                  );
                  return undefined;
                } else {
                  return {
                    nodeId: edge.target,
                    label: nodeLabel,
                    edgeId: edge.id,
                    type: edge.type,
                    source: edge.source,
                    target: edge.target,
                    direction: edge.direction,
                  };
                }
              } else {
                const nodeLabel = nodeMap.get(edge.source);
                if (nodeLabel === undefined) {
                  console.warn(
                    `Could not find node match for edge source id "${edge.source}" for edge with id "${edge.id}"`
                  );
                  return undefined;
                } else {
                  return {
                    nodeId: edge.source,
                    label: nodeLabel,
                    edgeId: edge.id,
                    type: edge.type,
                    source: edge.source,
                    target: edge.target,
                    direction: edge.direction,
                  };
                }
              }
            })
            .filter((v) => v !== undefined)
        );
      } catch (error) {
        if (!signal.aborted) {
          setGetConnectionsError(true);
        }
      } finally {
        // This check should only be meaningful when strict mode is enabled: there is a race condition between the two runs of the effect
        // below where the loading state can be erroneously set to false. Normally when `signal` is aborted we are unmounting the
        // component because the menu was closed, so we don't need to update loading state. But when it's unmounted as a result of
        // duplicate renders, the race condition is created.
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [elements]
  );

  const createConnectionMenuItem = useCallback(
    (item: ConnectionMenuItem) => (
      <ChartCxtMenuItem
        key={`${item.type}-${item.direction}-${item.label}`}
        renderContent={(event) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Box sx={{ display: "flex" }}>
              <Box>
                {createDirectedRelationshipElement(item.type, item.direction)}
              </Box>
              <Box>{createNodeElement(item.label)}</Box>
            </Box>
          </Box>
        )}
        action={(event) => onConnectionSelected(item)}
      ></ChartCxtMenuItem>
    ),
    [onConnectionSelected]
  );

  useEffect(() => {
    if (context !== null) {
      const controller = new AbortController();
      const signal = controller.signal;

      setConnectionOptions(context.event.target.data("id"), signal);

      return () => {
        controller.abort("Cancelling connections request.");
      };
    }
  }, []);

  return context !== null ? (
    <NestedMenuItem
      disabled={subMenuItems.length === 0}
      rightIcon={getRightIcon()}
      renderLabel={() => (
        <Box sx={{ display: "flex", marginRight: 1 }}>
          <HubIcon sx={{ color: "#6f6e77", marginRight: 1 }} />
          Expand
        </Box>
      )}
      parentMenuOpen={context.open}
      sx={{ paddingX: "16px" }}
    >
      {subMenuItems.length > 0
        ? subMenuItems.map(createConnectionMenuItem)
        : null}
    </NestedMenuItem>
  ) : null;
}
