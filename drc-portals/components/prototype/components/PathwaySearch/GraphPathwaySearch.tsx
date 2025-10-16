"use client";

import ContentCutIcon from "@mui/icons-material/ContentCut";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import HelpIcon from '@mui/icons-material/Help';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Fab,
  IconButton,
  Link,
  Paper,
  Snackbar,
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
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ADMIN_LABELS, FILTER_LABELS, TERM_LABELS } from "@/lib/neo4j/constants";
import { NodeResult } from "@/lib/neo4j/types";

import {
  PATHWAY_SEARCH_STYLESHEET,
  KLAY_LAYOUT,
  NODE_BORDER_WIDTH,
} from "../../constants/cy";
import {
  NodeFiltersContainer,
  PathwayModeBtnContainer,
} from "../../constants/pathway-search";
import { SearchBarContainer } from "../../constants/search-bar";
import { CFDE_DARK_BLUE, VisuallyHiddenInput } from "../../constants/shared";
import { ADD_CONNECTION_ITEM_ID, PRUNE_ID, SHOW_FILTERS_ID } from "../../constants/cxt-menu";
import { CxtMenuItem } from "../../interfaces/cxt-menu";
import { CytoscapeEvent } from "../../interfaces/cy";
import {
  ConnectionMenuItem,
  PathwaySearchNode,
} from "../../interfaces/pathway-search";
import { CustomToolbarFnFactory } from "../../types/cy";
import { PathwaySearchElement } from "../../types/pathway-search";
import { getRootFromElements, isPathwaySearchEdgeElement } from "../../utils/pathway-search";

import CytoscapeChart from "../CytoscapeChart/CytoscapeChart";
import ChartCxtMenuItem from "../CytoscapeChart/ChartCxtMenuItem";
import AddConnectionMenuItem from "../CytoscapeChart/custom-cxt-menu-items/AddConnectionMenuItem";
import PathwaySearchBar from "../SearchBar/PathwaySearchBar";

import PathwayNodeFilters from "./PathwayNodeFilters";

interface GraphPathwaySearchProps {
  elements: PathwaySearchElement[];
  loadingNodes: string[];
  loadingInitial: boolean;
  onSearchBarSubmit: (node: NodeResult) => void;
  onSearchBtnClick: () => void;
  onConnectionSelected: (
    item: ConnectionMenuItem,
    event: EventObjectNode
  ) => void;
  onPruneSelected: (node: NodeSingular) => void;
  onPruneConfirm: () => void;
  onPruneCancel: () => void;
  onReset: () => void;
  onDownload: () => void;
  onUpload: (files: ChangeEvent<HTMLInputElement>) => void;
  onCopyCypher: () => void;
  onSelectedNodeChange: (
    node: PathwaySearchNode | undefined,
    reason: string
  ) => void;
}

