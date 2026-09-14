"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { getNodeColor } from "@/lib/text2cypher/cytoscape/styles";
import type {
  CytoscapeSelectedNode,
  CytoscapeSelectedRelationship,
} from "@/lib/text2cypher/cytoscape/interaction-events";

export const CYTOSCAPE_INFO_DRAWER_WIDTH = 280;
export const CYTOSCAPE_INFO_DRAWER_TOGGLE_SIZE = 32;

const PROPERTY_VALUE_TRUNCATION_LENGTH = 150;

export type CytoscapeInfoDrawerMode =
  | "overview"
  | "node-details"
  | "relationship-details";

export interface CytoscapeOverviewNodeCount {
  label: string;
  count: number;
  color?: string;
}

export interface CytoscapeOverviewRelationshipCount {
  type: string;
  count: number;
}

export interface CytoscapeInfoDrawerOverview {
  nodeLabels: CytoscapeOverviewNodeCount[];
  relationshipTypes: CytoscapeOverviewRelationshipCount[];
  totalNodes: number;
  totalRelationships: number;
}

interface CytoscapeInfoDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  overview?: CytoscapeInfoDrawerOverview;
  mode?: CytoscapeInfoDrawerMode;
  selectedNode?: CytoscapeSelectedNode | null;
  selectedRelationship?: CytoscapeSelectedRelationship | null;
}

const formatPropertyValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "null";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => formatPropertyValue(entry)).join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

interface PropertyDetailsTableProps {
  properties: Record<string, unknown>;
  emptyMessage: string;
}

function PropertyDetailsTable({
  properties,
  emptyMessage,
}: PropertyDetailsTableProps) {
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(
    () => new Set(),
  );
  const [copiedProperty, setCopiedProperty] = useState<string | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const propertyEntries = Object.entries(properties).sort(([left], [right]) =>
    left.localeCompare(right, undefined, { sensitivity: "base" }),
  );

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const togglePropertyExpansion = useCallback((propertyName: string) => {
    setExpandedProperties((current) => {
      const next = new Set(current);

      if (next.has(propertyName)) {
        next.delete(propertyName);
      } else {
        next.add(propertyName);
      }

      return next;
    });
  }, []);

  const handleCopy = useCallback(
    async (propertyName: string, value: string) => {
      try {
        if (copyTimeoutRef.current !== null) {
          window.clearTimeout(copyTimeoutRef.current);
        }

        await navigator.clipboard.writeText(value);
        setCopiedProperty(propertyName);
        copyTimeoutRef.current = window.setTimeout(() => {
          setCopiedProperty((current) =>
            current === propertyName ? null : current,
          );
          copyTimeoutRef.current = null;
        }, 1500);
      } catch (error) {
        console.error("Copy failed", error);
      }
    },
    [],
  );

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
      }}
    >
      {propertyEntries.length > 0 ? (
        propertyEntries.map(([propertyName, propertyValue], index) => {
          const formattedValue = formatPropertyValue(propertyValue);
          const isExpanded = expandedProperties.has(propertyName);
          const isLongValue =
            formattedValue.length > PROPERTY_VALUE_TRUNCATION_LENGTH;
          const displayValue =
            isLongValue && !isExpanded
              ? `${formattedValue.slice(0, PROPERTY_VALUE_TRUNCATION_LENGTH)}...`
              : formattedValue;

          return (
            <Fragment key={propertyName}>
              {index > 0 ? <Divider /> : null}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "minmax(72px, 88px) minmax(0, 1fr)",
                }}
              >
                <Box
                  sx={{
                    px: 1,
                    py: 0.875,
                    bgcolor: "action.hover",
                    borderRight: 1,
                    borderColor: "divider",
                    overflowWrap: "anywhere",
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {propertyName}
                  </Typography>
                </Box>
                <Box sx={{ px: 1, py: 0.875 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        lineHeight: 1.45,
                        overflowWrap: "anywhere",
                        whiteSpace: isExpanded ? "pre-wrap" : "normal",
                      }}
                    >
                      {displayValue}
                    </Typography>
                    <Tooltip
                      title={
                        copiedProperty === propertyName
                          ? "Copied"
                          : "Copy value"
                      }
                    >
                      <IconButton
                        size="small"
                        aria-label={`Copy ${propertyName} value`}
                        onClick={() => {
                          void handleCopy(propertyName, formattedValue);
                        }}
                        sx={{ mt: -0.25, mr: -0.5 }}
                      >
                        {copiedProperty === propertyName ? (
                          <CheckIcon fontSize="inherit" />
                        ) : (
                          <ContentCopyIcon fontSize="inherit" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                  {isLongValue ? (
                    <Button
                      size="small"
                      onClick={() => {
                        togglePropertyExpansion(propertyName);
                      }}
                      sx={{
                        mt: 0.25,
                        px: 0,
                        minWidth: 0,
                        textTransform: "none",
                      }}
                    >
                      {isExpanded ? "Show less" : "Show more"}
                    </Button>
                  ) : null}
                </Box>
              </Box>
            </Fragment>
          );
        })
      ) : (
        <Box sx={{ px: 1, py: 1.25 }}>
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

interface NodeDetailsPaneProps {
  selectedNode: CytoscapeSelectedNode;
}

function NodeDetailsPane({ selectedNode }: NodeDetailsPaneProps) {
  const nodeColor = getNodeColor({
    data: {
      label: selectedNode.label,
    },
    classes: selectedNode.classes,
  });

  return (
    <>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Node properties
      </Typography>

      <Stack spacing={1.5} sx={{ overflowY: "auto" }}>
        <Box>
          <Stack
            direction="row"
            sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.75 }}
          >
            <Box
              key={selectedNode.label}
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 999,
                border: 1,
                borderColor: "divider",
                bgcolor: nodeColor ? `${nodeColor}33` : "grey.300",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {selectedNode.label}
              </Typography>
            </Box>
          </Stack>
        </Box>
        <PropertyDetailsTable
          properties={selectedNode.properties}
          emptyMessage="No properties available for this node."
        />
      </Stack>
    </>
  );
}

interface RelationshipDetailsPaneProps {
  selectedRelationship: CytoscapeSelectedRelationship;
}

function RelationshipDetailsPane({
  selectedRelationship,
}: RelationshipDetailsPaneProps) {
  return (
    <>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Relationship properties
      </Typography>

      <Stack spacing={1.5} sx={{ overflowY: "auto" }}>
        <Box>
          <Stack
            direction="row"
            sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.75 }}
          >
            <Box
              key={selectedRelationship.type}
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 0.75,
                border: 1,
                borderColor: "divider",
                bgcolor: "grey.300",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {selectedRelationship.type}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <PropertyDetailsTable
          properties={selectedRelationship.properties}
          emptyMessage="No properties available for this relationship."
        />
      </Stack>
    </>
  );
}

