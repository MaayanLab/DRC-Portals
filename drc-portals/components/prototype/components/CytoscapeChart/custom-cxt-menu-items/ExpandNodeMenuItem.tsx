"use client";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import WarningIcon from "@mui/icons-material/Warning";
import { Box, CircularProgress, Tooltip, Typography } from "@mui/material";
import { ElementDefinition } from "cytoscape";
import { NestedMenuItem } from "mui-nested-menu";
import { Integer } from "neo4j-driver";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

import { META_RELATIONSHIP_TYPES } from "@/components/prototype/constants/neo4j";
import { Direction } from "@/components/prototype/enums/schema-search";
import {
  NodeIncomingRelsResult,
  NodeOutgoingRelsResult,
  SubGraph,
} from "@/components/prototype/interfaces/neo4j";
import { getDriver } from "@/components/prototype/neo4j";
import Neo4jService from "@/components/prototype/services/neo4j";
import { createCytoscapeElementsFromNeo4j } from "@/components/prototype/utils/cy";
import {
  createExpandNodeCypher,
  createNodeIncomingRelsCypher,
  createNodeOutgoingRelsCypher,
} from "@/components/prototype/utils/neo4j";
import {
  createDirectedRelationshipElement,
  createNodeElement,
} from "@/components/prototype/utils/shared";

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
  const neo4jService = new Neo4jService(getDriver());

  const fetchNodeConnections = async () => {
    if (context !== null) {
      const outgoingResults =
        await neo4jService.executeRead<NodeOutgoingRelsResult>(
          createNodeOutgoingRelsCypher(),
          {
            node_id: Number(context.event.target.data("id")),
          }
        );
      const incomingResults =
        await neo4jService.executeRead<NodeIncomingRelsResult>(
          createNodeIncomingRelsCypher(),
          {
            node_id: Number(context.event.target.data("id")),
          }
        );
      setSubMenuItems(
        [
          ...outgoingResults.map((record) => {
            return {
              label: record.get("outgoing_labels")[0],
              type: record.get("outgoing_type"),
              count: Integer.toNumber(record.get("count")),
              direction: Direction.OUTGOING,
            };
          }),
          ...incomingResults.map((record) => {
            return {
              label: record.get("incoming_labels")[0],
              type: record.get("incoming_type"),
              count: Integer.toNumber(record.get("count")),
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
      );
    }
  };

  const expandNode = async (cypher: string) => {
    const records = await neo4jService.executeRead<SubGraph>(cypher, {
      limit: EXPAND_LIMIT,
    });
    return createCytoscapeElementsFromNeo4j(records);
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
      action={(event) => {
        const nodeId = event.target.data("id");
        const cypher = createExpandNodeCypher(nodeId, label, direction, type);
        expandNode(cypher).then((newElements) => {
          setElements((prevElements) => [...prevElements, ...newElements]);
        });
      }}
    ></ChartCxtMenuItem>
  );

  useEffect(() => {
    fetchNodeConnections().then(() => {
      setLoading(false);
    });
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