export default function GraphPathwaySearch(cmpProps: GraphPathwaySearchProps) {
  const {
    elements,
    loadingNodes,
    loadingInitial,
    onConnectionSelected,
    onPruneSelected,
    onPruneConfirm,
    onPruneCancel,
    onReset,
    onDownload,
    onUpload,
    onCopyCypher,
    onSearchBarSubmit,
    onSearchBtnClick,
    onSelectedNodeChange,
  } = cmpProps;
  const [selectedNode, setSelectedNode] = useState<PathwaySearchNode>();
  const [showFilters, setShowFilters] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const cyRef = useRef<Core>();
  const animationControllerRef = useRef(new AbortController());
  const layout = useMemo(
    () => ({
      ...KLAY_LAYOUT,
      klay: {
        ...KLAY_LAYOUT.klay,
        spacing:
          Math.max(
            0,
            ...elements
              .filter(isPathwaySearchEdgeElement)
              .map((edge) => edge.data.displayLabel.length)
          ) + 40,
      },
    }),
    [elements]
  );
  const PATHWAY_SEARCH_ZOOM = 4;
  const PATHWAY_SEARCH_MAX_ZOOM = 4;

  const stopLoadingAnimation = () => {
    const animationController = animationControllerRef.current;
    if (animationController !== undefined) {
      animationController.abort("Stopping node loading animation.");
      animationControllerRef.current = new AbortController();
    }
  };

  const playLoadingAnimation = async () => {
    const animate = async () => {
      const animationController = animationControllerRef.current;
      while (true) {
        if (animationController.signal.aborted) {
          break;
        }

        const cy = cyRef.current;
        if (cy !== undefined) {
          const nodesToAnimate = loadingNodes.reduce(
            (prev, curr) => cy.getElementById(curr).union(prev),
            cy.collection()
          )

          // Cytoscape crashes if you try to animate empty collections
          if (nodesToAnimate.size() > 0) {
            nodesToAnimate.style({
              "border-opacity": 1,
              "border-width": 0,
            });

            const animationPromises = nodesToAnimate.map((node) => {
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
            await Promise.all(animationPromises).then(() => {
              // Remove style bypasses created by the animation
              nodesToAnimate.style({
                "border-opacity": null,
                "border-width": null,
              });
            });
          }
        }
      }
    };
    await animate();
  };

  const handleSelectedNodeChange = useCallback(
    (id: string | undefined, cy: Core) => {
      // Hide filters *any* time the selected node changes
      setShowFilters(false);

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
        setShowFilters(false);
      }
    },
    [selectedNode, onSelectedNodeChange]
  );

  const handleReset = useCallback(() => {
    setSelectedNode(undefined);
    onSelectedNodeChange(undefined, "update");
    onReset();
  }, [onSelectedNodeChange, onReset]);

  const handleFilterNodeSelected = (event: EventObjectNode) => {
    handleSelectedNodeChange(event.target.id(), event.cy);
    setShowFilters(true);
  };

  const showFilterNode = useCallback(
    (event: EventObjectNode) => {
      const root = getRootFromElements(elements);
      return event.target.data("id") !== root?.data.id && FILTER_LABELS.has(event.target.data("dbLabel"))
    }, [elements]
  );


  const showExpandNode = useCallback((event: EventObjectNode) => {
    const root = getRootFromElements(elements);
    const nodeLabel: string = event.target.data("dbLabel");
    const nodeId: string = event.target.data("id");

    // If the node is the root...
    if (nodeId === root?.data.id) {
      if (elements.filter(isPathwaySearchEdgeElement).some((edge) => edge.data.source === nodeId || edge.data.target === nodeId)) {
        // Don't allow expansion if already has some connection
        return false
      }
    } else {
      // If the node is NOT the root...
      if (ADMIN_LABELS.includes(nodeLabel) || TERM_LABELS.includes(nodeLabel)) {
        // Don't allow expansion if the node has an admin label or a term label
        return false;
      }
    }
    return true;
  }, [elements]);

  const handlePruneNodeSelected = (event: EventObjectNode) => {
    setSnackbarOpen(true);
    onPruneSelected(event.target);
    handleSelectedNodeChange(undefined, event.cy);
  };

  const handlePruneSnackbarCanceled = () => {
    setSnackbarOpen(false);
    onPruneCancel();
  };

  const handlePruneSnackbarConfirm = () => {
    setSnackbarOpen(false);
    onPruneConfirm();
  };

  const customTools: CustomToolbarFnFactory[] = useMemo(
    () => [
      () => {
        return (
          <Fragment key="pathway-search-chart-toolbar-reset-search">
            {
              elements.length === 0
                ? <IconButton aria-label="start-over" disabled onClick={handleReset}>
                  <RestartAltIcon />
                </IconButton>
                : <Tooltip title="Start Over" arrow>
                  <IconButton aria-label="start-over" onClick={handleReset}>
                    <RestartAltIcon />
                  </IconButton>
                </Tooltip>
            }

          </Fragment>
        );
      },
      () => (
        <Divider
          key="pathway-search-chart-toolbar-divider-0"
          orientation="vertical"
          variant="middle"
          flexItem
        />
      ),
      () => {
        return (
          <Fragment key="pathway-search-chart-toolbar-cypher-query">
            <Tooltip title="Copy Cypher Query" arrow>
              <IconButton aria-label="cypher-query" onClick={onCopyCypher}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Fragment>
        );
      },
      () => {
        return (
          <Fragment key="pathway-search-chart-toolbar-download-pathway">
            <Tooltip title="Download Pathway" arrow>
              <IconButton aria-label="download-pathway" onClick={onDownload}>
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
          </Fragment>
        );
      },
      () => {
        return (
          <Fragment key="pathway-search-chart-toolbar-upload-pathway">
            <Tooltip title="Upload Pathway" arrow>
              <IconButton aria-label="upload-pathway" component="label">
                <FileUploadIcon />
                <VisuallyHiddenInput
                  accept=".json,application/json"
                  id="pathway-upload-input"
                  type="file"
                  onClick={(event) => {
                    // Reset value on each click, this allows the user to submit the same file multiple times
                    const target = event.target as HTMLInputElement;
                    target.value = "";
                  }}
                  onChange={onUpload}
                />
              </IconButton>
            </Tooltip>
          </Fragment>
        );
      },
      () => (
        <Divider
          key="pathway-search-chart-toolbar-divider-1"
          orientation="vertical"
          variant="middle"
          flexItem
        />
      ),
      () => {
        return (
          <Fragment key="pathway-search-chart-toolbar-help">
            <Tooltip title="Help" arrow>
              <Link href="/data/graph/help" target="_blank">
                <IconButton aria-label="pathway-help" component="label">
                  <HelpIcon />
                </IconButton>
              </Link>
            </Tooltip>
          </Fragment>
        );
      },
    ],

    [elements, handleReset, onDownload, onUpload, onCopyCypher]
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
        event: "cxttap",
        target: "node",
        callback: (event: EventObjectNode) => {
          handleSelectedNodeChange(event.target.id(), event.cy);
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

  const nodeCxtMenuItems: CxtMenuItem[] = useMemo(
    () => [
      {
        content: <AddConnectionMenuItem
          id={ADD_CONNECTION_ITEM_ID}
          key={ADD_CONNECTION_ITEM_ID}
          elements={elements}
          onConnectionSelected={onConnectionSelected}
          showFn={showExpandNode}
        ></AddConnectionMenuItem>,
        tree: {
          id: ADD_CONNECTION_ITEM_ID,
          children: [],
          open: false,
        }
      },
      {
        content: <ChartCxtMenuItem
          id={SHOW_FILTERS_ID}
          key={SHOW_FILTERS_ID}
          renderContent={(event) => (
            <Box sx={{ display: "flex" }}>
              <FilterAltIcon sx={{ color: "#6f6e77", marginRight: 1 }} />
              Filters
            </Box>
          )}
          action={handleFilterNodeSelected}
          showFn={showFilterNode}
        ></ChartCxtMenuItem>,
        tree: {
          id: SHOW_FILTERS_ID,
          children: [],
          open: false,
        }
      },
      {
        content: <ChartCxtMenuItem
          id={PRUNE_ID}
          key={PRUNE_ID}
          renderContent={(event) => (
            <Box sx={{ display: "flex" }}>
              <ContentCutIcon sx={{ color: "#6f6e77", marginRight: 1 }} />
              Prune
            </Box>
          )}
          action={handlePruneNodeSelected}
        ></ChartCxtMenuItem>,
        tree: {
          id: PRUNE_ID,
          children: [],
          open: false,
        }
      },
    ],
    [elements]
  );

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

  useEffect(() => {
    stopLoadingAnimation();

    // If loadingNodes changed and isn't empty, play the loading animation with the new elements
    if (loadingNodes.length !== 0) {
      playLoadingAnimation();
    }
  }, [loadingNodes]);

  return (
    <Box sx={{ position: "relative", height: "inherit" }}>
      {!loadingInitial && elements.length === 0 ? (
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
                size="medium"
                onClick={onSearchBtnClick}
              >
                <SearchIcon />
              </Fab>
            </Box>
          </Tooltip>
        </PathwayModeBtnContainer>
      )}
      {showFilters && selectedNode !== undefined ? (
        <NodeFiltersContainer>
          <PathwayNodeFilters
            node={selectedNode}
            onChange={handleNodeFilterChange}
          ></PathwayNodeFilters>
        </NodeFiltersContainer>
      ) : null}

      {loadingInitial ? (
        <Box sx={{
          flexGrow: 1,
          display: "flex",
          position: "absolute",
          top: "50%",
          right: "50%",
          zIndex: 1,
        }}>
          <Box sx={{ position: "relative" }}>
            <CircularProgress color="secondary" size="60px" />
          </Box>
        </Box>
      ) : null}

      <CytoscapeChart
        cyRef={cyRef}
        elements={elements}
        layout={layout}
        stylesheet={PATHWAY_SEARCH_STYLESHEET}
        cxtMenuEnabled={true}
        tooltipEnabled={false}
        hoverCxtMenuEnabled={false}
        toolbarPosition={{ top: 10, right: 10 }}
        customTools={customTools}
        nodeCxtMenuItems={nodeCxtMenuItems}
        autoungrabify={true}
        boxSelectionEnabled={false}
        zoom={PATHWAY_SEARCH_ZOOM}
        maxZoom={PATHWAY_SEARCH_MAX_ZOOM}
        customEvents={customEvents}
      ></CytoscapeChart>
      <Snackbar
        open={snackbarOpen}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        onClose={handlePruneSnackbarCanceled}
        sx={{ position: "absolute" }}
      >
        <Paper
          variant="outlined"
          elevation={1}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderColor: CFDE_DARK_BLUE,
            backgroundColor: "#E7F3F5",
            padding: 1,
          }}
        >
          <Box sx={{ marginRight: 1 }}>
            Please review the elements to be pruned, outlined in red.
          </Box>
          <Box sx={{ display: "flex" }}>
            <Button
              sx={{ marginRight: 1 }}
              variant="contained"
              color="secondary"
              onClick={handlePruneSnackbarConfirm}
            >
              Confirm
            </Button>
            <Button
              variant="contained"
              onClick={handlePruneSnackbarCanceled}
              sx={{ backgroundColor: "#FFF" }}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      </Snackbar>
    </Box>
  );
}
