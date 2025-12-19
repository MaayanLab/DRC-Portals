"use client";

import ErrorIcon from "@mui/icons-material/Error";
import HubIcon from "@mui/icons-material/Hub";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import WarningIcon from "@mui/icons-material/Warning";
import { Box, CircularProgress, Tooltip } from "@mui/material";
import { EventObject, EventObjectNode } from "cytoscape";
import { NestedMenuItem } from "mui-nested-menu";
import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ConnectionMenuItem } from "@/components/prototype/interfaces/pathway-search";
import { PathwaySearchElement } from "@/components/prototype/types/pathway-search";
import { createTree } from "@/components/prototype/utils/pathway-search";
import {
  createDirectedRelationshipElement,
  createNodeElement,
} from "@/components/prototype/utils/shared";
import { getCxtMenuItemOpenState } from "@/components/prototype/utils/cxt-menu";
import { fetchPathwaySearchConnections } from "@/lib/neo4j/api";
import { Direction } from "@/lib/neo4j/enums";
import { PathwayConnectionsResult } from "@/lib/neo4j/types";

import { ChartCxtMenuContext } from "../ChartCxtMenuContext";
import ChartCxtMenuItem from "../ChartCxtMenuItem";

interface AddConnectionMenuItemProps {
  id: string;
  elements: PathwaySearchElement[];
  onConnectionSelected: (
    item: ConnectionMenuItem,
    event: EventObjectNode
  ) => void;
  showFn?: (event: EventObject) => boolean;
}

export default function AddConnectionMenuItem(
  cmpProps: AddConnectionMenuItemProps
) {
  const context = useContext(ChartCxtMenuContext);

  if (context === null) {
    return null;
  } else {
    const { id, elements, onConnectionSelected, showFn } = cmpProps;
    const [loading, setLoading] = useState(false);
    const [getConnectionsError, setGetConnectionsError] =
      useState<boolean>(false);
    const [subMenuItems, setSubMenuItems] = useState<ReactNode[]>([]);
    const [gotConnections, setGotConnections] = useState(false);
    const abortControllerRef = useRef(new AbortController());
    const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
    const showItem = useRef(
      // Capture the initial value `showFn`, this prevents the menu from prematurely re-rendering elements if the upstream state changed as a
      // result of, for example, closing the menu
      (showFn === undefined || showFn(context.event))
    );

    const rightIcon = useMemo(() => {
      if (loading) {
        return (
          <CircularProgress aria-label="loading" color="inherit" size={20} />
        );
      } else if (getConnectionsError) {
        return (
          <Tooltip title="An error occurred fetching expand options">
            <ErrorIcon aria-label="error" color="error" />
          </Tooltip>
        );
      } else if (gotConnections) {
        return subMenuItems.length === 0 ? (
          <Tooltip title="Node has no expand options">
            <WarningIcon aria-label="warning" color="warning" />
          </Tooltip>
        ) : (
          <KeyboardArrowRightIcon aria-label="show-all-rels" />
        );
      } else {
        return null;
      }
    }, [loading, getConnectionsError, subMenuItems, gotConnections]);

    const getConnectionItemId = (item: ConnectionMenuItem) => `${item.type}-${item.direction}-${item.label}`

    const setConnectionOptions = useCallback(
      async (nodeId: string) => {
        const controller = abortControllerRef.current;
        const signal = controller.signal;

        setLoading(true);
        setGetConnectionsError(false);

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
          const items: ConnectionMenuItem[] = data.connectedEdges
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
            .filter((v): v is Exclude<typeof v, undefined> => v !== undefined)

          // Since these items didn't exist previously, signal to the parent to add them to the tree
          context.updateTreeItem({
            id,
            open: true,
            children: items.map(item => {
              return {
                id: getConnectionItemId(item),
                children: [],
                open: false,
              }
            })
          })
          setSubMenuItems(items.map(createConnectionMenuItem));
        } catch (error) {
          if (!signal.aborted) {
            setGetConnectionsError(true);
          }
        } finally {
          setGotConnections(true);

          // This check should only be meaningful when strict mode is enabled: there is a race condition between the two runs of the effect
          // below where the loading state can be erroneously set to false. Normally when `signal` is aborted we are unmounting the
          // component because the menu was closed, so we don't need to update loading state. But when it's unmounted as a result of
          // duplicate renders, the race condition is created.
          if (!signal.aborted) {
            setLoading(false);
          }
        }
      },
      [id, elements]
    );

    const createConnectionMenuItem = useCallback(
      (item: ConnectionMenuItem) => {
        const id = getConnectionItemId(item);
        return (
          <ChartCxtMenuItem
            id={id}
            key={id}
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
            action={(event) => onConnectionSelected(item, event)}
          ></ChartCxtMenuItem>
        )
      },
      [onConnectionSelected]
    );

    const onMenuClicked = useCallback(() => {
      if (context !== null) {
        setConnectionOptions(context.event.target.data("id"));
      }
    }, [context]);

    const handleMouseEnter = () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }

      context.onItemEnter(id)
    }

    const handleMouseLeave = () => {
      if (!context.suppressLeaveItem) {
        context.suppressLeaveItem = true;
        const timer = setTimeout(() => {
          context.onItemLeave(id);
          context.suppressLeaveItem = false;
        }, 200); // adjust delay as needed
        closeTimerRef.current = timer;
      }
    };

    useEffect(() => {
      return () => {
        const controller = abortControllerRef.current;
        controller.abort("Cancelling connections request.");

        // This may seem unnecessary, and in production mode it is. However in dev mode, the extra render caused by `reactStrictMode` means
        // we need to reset the abort controller so that the abort call above doesn't carry over into the state of the new render.
        abortControllerRef.current = new AbortController();
      };
    }, []);

    return showItem.current ? (
      <NestedMenuItem
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onMenuClicked}
        rightIcon={rightIcon}
        renderLabel={() => (
          <Box sx={{ display: "flex", marginRight: 1 }}>
            <HubIcon sx={{ color: "#6f6e77", marginRight: 1 }} />
            Expand
          </Box>
        )}
        MenuProps={{
          onMouseEnter: () => {
            if (closeTimerRef.current) {
              clearTimeout(closeTimerRef.current);
              closeTimerRef.current = null;
            }
          },
          open: getCxtMenuItemOpenState(context.tree, context.hoveredItemId, id) && subMenuItems.length > 0,
          transitionDuration: 0
        }} // The length check is a kludge to make sure an empty submenu isn't shown
        parentMenuOpen={context.open}
        sx={{ paddingX: "16px" }}

      >
        {subMenuItems}
      </NestedMenuItem>
    ) : null;
  }
}
