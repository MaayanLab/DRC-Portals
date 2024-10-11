import {
  Box,
  IconButton,
  ListItem,
  Stack,
  Tooltip,
  Typography,
  TypographyProps,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import RadarIcon from "@mui/icons-material/Radar";
import RestoreIcon from "@mui/icons-material/Restore";
import {
  EventObject,
  EventObjectEdge,
  EventObjectNode,
  LayoutOptions,
  NodeSingular,
  Position,
} from "cytoscape";
import { CSSProperties, Fragment, ReactNode } from "react";

import { NodeResult, RelationshipResult, SubGraph } from "@/lib/neo4j/types";

import {
  DEFAULT_TOOLTIP_BOX_STYLE_PROPS,
  DEFAULT_TOOLTIP_CONTENT_PROPS,
  FONT_SIZE,
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
import { CustomToolbarFnFactory, CytoscapeReference } from "../types/cy";
import { NodeElementFactory } from "../types/shared";

import {
  LABEL_TO_FACTORY_MAP,
  downloadBlob,
  getNodeDisplayProperty,
  labelInFactoryMapFilter,
  truncateTextToFitWidth,
} from "./shared";

export const createCytoscapeNode = (
  node: NodeResult,
  classes?: string[],
  usePropForLabel = false
): CytoscapeNode => {
  const nodeLabel = node.labels[0];
  return {
    classes: [NODE_CLASS_MAP.get(nodeLabel) || "", ...(classes || [])],
    data: {
      id: node.uuid,
      label: usePropForLabel
        ? getNodeDisplayProperty(nodeLabel, node)
        : nodeLabel,
      neo4j: {
        labels: node.labels,
        properties: node.properties,
      },
    },
  };
};

export const createCytoscapeEdge = (
  relationship: RelationshipResult,
  classes?: string[]
): CytoscapeEdge => {
  return {
    classes,
    data: {
      id: relationship.uuid,
      source: relationship.startUUID,
      target: relationship.endUUID,
      label: relationship.type,
      neo4j: {
        type: relationship.type,
        properties: relationship.properties,
      },
    },
  };
};

export const createCytoscapeElements = (subgraph: SubGraph) => {
  let nodes: CytoscapeNode[] = [];
  let edges: CytoscapeEdge[] = [];

  subgraph.nodes.forEach((node) => {
    nodes.push(createCytoscapeNode(node));
  });

  subgraph.relationships.forEach((relationship) =>
    edges.push(createCytoscapeEdge(relationship))
  );

  return [...nodes, ...edges];
};

export const getNeo4jLabelFromCyNode = (event: EventObjectNode) => {
  const nodeNeo4jData = event.target.data("neo4j");
  let nodeLabel = "Unknown";

  if (nodeNeo4jData !== undefined && Array.isArray(nodeNeo4jData.labels)) {
    nodeLabel = nodeNeo4jData.labels[0] || "Unknown";
  }

  return nodeLabel;
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
        FONT_SIZE,
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
      FONT_SIZE,
      NODE_FONT_FAMILY
    );
  }
};

export const createNodeLabels = (labels: string[]) => (
  <Stack direction="row" sx={{ margin: "6px 0px", padding: "3px 7px" }}>
    {labels
      .filter(labelInFactoryMapFilter)
      .map((label) =>
        (LABEL_TO_FACTORY_MAP.get(label) as NodeElementFactory)(label)
      )}
  </Stack>
);

