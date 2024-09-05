"use client";

import ErrorIcon from "@mui/icons-material/Error";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import WarningIcon from "@mui/icons-material/Warning";
import { Box, CircularProgress, Tooltip, Typography } from "@mui/material";
import { ElementDefinition } from "cytoscape";
import { NestedMenuItem } from "mui-nested-menu";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

import { createCytoscapeElements } from "@/components/prototype/utils/cy";
import {
  createDirectedRelationshipElement,
  createNodeElement,
} from "@/components/prototype/utils/shared";
import { fetchAllNodeRels, fetchExpandNode } from "@/lib/neo4j/api";
import { META_RELATIONSHIP_TYPES } from "@/lib/neo4j/constants";
import { Direction } from "@/lib/neo4j/enums";
import { NodeAllRelsResults, SubGraph } from "@/lib/neo4j/types";

import { ChartCxtMenuContext } from "../ChartCxtMenuContext";
import ChartCxtMenuItem from "../ChartCxtMenuItem";

const EXPAND_LIMIT = 10;

interface ConnectionMenuItemProps {
  type: string;
  direction: Direction;
  label: string;
  count: number;
}

interface ExpandNodeMenuItemProps {
  setElements: Dispatch<SetStateAction<ElementDefinition[]>>;
  onError: (error: string) => void;
}

export default function ExpandNodeMenuItem(cmpProps: ExpandNodeMenuItemProps) {
  const { setElements, onError } = cmpProps;
  const [loading, setLoading] = useState(true);
  const [allRelsError, setAllRelsError] = useState<string | null>(null);
  const [subMenuItems, setSubMenuItems] = useState<ConnectionMenuItemProps[]>(
    []
  );
  const context = useContext(ChartCxtMenuContext);

  const getRightIcon = () => {
    if (loading) {
      return (
        <CircularProgress aria-label="loading" color="inherit" size={20} />
      );
    } else if (allRelsError) {
      return <ErrorIcon aria-label="error" color="error" />;
    } else {
      return <KeyboardArrowRightIcon aria-label="show-all-rels" />;
    }
  };

  const expandNode = async (
    nodeId: string,
    label: string,
    direction: string,
    type: string
  ) => {
    try {
      const response = await fetchExpandNode(
        nodeId,
        label,
        direction,
        type,
        EXPAND_LIMIT
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: SubGraph = await response.json();
      setElements((prevElements) => [
        ...prevElements,
        ...createCytoscapeElements(data),
      ]);
    } catch (error) {
      onError("An error occurred expanding the node. Please try again later.");
    }
  };

  const setExpandOptions = (nodeId: string) => {
    fetchAllNodeRels(nodeId)
      .then((response) => response.json())
      .then((data: NodeAllRelsResults) =>
        setSubMenuItems(
          [
            ...data.outgoing.map((record) => {
              return {
                label: record.outgoingLabels[0],
                type: record.outgoingType,
                count: record.count,
                direction: Direction.OUTGOING,
              };
            }),
            ...data.incoming.map((record) => {
              return {
                label: record.incomingLabels[0],
                type: record.incomingType,
                count: record.count,
                direction: Direction.INCOMING,
              };
            }),
          ]
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
            .filter(
              (result) =>
                !Array.from(META_RELATIONSHIP_TYPES).includes(result.type)
            )
        )
      )
      .catch((reason) => setAllRelsError(reason))
      .finally(() => setLoading(false));
  };

  const createConnectionMenuItem = (
    type: string,
    direction: Direction,
    label: string,
    count: number
  ) => (
    <ChartCxtMenuItem
      key={`${type}-${direction}-${label}`}
      renderContent={(event) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex" }}>
            <Box>{createDirectedRelationshipElement(type, direction)}</Box>
            <Box>{createNodeElement(label)}</Box>
          </Box>
          <Typography sx={{ marginLeft: 1 }}>({count})</Typography>
          {count > EXPAND_LIMIT ? (
            <Tooltip
              title={`Only the first ${EXPAND_LIMIT} results will be displayed.`}
              placement="top"
              arrow
            >
              <Box sx={{ marginLeft: 1 }}>
                <WarningIcon color="warning" />
              </Box>
            </Tooltip>
          ) : null}
        </Box>
      )}
      action={(event) =>
        expandNode(event.target.data("id"), label, direction, type)
      }
    ></ChartCxtMenuItem>
  );

  useEffect(() => {
    if (context !== null) {
      setExpandOptions(context.event.target.data("id"));
    }
  }, []);

  return context !== null ? (
    <NestedMenuItem
      disabled={subMenuItems.length === 0}
      rightIcon={getRightIcon()}
      renderLabel={() => "Expand"}
      parentMenuOpen={context.open}
      sx={{ paddingX: "16px" }}
    >
      {subMenuItems.length > 0
        ? subMenuItems.map((props: ConnectionMenuItemProps) =>
            createConnectionMenuItem(
              props.type,
              props.direction,
              props.label,
              props.count
            )
          )
        : null}
    </NestedMenuItem>
  ) : null;
}
