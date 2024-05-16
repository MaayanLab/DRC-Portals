import {
  Box,
  IconButton,
  ListItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import {
  EventObject,
  EventObjectEdge,
  EventObjectNode,
  Position,
} from "cytoscape";
import { Record } from "neo4j-driver";
import { ReactNode } from "react";

import {
  NODE_FONT_SIZE,
  MAX_NODE_LABEL_WIDTH,
  NODE_FONT_FAMILY,
  MAX_NODE_LINES,
} from "../constants/cy";
import { ENTITY_STYLES_MAP, NODE_CLASS_MAP } from "../constants/shared";
import {
  CytoscapeEdge,
  CytoscapeNode,
  CytoscapeNodeData,
} from "../interfaces/cy";
import { SubGraph, NodeResult, RelationshipResult } from "../interfaces/neo4j";
import { CytoscapeReference } from "../types/cy";
import { NodeElementFactory } from "../types/shared";

import {
  ENTITY_TO_FACTORY_MAP,
  getNodeDisplayProperty,
  keyInFactoryMapFilter,
  truncateTextToFitWidth,
} from "./shared";

export const createCytoscapeNodeFromNeo4j = (
  node: NodeResult
): CytoscapeNode => {
  const nodeLabel = node.labels[0];
  const nodeDisplayLabel = getNodeDisplayProperty(nodeLabel, node);
  return {
    classes: [NODE_CLASS_MAP.get(nodeLabel) || ""],
    data: {
      id: node.identity.toString(),
      label: truncateLabelToFitNode(nodeDisplayLabel),
      neo4j: {
        labels: node.labels,
        properties: node.properties,
      },
    },
  };
};

export const createCytoscapeEdgeFromNeo4j = (
  relationship: RelationshipResult
): CytoscapeEdge => {
  return {
    data: {
      id: relationship.identity.toString(),
      source: relationship.start.toString(),
      target: relationship.end.toString(),
      label: relationship.type,
      neo4j: {
        type: relationship.type,
        properties: relationship.properties,
      },
    },
  };
};

export const createCytoscapeElementsFromNeo4j = (
  records: Record<SubGraph>[]
) => {
  let nodes: CytoscapeNode[] = [];
  let edges: CytoscapeEdge[] = [];

  records.forEach((record) => {
    record.get("nodes").forEach((node) => {
      nodes.push(createCytoscapeNodeFromNeo4j(node));
    });
    record
      .get("relationships")
      .forEach((relationship) =>
        edges.push(createCytoscapeEdgeFromNeo4j(relationship))
      );
  });

  return [...nodes, ...edges];
};

export const truncateLabelToFitNode = (label: string) => {
  if (/\s/.test(label)) {
    const lines = label.split(/\s+/);
    const originalNumLines = lines.length;

    // If the number of lines would exceed the vertical bound, remove the excess lines
    if (originalNumLines > MAX_NODE_LINES) {
      lines.splice(MAX_NODE_LINES);
    }

    // If any line would exceed the horizontal bound, truncate the label to include everything up until that line, which is itself
    // truncated
    for (let i = 0; i < lines.length; i++) {
      const newLine = truncateTextToFitWidth(
        lines[i],
        MAX_NODE_LABEL_WIDTH,
        NODE_FONT_SIZE,
        NODE_FONT_FAMILY
      );
      if (newLine.length !== lines[i].length) {
        return [...lines.slice(0, i), newLine].join(" ");
      }
    }

    // Note that this might not return exactly the same strings as before the truncation: we split on *any* whitespace above, here
    // we join on simply " ". This should, however, not be noticeable by the user.
    return originalNumLines === lines.length
      ? lines.join(" ")
      : lines.join(" ") + "...";
  } else {
    return truncateTextToFitWidth(
      label,
      MAX_NODE_LABEL_WIDTH,
      NODE_FONT_SIZE,
      NODE_FONT_FAMILY
    );
  }
};

export const createNodeLabels = (labels: string[]) => (
  <Stack direction="row" sx={{ margin: "6px 0px", padding: "3px 7px" }}>
    {labels
      .filter(keyInFactoryMapFilter)
      .map((label) =>
        (ENTITY_TO_FACTORY_MAP.get(label) as NodeElementFactory)(label)
      )}
  </Stack>
);

export const createNodeProperties = (
  properties: { [key: string]: any },
  textProps: any
) => (
  <Stack direction="column">
    {Object.entries(properties).map(([key, val], index) => (
      <div
        key={`prop-${key}-${index}`}
        style={{
          margin: "0px 7px",
          padding: "2px 0px",
        }}
      >
        <Typography {...textProps}>
          <b>{`${key}: `}</b>
          {Array.isArray(val)
            ? val.map((arrItem, arrIdx) => (
                <ListItem
                  key={`prop-${key}-${index}-${arrIdx}`}
                  sx={{ display: "list-item", py: 0 }}
                >
                  {arrItem}
                </ListItem>
              ))
            : val}
        </Typography>
      </div>
    ))}
  </Stack>
);

export const createNodeTooltip = (node: CytoscapeNodeData): ReactNode => {
  if (node.neo4j?.labels && node.neo4j?.properties) {
    const tooltipBorderColor =
      node.neo4j.labels.length === 1
        ? ENTITY_STYLES_MAP.get(NODE_CLASS_MAP.get(node.neo4j.labels[0]) || "")
            ?.backgroundColor
        : "#fff";
    return (
      <Box
        sx={{
          width: "360px",
          height: "auto",
          padding: "7px 6px",
          backgroundColor: "white",
          border: "1px solid",
          borderColor: tooltipBorderColor,
          borderRadius: "4px",
          color: "#000",
        }}
      >
        {createNodeLabels(node.neo4j.labels)}
        {createNodeProperties(node.neo4j.properties, {
          variant: "body2",
          noWrap: true,
        })}
      </Box>
    );
  } else {
    return null;
  }
};

export const highlightNeighbors = (event: EventObjectNode) => {
  const highlightIds = new Set([
    event.target.id(),
    ...event.target.neighborhood().map((neighbor) => neighbor.id()),
  ]);

  event.cy.batch(() => {
    event.cy
      .filter((ele) => highlightIds.has(ele.id()))
      .removeClass("dimmed")
      .addClass("highlight");
  });

  event.cy.batch(() => {
    event.cy.elements().not(".highlight").addClass("dimmed");
  });
};

export const resetHighlights = (event: EventObject) => {
  event.cy.batch(() => {
    event.cy.elements().removeClass("dimmed").removeClass("highlight");
  });
};

export const showElement = (event: EventObjectNode | EventObjectEdge) => {
  event.target.removeClass("dimmed").addClass("highlight");
};

export const hideElement = (event: EventObjectNode | EventObjectEdge) => {
  // We remove hovered here because the node is necessarily hovered when a context menu is opened for it
  event.target.removeClass("highlight hovered").addClass("dimmed");
};

export const resetChart = (
  key: string,
  title: string,
  positions: Map<string, Position>,
  cyRef: CytoscapeReference
) => {
  const fn = () => {
    const cy = cyRef.current;
    if (cy !== undefined) {
      cy.batch(() => {
        // Reset node positions
        cy.nodes().forEach((el) => {
          el.position(positions.get(el.id()) as Position);
        });

        // Reset styles
        cy.elements().removeClass("highlight dimmed");
      });
    }
  };
  return (
    <Tooltip key={key} title={title} arrow>
      <IconButton
        sx={{ borderRadius: 1 }}
        aria-label="reset-chart"
        onClick={fn}
      >
        <RestoreIcon />
      </IconButton>
    </Tooltip>
  );
};
