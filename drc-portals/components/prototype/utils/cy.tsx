import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {
  Box,
  IconButton,
  ListItem,
  Stack,
  Tooltip,
  Typography,
  TypographyProps,
} from "@mui/material";
import {
  Core,
  EventObject,
  EventObjectEdge,
  EventObjectNode,
  NodeSingular,
} from "cytoscape";
import { CSSProperties, Fragment, ReactNode } from "react";

import {
  BIOSAMPLE_RELATED_LABELS,
  DCC_LABEL,
  FILE_RELATED_LABELS,
  ID_NAMESPACE_LABEL,
  SUBJECT_RELATED_LABELS,
  TERM_LABELS,
} from "@/lib/neo4j/constants";
import {
  NodeResult,
  PathwaySearchResultRow,
  RelationshipResult,
} from "@/lib/neo4j/types";
import { isRelationshipResult } from "@/lib/neo4j/utils";

import {
  DEFAULT_TOOLTIP_BOX_STYLE_PROPS,
  DEFAULT_TOOLTIP_CONTENT_PROPS,
} from "../constants/cy";
import {
  ENTITY_STYLES_MAP,
  NODE_CLASS_MAP,
  NODE_TOOLTIP_PROPS_MAP,
} from "../constants/shared";
import {
  CytoscapeEdge,
  CytoscapeEvent,
  CytoscapeNode,
  CytoscapeNodeData,
} from "../interfaces/cy";
import { CytoscapeReference } from "../types/cy";
import { NodeElementFactory } from "../types/shared";

import {
  LABEL_TO_FACTORY_MAP,
  downloadBlob,
  getExternalLinkElement,
  getNodeDisplayProperty,
  getOntologyLink,
  labelInFactoryMapFilter,
} from "./shared";

const createCytoscapeNode = (
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

const createCytoscapeEdge = (
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

export const createCytoscapeElements = (
  graphPaths: PathwaySearchResultRow[]
) => {
  let nodes: CytoscapeNode[] = [];
  let edges: CytoscapeEdge[] = [];
  const seenNodes = new Set<string>();
  const seenEdges = new Set<string>();

  graphPaths.forEach((path) => {
    path.forEach((element) => {
      if (isRelationshipResult(element)) {
        if (!seenEdges.has(element.uuid)) {
          edges.push(createCytoscapeEdge(element));
          seenEdges.add(element.uuid);
        }
      } else {
        if (!seenNodes.has(element.uuid)) {
          const nodeLabel = element.labels[0];
          const usePropForLabel = [
            ...TERM_LABELS,
            ...FILE_RELATED_LABELS,
            ...BIOSAMPLE_RELATED_LABELS,
            ...SUBJECT_RELATED_LABELS,
            ID_NAMESPACE_LABEL,
            DCC_LABEL,
          ].includes(nodeLabel);
          nodes.push(createCytoscapeNode(element, [], usePropForLabel));
          seenNodes.add(element.uuid);
        }
      }
    });
  });

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

export const createNodeLabels = (node: CytoscapeNodeData) => {
  const nodeLabels = node.neo4j?.labels;

  if (nodeLabels !== undefined) {
    return (
      <Stack direction="row" sx={{ margin: "6px 0px", padding: "3px 7px" }}>
        {nodeLabels
          .filter(labelInFactoryMapFilter)
          .map((label) =>
            (LABEL_TO_FACTORY_MAP.get(label) as NodeElementFactory)(label)
          )}
      </Stack>
    );
  } else {
    return <Typography>No labels found on this node.</Typography>;
  }
};

export const createNodeProperties = (
  node: CytoscapeNodeData,
  textProps?: TypographyProps
) => {
  const nodeLabels = node.neo4j?.labels;
  const nodeProps = node.neo4j?.properties;

  if (nodeLabels !== undefined && nodeProps !== undefined) {
    const propsForLabel =
      nodeLabels.length === 1
        ? NODE_TOOLTIP_PROPS_MAP.get(nodeLabels[0]) || []
        : [];
    const propsToShow = Object.fromEntries(
      propsForLabel
        .filter((prop) => Object.hasOwn(nodeProps, prop))
        .map((validProp) => [validProp, nodeProps[validProp]])
    );
    return (
      <Stack direction="column">
        {Object.entries(propsToShow).map(([key, val], index) => {
          let valueElement;

          if (Array.isArray(val)) {
            valueElement = val.map((arrItem, arrIdx) => (
              <ListItem
                key={`prop-${key}-${index}-${arrIdx}`}
                sx={{ display: "list-item", py: 0 }}
              >
                {arrItem}
              </ListItem>
            ));
          } else if (typeof val === "string") {
            if (
              key === "id" &&
              nodeLabels.length > 0 &&
              [
                ...TERM_LABELS,
                ...FILE_RELATED_LABELS,
                ...SUBJECT_RELATED_LABELS,
                ...BIOSAMPLE_RELATED_LABELS,
              ].includes(nodeLabels[0])
            ) {
              const ontologyLink = getOntologyLink(nodeLabels[0], val);
              valueElement = getExternalLinkElement(ontologyLink, val);
            } else if (
              /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i.test(
                val
              )
            ) {
              valueElement = getExternalLinkElement(val, val);
            } else {
              valueElement = val;
            }
          } else {
            valueElement = val;
          }

          return (
            <div
              key={`prop-${key}-${index}`}
              style={{
                margin: "0px 7px",
                padding: "2px 0px",
              }}
            >
              <Typography {...textProps}>
                <b>{`${key}: `}</b>
                {valueElement}
              </Typography>
            </div>
          );
        })}
      </Stack>
    );
  } else {
    return <Typography>No properties found on this node.</Typography>;
  }
};

export const createNodeTooltip = (
  node: CytoscapeNodeData,
  boxStyleProps?: CSSProperties,
  contentProps?: TypographyProps
): ReactNode => {
  const nodeLabels = node.neo4j?.labels;
  const nodeProps = node.neo4j?.properties;
  if (nodeLabels !== undefined && nodeProps !== undefined) {
    const tooltipBorderColor =
      nodeLabels.length === 1
        ? ENTITY_STYLES_MAP.get(NODE_CLASS_MAP.get(nodeLabels[0]) || "")
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
        {createNodeLabels(node)}
        {createNodeProperties(node, {
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

export const unlockSelection = (event: EventObject) =>
  event.cy.nodes(":selected").forEach((node) => unlockD3ForceNode(node));

export const selectionHasLockedNode = (event: EventObject) =>
  Array.from(event.cy.nodes(":selected")).some(isNodeD3Locked);

const getCyDataForDownload = (cy: cytoscape.Collection) => {
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

const downloadCyAsPNG = (cy: cytoscape.Core) => {
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

export const rebindEventHandlers = (
  cyRef: CytoscapeReference,
  prevHandlers: CytoscapeEvent[],
  newHandlers: CytoscapeEvent[]
) => {
  const cy = cyRef.current;
  if (cy !== undefined) {
    prevHandlers.forEach((handler) => {
      if (handler.target !== undefined) {
        cy.unbind(handler.event, handler.target, handler.callback);
      } else {
        cy.unbind(handler.event, handler.callback);
      }
    });

    newHandlers.forEach((handler) => {
      if (handler.target !== undefined) {
        cy.bind(handler.event, handler.target, handler.callback);
      } else {
        cy.bind(handler.event, handler.callback);
      }
    });
  }
};

export const setChartCursor = (cy: Core, cursor: string) => {
  const container = cy.container();
  if (container !== null) {
    container.style.cursor = cursor;
  }
};