export default function CytoscapeInfoDrawer({
  open,
  onOpenChange,
  overview,
  mode,
  selectedNode,
  selectedRelationship,
}: CytoscapeInfoDrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(true);
  const isControlled = typeof open === "boolean";
  const isOpen = isControlled ? open : uncontrolledOpen;
  const activeMode =
    mode ??
    (selectedNode
      ? "node-details"
      : selectedRelationship
        ? "relationship-details"
        : "overview");
  const nodeLabelCounts = overview?.nodeLabels ?? [];
  const relationshipTypeCounts = overview?.relationshipTypes ?? [];
  const totalNodes = overview?.totalNodes ?? 0;
  const totalRelationships = overview?.totalRelationships ?? 0;

  const handleToggle = () => {
    const nextOpen = !isOpen;

    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: isOpen
          ? CYTOSCAPE_INFO_DRAWER_WIDTH
          : CYTOSCAPE_INFO_DRAWER_TOGGLE_SIZE,
        height: isOpen ? "100%" : CYTOSCAPE_INFO_DRAWER_TOGGLE_SIZE,
      }}
    >
      <Tooltip title={isOpen ? "Close details drawer" : "Open details drawer"}>
        <IconButton
          size="small"
          aria-label={isOpen ? "Close details drawer" : "Open details drawer"}
          onClick={handleToggle}
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 1,
            width: CYTOSCAPE_INFO_DRAWER_TOGGLE_SIZE,
            height: CYTOSCAPE_INFO_DRAWER_TOGGLE_SIZE,
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.paper",
          }}
        >
          {isOpen ? (
            <ChevronRightIcon fontSize="small" />
          ) : (
            <ChevronLeftIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>

      {isOpen ? (
        <Paper
          variant="outlined"
          sx={{
            width: CYTOSCAPE_INFO_DRAWER_WIDTH,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            pt: 4.5,
            pb: 1.5,
            px: 1.5,
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={1.25} sx={{ minHeight: 0, flex: 1 }}>
            {activeMode === "overview" ? (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Overview
                </Typography>

                <Stack spacing={1.5} sx={{ overflowY: "auto" }}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 0.75 }}
                    >
                      Node labels
                    </Typography>
                    <Stack
                      direction="row"
                      sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.75 }}
                    >
                      {nodeLabelCounts.length > 0 ? (
                        nodeLabelCounts.map((item) => (
                          <Box
                            key={item.label}
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderRadius: 999,
                              border: 1,
                              borderColor: "divider",
                              bgcolor: item.color
                                ? `${item.color}33`
                                : "grey.300",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 700 }}
                            >
                              {item.label} ({item.count})
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Box
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 999,
                            border: 1,
                            borderColor: "divider",
                            bgcolor: "grey.300",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700 }}
                          >
                            None (0)
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 0.75 }}
                    >
                      Relationship types
                    </Typography>
                    <Stack spacing={0.5}>
                      {relationshipTypeCounts.length > 0 ? (
                        relationshipTypeCounts.map((item) => (
                          <Box
                            key={item.type}
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderRadius: 0.75,
                              bgcolor: "grey.300",
                              border: 1,
                              borderColor: "divider",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 700 }}
                            >
                              {item.type} ({item.count})
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Box
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 0.75,
                            bgcolor: "grey.300",
                            border: 1,
                            borderColor: "divider",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700 }}
                          >
                            None (0)
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  <Divider />
                  <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                    Displaying {totalNodes} nodes, {totalRelationships}{" "}
                    relationships.
                  </Typography>
                </Stack>
              </>
            ) : (
              <>
                {activeMode === "node-details" && selectedNode ? (
                  <NodeDetailsPane
                    key={selectedNode.id}
                    selectedNode={selectedNode}
                  />
                ) : activeMode === "relationship-details" &&
                  selectedRelationship ? (
                  <RelationshipDetailsPane
                    key={`${selectedRelationship.source}-${selectedRelationship.type}-${selectedRelationship.target}`}
                    selectedRelationship={selectedRelationship}
                  />
                ) : (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Select a node or relationship to inspect details.
                    </Typography>
                  </>
                )}
              </>
            )}
          </Stack>
        </Paper>
      ) : null}
    </Box>
  );
}
