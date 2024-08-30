"use client";

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

import { META_RELATIONSHIP_TYPES } from "@/components/prototype/constants/neo4j";
import { Direction } from "@/components/prototype/enums/schema-search";
import { SubGraph } from "@/components/prototype/interfaces/neo4j";
import { createCytoscapeElementsFromSubGraph } from "@/components/prototype/utils/cy";
import {
  createDirectedRelationshipElement,
  createNodeElement,
} from "@/components/prototype/utils/shared";
import { fetchAllNodeRels, fetchExpandNode } from "@/lib/neo4j/api";
import { NodeAllRelsResults } from "@/lib/neo4j/interfaces";

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
}

export default function ExpandNodeMenuItem(cmpProps: ExpandNodeMenuItemProps) {
  const { setElements } = cmpProps;
  const [loading, setLoading] = useState(true);
  const [subMenuItems, setSubMenuItems] = useState<ConnectionMenuItemProps[]>(
    []
  );
  const context = useContext(ChartCxtMenuContext);

  const expandNode = (
    nodeId: string,
    label: string,
    direction: string,
    type: string
  ) => {
    fetchExpandNode(nodeId, label, direction, type, EXPAND_LIMIT)
      .then((response) => response.json())
      .then((data: SubGraph) =>
        setElements((prevElements) => [
          ...prevElements,
          ...createCytoscapeElementsFromSubGraph(data),
        ])
      )
      .catch((reason) => console.error(reason)); // TODO: Should add some visual indication of failure, perhaps a snackbar?
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
      .catch((reason) => console.error(reason)) // TODO: Should add some visual indication of failure, perhaps an icon next to the expand option?
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
      rightIcon={
        loading ? (
          <CircularProgress color="inherit" size={20} />
        ) : (
          <KeyboardArrowRightIcon />
        )
      }
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
