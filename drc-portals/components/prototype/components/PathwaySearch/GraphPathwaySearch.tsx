"use client";

import ContentCutIcon from "@mui/icons-material/ContentCut";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import HubIcon from "@mui/icons-material/Hub";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  CircularProgress,
  Fab,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";

import {
  Core,
  EventObject,
  EventObjectEdge,
  EventObjectNode,
  NodeSingular,
} from "cytoscape";
import {
  ChangeEvent,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { NodeResult } from "@/lib/neo4j/types";

import CytoscapeChart from "../CytoscapeChart/CytoscapeChart";
import PathwaySearchBar from "../SearchBar/PathwaySearchBar";
import {
  PATHWAY_SEARCH_STYLESHEET,
  EULER_LAYOUT,
  NODE_BORDER_WIDTH,
} from "../../constants/cy";
import {
  NodeFiltersContainer,
  PathwayModeBtnContainer,
} from "../../constants/pathway-search";
import { SearchBarContainer } from "../../constants/search-bar";
import { VisuallyHiddenInput } from "../../constants/shared";
import { ChartRadialMenuItemProps, CytoscapeEvent } from "../../interfaces/cy";
import { PathwaySearchNode } from "../../interfaces/pathway-search";
import { AnimationFn, CustomToolbarFnFactory } from "../../types/cy";
import { PathwaySearchElement } from "../../types/pathway-search";
import { isPathwaySearchEdgeElement } from "../../utils/pathway-search";

import PathwayNodeFilters from "./PathwayNodeFilters";

interface GraphPathwaySearchProps {
  elements: PathwaySearchElement[];
  loading: boolean;
  onSearchBarSubmit: (node: NodeResult) => void;
  onSearchBtnClick: () => void;
  onExpand: (node: NodeSingular) => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (files: ChangeEvent<HTMLInputElement>) => void;
  onSelectedNodeChange: (
    node: PathwaySearchNode | undefined,
    reason: string
  ) => void;
}

export default function GraphPathwaySearch(cmpProps: GraphPathwaySearchProps) {
  const {
    elements,
    loading,
    onExpand,
    onReset,
    onExport,
    onImport,
    onSearchBarSubmit,
    onSearchBtnClick,
    onSelectedNodeChange,
  } = cmpProps;
  const [selectedNode, setSelectedNode] = useState<PathwaySearchNode>();
  const PATHWAY_SEARCH_ZOOM = 4;
  const PATHWAY_SEARCH_MAX_ZOOM = 4;

  const handleSelectedNodeChange = useCallback(
    (id: string | undefined, cy: Core) => {
      if (id === undefined) {
        setSelectedNode(undefined);
      } else {
        const node = cy.nodes().$id(id);
        const newSelectedNode = {
          classes: node.classes(),
          data: node.data(),
        };

        setSelectedNode(newSelectedNode);
        onSelectedNodeChange(newSelectedNode, "select");
      }
    },
    [onSelectedNodeChange]
  );

  const handleNodeFilterChange = useCallback(
    (value: string) => {
      if (selectedNode !== undefined) {
        const newSelectedNode: PathwaySearchNode = {
          classes: [...(selectedNode.classes || [])],
          data: {
            ...selectedNode.data,
            displayLabel: value || selectedNode.data.dbLabel,
          },
        };
        setSelectedNode(newSelectedNode);
        onSelectedNodeChange(newSelectedNode, "update");
      }
    },
    [selectedNode, onSelectedNodeChange]
  );

  const handleReset = useCallback(() => {
    setSelectedNode(undefined);
    onSelectedNodeChange(undefined, "update");
    onReset();
  }, [onSelectedNodeChange, onReset]);

  const customTools: CustomToolbarFnFactory[] = useMemo(
    () => [
      () => {
        return (
          <Fragment key="pathway-search-chart-toolbar-reset-search">
            <Tooltip title="Start Over" arrow>
              <IconButton aria-label="start-over" onClick={handleReset}>
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
          </Fragment>
        );
      },
      () => {
        return (
          <Fragment key="pathway-search-chart-toolbar-export-pathway">
            <Tooltip title="Export Pathway" arrow>
              <IconButton aria-label="export-pathway" onClick={onExport}>
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
          </Fragment>
        );
      },
      () => {
        return (
          <Fragment key="pathway-search-chart-toolbar-import-pathway">
            <Tooltip title="Import Pathway" arrow>
              <IconButton aria-label="export-pathway" component="label">
                <FileUploadIcon />
                <VisuallyHiddenInput
                  accept=".json,application/json"
                  id="pathway-import-input"
                  type="file"
                  onClick={(event) => {
                    // Reset value on each click, this allows the user to submit the same file multiple times
                    const target = event.target as HTMLInputElement;
                    target.value = "";
                  }}
                  onChange={onImport}
                />
              </IconButton>
            </Tooltip>
          </Fragment>
        );
      },
    ],
    [handleReset, onExport, onImport]
  );

  const customEvents: CytoscapeEvent[] = useMemo(
    () => [
      {
        event: "tap",
        callback: (event: EventObject) => {
          if (event.target === event.cy) {
            handleSelectedNodeChange(undefined, event.cy);
          }
        },
      },
      {
        event: "tap",
        target: "node",
        callback: (event: EventObjectNode) => {
          handleSelectedNodeChange(event.target.id(), event.cy);
        },
      },
      {
        event: "tap",
        target: "edge",
        callback: (event: EventObjectEdge) => {
          const targetNode = event.target.source().hasClass("path-element")
            ? event.target.target()
            : event.target.source();
          handleSelectedNodeChange(targetNode.id(), event.cy);
        },
      },
      {
        event: "mouseover",
        target: "node",
        callback: (event: EventObjectNode) => {
          event.target.neighborhood().addClass("solid");
        },
      },
      {
        event: "mouseout",
        target: "node",
        callback: (event: EventObjectNode) => {
          event.target.neighborhood().removeClass("solid");
        },
      },
      {
        event: "mouseover",
        target: "edge",
        callback: (event: EventObjectEdge) => {
          event.target.connectedNodes().addClass("solid");
        },
      },
      {
        event: "mouseout",
        target: "edge",
        callback: (event: EventObjectEdge) => {
          event.target.connectedNodes().removeClass("solid");
        },
      },
    ],
    [handleSelectedNodeChange]
  );

  const customAnimations: AnimationFn[] = [
    // Node loading animation
    (cy: cytoscape.Core) => {
      const loop = () => {
        const loadingNodes = cy.elements("node.loading");

        // Cytoscape crashes if you try to animate empty collections
        if (loadingNodes.size() > 0) {
          loadingNodes.style({
            "border-opacity": 1,
            "border-width": 0,
          });

          const animationPromises = loadingNodes.map((node) => {
            // For some reason the position props are non-optional in the argument type definition for `animation`, but they are actually
            // optional. This ignore suppresses that warning.
            // @ts-ignore
            const ani = node.animation({
              style: {
                "border-opacity": 0,
                "border-width": NODE_BORDER_WIDTH * 2,
              },
              easing: "ease-out-cubic",
              duration: 1000,
            });
            return ani.play().promise("complete");
          });

          // Wait for all nodes to finish animating, then loop
          Promise.all(animationPromises).then(() => {
            // Remove style bypasses created by the animation
            loadingNodes.style({
              "border-opacity": null,
              "border-width": null,
            });
            loop();
          });
        }
      };
      loop();
    },
  ];

  const radialMenuItems: ChartRadialMenuItemProps[] = [
    {
      key: "pathway-search-radial-menu-item-hub",
      content: <HubIcon style={{ width: "100%", height: "100%" }} />,
      onClick: onExpand,
    },
    {
      key: "pathway-search-radial-menu-item-filter",
      content: (
        <Box style={{ width: "100%", height: "100%" }}>
          <FilterAltIcon />
        </Box>
      ),
      onClick: () => console.log("[menuItemCutFilter]"),
    },
    {
      key: "pathway-search-radial-menu-item-cut",
      content: (
        <Box style={{ width: "100%", height: "100%" }}>
          <ContentCutIcon />
        </Box>
      ),
      onClick: () => console.log("[menuItemCutClick]"),
    },
  ];

  useEffect(() => {
    // If the source elements have changed, make sure the selectedNode is updated with any new data
    if (selectedNode !== undefined) {
      const newSelectedNode = elements.find(
        (el) =>
          !isPathwaySearchEdgeElement(el) && el.data.id === selectedNode.data.id
      ) as PathwaySearchNode | undefined;

      if (newSelectedNode !== undefined) {
        setSelectedNode({
          classes: [...(newSelectedNode.classes || [])],
          data: { ...newSelectedNode.data },
        });
      } else {
        // TODO: This should currently never happen, but it might be possible if/when we allow removing nodes from the pathway
        console.warn("Selected node does not exist in current elements list!");
      }
    }
  }, [elements]);

  return (
    <Grid item xs={12} sx={{ position: "relative", height: "inherit" }}>
      {elements.length === 0 ? (
        <SearchBarContainer>
          <PathwaySearchBar onSubmit={onSearchBarSubmit}></PathwaySearchBar>
        </SearchBarContainer>
      ) : (
        <PathwayModeBtnContainer>
          <Tooltip title="Search Path" arrow placement="left">
            <Box sx={{ position: "relative" }}>
              <Fab
                aria-label="search-path"
                color="secondary"
                size="large"
                onClick={onSearchBtnClick}
              >
                <SearchIcon />
              </Fab>
              {loading && (
                <CircularProgress
                  color="primary"
                  size={68} // This should be the FAB diameter + 4
                  sx={{
                    position: "absolute",
                    top: -6,
                    left: -6,
                    zIndex: 1,
                  }}
                />
              )}
            </Box>
          </Tooltip>
        </PathwayModeBtnContainer>
      )}
      {selectedNode === undefined ? null : (
        <NodeFiltersContainer>
          <PathwayNodeFilters
            node={selectedNode}
            onChange={handleNodeFilterChange}
          ></PathwayNodeFilters>
        </NodeFiltersContainer>
      )}
      <CytoscapeChart
        elements={elements}
        layout={EULER_LAYOUT}
        stylesheet={PATHWAY_SEARCH_STYLESHEET}
        cxtMenuEnabled={false}
        tooltipEnabled={false}
        toolbarPosition={{ top: 10, right: 10 }}
        customTools={customTools}
        customAnimations={customAnimations}
        radialMenuItems={radialMenuItems}
        autoungrabify={true}
        boxSelectionEnabled={false}
        zoom={PATHWAY_SEARCH_ZOOM}
        maxZoom={PATHWAY_SEARCH_MAX_ZOOM}
        customEvents={customEvents}
      ></CytoscapeChart>
    </Grid>
  );
}