export const createNodeProperties = (
  properties: { [key: string]: any },
  textProps?: TypographyProps
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

export const createNodeTooltip = (
  node: CytoscapeNodeData,
  boxStyleProps?: CSSProperties,
  contentProps?: TypographyProps
): ReactNode => {
  if (node.neo4j?.labels && node.neo4j?.properties) {
    const tooltipBorderColor =
      node.neo4j.labels.length === 1
        ? ENTITY_STYLES_MAP.get(NODE_CLASS_MAP.get(node.neo4j.labels[0]) || "")
            ?.backgroundColor
        : "#fff";
    return (
      <Box
        sx={{
          ...DEFAULT_TOOLTIP_BOX_STYLE_PROPS,
          borderColor: tooltipBorderColor,
          ...boxStyleProps,
        }}
      >
        {createNodeLabels(node.neo4j.labels)}
        {createNodeProperties(node.neo4j.properties, {
          ...DEFAULT_TOOLTIP_CONTENT_PROPS,
          ...contentProps,
        })}
      </Box>
    );
  } else {
    return null;
  }
};

export const highlightNeighbors = (event: EventObjectNode) => {
  event.cy.batch(() => {
    event.target.removeClass("transparent").addClass("highlight");
    event.target
      .neighborhood()
      .removeClass("transparent")
      .addClass("highlight");
    event.cy.elements().not(".highlight").addClass("transparent");
  });
};

export const selectNeighbors = (event: EventObjectNode) => {
  event.target.neighborhood().select();
};

export const selectAll = (event: EventObject) => {
  event.cy.elements().select();
};

export const highlightNodesWithLabel = (event: EventObjectNode) => {
  const eventNodeLabels: string[] = event.target.data("neo4j").labels || [];
  event.cy.batch(() => {
    event.cy
      .nodes()
      .filter((node) => {
        const candidateLabels = new Set<string>(
          node.data("neo4j").labels || []
        );
        return (
          [...eventNodeLabels].filter((x) => candidateLabels.has(x)).length > 0
        );
      })
      .removeClass("transparent")
      .addClass("highlight");
    event.cy.elements().not(".highlight").addClass("transparent");
  });
};

export const selectNodesWithLabel = (event: EventObjectNode) => {
  const eventNodeLabels: string[] = event.target.data("neo4j").labels || [];
  event.cy.batch(() => {
    event.cy
      .nodes()
      .filter((node) => {
        const candidateLabels = new Set<string>(
          node.data("neo4j").labels || []
        );
        return (
          [...eventNodeLabels].filter((x) => candidateLabels.has(x)).length > 0
        );
      })
      .select();
  });
};

export const resetHighlights = (event: EventObject) => {
  event.cy.batch(() => {
    event.cy.elements().removeClass("transparent").removeClass("highlight");
  });
};

export const showElement = (event: EventObjectNode | EventObjectEdge) => {
  event.target.removeClass("transparent").addClass("highlight");
};

export const hideElement = (event: EventObjectNode | EventObjectEdge) => {
  // We remove hovered here because the node is necessarily hovered when a context menu is opened for it
  event.target.removeClass("highlight hovered").addClass("transparent");
};

export const showSelection = (event: EventObject) => {
  event.cy
    .elements(":selected")
    .removeClass("transparent")
    .addClass("highlight");
};

export const selectionIsAllShown = (event: EventObject) =>
  Array.from(event.cy.elements(":selected")).every((element) =>
    element.hasClass("highlight")
  );

export const hideSelection = (event: EventObject) => {
  event.cy
    .elements(":selected")
    .removeClass("highlight hovered")
    .addClass("transparent");
};

export const selectionIsAllHidden = (event: EventObject) =>
  Array.from(event.cy.elements(":selected")).every((element) =>
    element.hasClass("transparent")
  );

export const printNodePositions = (
  key: string,
  title: string,
  ariaLabel: string,
  cyRef: CytoscapeReference
) => {
  const action = () => {
    const cy = cyRef.current;
    if (cy !== undefined) {
      cy.nodes().forEach((el) => {
        console.log(el.data("label"), el.position());
      });
    }
  };
  return (
    <Tooltip key={key} title={title} arrow>
      <IconButton aria-label={ariaLabel} onClick={action}>
        <RadarIcon />
      </IconButton>
    </Tooltip>
  );
};

export const resetChart = (
  key: string,
  title: string,
  ariaLabel: string,
  positions: Map<string, Position>,
  cyRef: CytoscapeReference
) => {
  const action = () => {
    const cy = cyRef.current;
    if (cy !== undefined) {
      cy.batch(() => {
        // Reset node positions
        cy.nodes().forEach((el) => {
          el.position(positions.get(el.id()) as Position);
        });

        // Reset styles
        cy.elements().removeClass("highlight transparent");
      });
    }
  };
  return (
    <Tooltip key={key} title={title} arrow>
      <IconButton aria-label={ariaLabel} onClick={action}>
        <RestoreIcon />
      </IconButton>
    </Tooltip>
  );
};

export const isNodeD3Locked = (node: NodeSingular) => {
  const scratch = node.scratch();

  if (scratch["d3-force"] !== undefined) {
    return scratch["d3-force"].fx || scratch["d3-force"].fy;
  } else {
    return false;
  }
};

export const unlockD3ForceNode = (node: NodeSingular) => {
  const scratch = node.scratch();
  delete scratch["d3-force"].fx;
  delete scratch["d3-force"].fy;
  node.scratch(scratch);
};

export const lockD3ForceNode = (node: NodeSingular) => {
  const scratch = node.scratch();
  const { x, y } = node.position();
  node.scratch({
    ...scratch,
    "d3-force": {
      ...scratch["d3-force"],
      fx: x,
      fy: y,
    },
  });
};

export const unlockD3ForceNodes = (
  key: string,
  title: string,
  cyRef: CytoscapeReference,
  layout: LayoutOptions
) => {
  // Note that this is directly manipulating some "under the hood" behavior implemented by the d3-force layout. When the
  // "fixedAfterDragging" option of the layout is set to true, a pair of hidden position properties (fx and fy) are set on nodes after a
  // drag event concludes. These properties are added to the "scratch" data of the node, a feature supported by Cytoscape.js directly. It
  // appears that when this scratch position data exists, the layout will not attempt to move the node. It does not seem there is an
  // alternative method of "unlocking" the nodes after they have been dragged, except perhaps by updating the layout options to set
  // "fixedAfterDragging" to false.
  const action = () => {
    const cy = cyRef.current;
    if (cy !== undefined) {
      cy.nodes().forEach(unlockD3ForceNode);
      cy.layout(layout).run(); // Ensures that the d3-force layout does not stop
    }
  };
  return (
    <Tooltip key={key} title={title} arrow>
      <IconButton aria-label="unlock-nodes" onClick={action}>
        <LockOpenIcon />
      </IconButton>
    </Tooltip>
  );
};

export const lockD3ForceNodes = (
  key: string,
  title: string,
  cyRef: CytoscapeReference,
  layout: LayoutOptions
) => {
  const action = () => {
    const cy = cyRef.current;
    if (cy !== undefined) {
      cy.nodes().forEach(lockD3ForceNode);
      cy.layout(layout).run();
    }
  };
  return (
    <Tooltip key={key} title={title} arrow>
      <IconButton aria-label="lock-nodes" onClick={action}>
        <LockIcon />
      </IconButton>
    </Tooltip>
  );
};

export const unlockSelection = (event: EventObject) =>
  event.cy.nodes(":selected").forEach((node) => unlockD3ForceNode(node));

export const selectionHasLockedNode = (event: EventObject) =>
  Array.from(event.cy.nodes(":selected")).some(isNodeD3Locked);

export const getCyDataForDownload = (cy: cytoscape.Collection) => {
  return {
    nodes: cy.nodes().map((n) => {
      return {
        neo4j_id: n.data("id"),
        ...n.data("neo4j"),
      };
    }),
    edges: cy.edges().map((e) => {
      return {
        neo4j_id: e.data("id"),
        source: e.data("source"),
        target: e.data("target"),
        ...e.data("neo4j"),
      };
    }),
  };
};

export const downloadCyAsJson = (cy: cytoscape.Collection) => {
  const data = getCyDataForDownload(cy);
  const jsonString = JSON.stringify(data);
  downloadBlob(jsonString, "application/json", "c2m2-graph-data.json");
};

export const downloadCyAsPNG = (cy: cytoscape.Core) => {
  const base64URI = cy.png({ bg: "#f2f2f2", scale: 3 });
  const link = document.createElement("a");

  link.href = base64URI;
  link.download = "c2m2-graph-image.png";
  link.click();
};

export const downloadChartData = (
  key: string,
  title: string,
  cyRef: CytoscapeReference
) => {
  const action = () => {
    const cy = cyRef.current;
    if (cy !== undefined) {
      downloadCyAsJson(cy.elements());
    }
  };

  return (
    <Fragment key={key}>
      <Tooltip title={title} arrow>
        <IconButton aria-label="download-data" onClick={action}>
          <FileDownloadIcon />
        </IconButton>
      </Tooltip>
    </Fragment>
  );
};

export const downloadChartPNG = (
  key: string,
  title: string,
  cyRef: CytoscapeReference
) => {
  const action = () => {
    const cy = cyRef.current;
    if (cy !== undefined) {
      downloadCyAsPNG(cy);
    }
  };

  return (
    <Fragment key={key}>
      <Tooltip title={title} arrow>
        <IconButton aria-label="download-png" onClick={action}>
          <PhotoCameraIcon />
        </IconButton>
      </Tooltip>
    </Fragment>
  );
};

export const rotateChart = (
  key: string,
  title: string,
  label: string,
  icon: ReactNode,
  angle: number,
  cyRef: CytoscapeReference,
  layout: LayoutOptions
) => {
  const action = (angle: number) => {
    const cy = cyRef.current;
    if (cy !== undefined && layout !== undefined) {
      const center = { x: cy.width() / 2, y: cy.height() / 2 };
      const rad = angle * (Math.PI / 180); // Convert angle to radians

      cy.batch(() => {
        cy.nodes().forEach((node) => {
          const pos = node.position();
          const x = pos.x - center.x;
          const y = pos.y - center.y;
          const newX = x * Math.cos(rad) - y * Math.sin(rad) + center.x;
          const newY = x * Math.sin(rad) + y * Math.cos(rad) + center.y;

          node.position({ x: newX, y: newY });
          lockD3ForceNode(node);
        });
      });
      cy.layout(layout).run();
    }
  };

  return (
    <Fragment key={key}>
      <Tooltip title={title} arrow>
        <IconButton aria-label={label} onClick={() => action(angle)}>
          {icon}
        </IconButton>
      </Tooltip>
    </Fragment>
  );
};

export const D3_FORCE_TOOLS: CustomToolbarFnFactory[] = [
  (cyRef: CytoscapeReference, layout: LayoutOptions) =>
    unlockD3ForceNodes(
      "search-chart-toolbar-unlock-btn",
      "Unlock All Nodes",
      cyRef,
      layout
    ),
  (cyRef: CytoscapeReference, layout: LayoutOptions) =>
    lockD3ForceNodes(
      "search-chart-toolbar-lock-btn",
      "Lock All Nodes",
      cyRef,
      layout
    ),
];
