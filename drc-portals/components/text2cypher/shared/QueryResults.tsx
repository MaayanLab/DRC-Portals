"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import { useCallback, useMemo, useState } from "react";

import DRSBundleButton from "@/app/data/c2m2/DRSBundleButton";

import CytoscapeChartWrapper from "./CytoscapeChartWrapper";
import QueryResultsTable from "./QueryResultsTable";
import { DEFAULT_STYLESHEET } from "@/lib/text2cypher/constants/cy/styles/defaults";
import { expandNode } from "@/lib/text2cypher/api/neo4j";
import {
  getEmptyQueryResultData,
  mergeQueryResultDataWithNodeLimit,
  type QueryResultData,
  type QueryResultRow,
  queryResultDataToCytoscapeElements,
  queryResultRowsToGraphData,
} from "@/lib/text2cypher/neo4j/query-results";
import { getActiveSchemaDefinition } from "@/lib/text2cypher/schema/active";
import type { ExpandNodeActionPayload } from "./CytoscapeContextMenu";

cytoscape.use(fcose);

const QUERY_RESULTS_NETWORK_LAYOUT: fcose.FcoseLayoutOptions = {
  name: "fcose",
  quality: "default",
  animate: false,
  randomize: true,
};

interface QueryResultsProps {
  rows: QueryResultRow[] | null;
  error?: string | null;
  isLoading?: boolean;
  title?: string;
  emptyMessage?: string;
  pagination?: QueryResultsPaginationConfig;
}

export interface QueryResultsPageData {
  rows: QueryResultRow[] | null;
  error: string | null;
  limit: number;
  offset: number;
  totalRowCount: number;
}

export interface QueryResultsPaginationConfig {
  requestKey: string;
  limit: number;
  offset: number;
  totalRowCount: number;
  onPaginate: (input: {
    limit: number;
    offset: number;
  }) => Promise<QueryResultsPageData>;
}

type ResultView = "table" | "network";

const MAX_GRAPH_NODE_COUNT = 300;

interface ToastState {
  open: boolean;
  message: string;
  severity: "warning" | "error" | "info";
}

interface GraphState {
  baseRowsRef: QueryResultRow[] | null;
  data: QueryResultData;
}

interface PaginationErrorState {
  requestKey: string;
  message: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

const getPageWindow = (
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> => {
  if (totalPages <= 1) {
    return [1];
  }

  const pages: Array<number | "ellipsis"> = [1];
  const windowStart = Math.max(2, currentPage - 2);
  const windowEnd = Math.min(totalPages - 1, currentPage + 2);

  if (windowStart > 2) {
    pages.push("ellipsis");
  }

  for (let page = windowStart; page <= windowEnd; page++) {
    pages.push(page);
  }

  if (windowEnd < totalPages - 1) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);

  return pages;
};

export default function QueryResults({
  rows,
  error = null,
  isLoading = false,
  title = "Query Results",
  emptyMessage = "No results returned for this query.",
  pagination,
}: QueryResultsProps) {
  const activeSchema = getActiveSchemaDefinition();
  const [localPageData, setLocalPageData] =
    useState<QueryResultsPageData | null>(null);
  const [localPageRequestKey, setLocalPageRequestKey] = useState<string | null>(
    null,
  );
  const [isPaginating, setIsPaginating] = useState(false);
  const [paginationError, setPaginationError] =
    useState<PaginationErrorState | null>(null);
  const [view, setView] = useState<ResultView>("table");
  const [graphState, setGraphState] = useState<GraphState | null>(null);
  const [isExpandingNode, setIsExpandingNode] = useState(false);
  const [selectedRowIndexes, setSelectedRowIndexes] = useState<number[]>([]);
  const [toastState, setToastState] = useState<ToastState>({
    open: false,
    message: "",
    severity: "info",
  });

  const currentRequestKey = pagination?.requestKey ?? "";
  const useLocalPageData =
    Boolean(pagination) &&
    localPageData !== null &&
    localPageRequestKey === currentRequestKey;
  const activeRows = useLocalPageData ? localPageData.rows : rows;
  const activeError = useLocalPageData ? localPageData.error : error;
  const resolvedLimit = useLocalPageData
    ? localPageData.limit
    : (pagination?.limit ?? 10);
  const resolvedOffset = useLocalPageData
    ? localPageData.offset
    : (pagination?.offset ?? 0);
  const totalRowCount = Math.max(
    0,
    useLocalPageData
      ? localPageData.totalRowCount
      : (pagination?.totalRowCount ?? 0),
  );

  const baseGraphData = useMemo(() => {
    const base =
      queryResultRowsToGraphData(activeRows) ?? getEmptyQueryResultData();
    return mergeQueryResultDataWithNodeLimit(
      getEmptyQueryResultData(),
      base,
      MAX_GRAPH_NODE_COUNT,
    ).data;
  }, [activeRows]);

  const graphData =
    graphState !== null && graphState.baseRowsRef === activeRows
      ? graphState.data
      : baseGraphData;

  const paginationEnabled = Boolean(pagination);
  const totalPages = Math.max(1, Math.ceil(totalRowCount / resolvedLimit));
  const currentPage =
    totalRowCount === 0
      ? 1
      : Math.min(totalPages, Math.floor(resolvedOffset / resolvedLimit) + 1);
  const pageButtons = getPageWindow(currentPage, totalPages);
  const controlsDisabled = isLoading || isPaginating;

  const showToast = useCallback(
    (message: string, severity: "warning" | "error" | "info") => {
      setToastState({
        open: true,
        message,
        severity,
      });
    },
    [],
  );

  const handleToastClose = useCallback(() => {
    setToastState((current) => ({ ...current, open: false }));
  }, []);

  const handleExpandNode = useCallback(
    async ({ nodeLabel, nodeUuid, depth }: ExpandNodeActionPayload) => {
      if (isExpandingNode) {
        return;
      }

      setIsExpandingNode(true);

      try {
        const response = await expandNode({
          nodeLabel,
          nodeUuid,
          depth,
        });

        const incomingData =
          queryResultRowsToGraphData(response.rows) ??
          getEmptyQueryResultData();
        const incomingError = response.error ?? null;

        setGraphState((currentState) => {
          const currentData =
            currentState !== null && currentState.baseRowsRef === activeRows
              ? currentState.data
              : baseGraphData;

          const mergeSummary = mergeQueryResultDataWithNodeLimit(
            currentData,
            incomingData,
            MAX_GRAPH_NODE_COUNT,
          );

          if (mergeSummary.wasTruncated) {
            showToast(
              `Showing ${MAX_GRAPH_NODE_COUNT} nodes max. ${mergeSummary.truncatedNodeCount} new node(s) were not added.`,
              "warning",
            );
          } else if (mergeSummary.addedNodeCount === 0) {
            showToast("No new neighbors were added for this node.", "info");
          }

          return {
            baseRowsRef: activeRows,
            data: mergeSummary.data,
          };
        });

        if (incomingError) {
          showToast(incomingError, "warning");
        }
      } catch (error: unknown) {
        showToast(
          error instanceof Error
            ? error.message
            : "Failed to expand node neighbors.",
          "error",
        );
      } finally {
        setIsExpandingNode(false);
      }
    },
    [activeRows, baseGraphData, isExpandingNode, showToast],
  );

  const requestPage = useCallback(
    async ({ limit, offset }: { limit: number; offset: number }) => {
      if (!pagination) {
        return;
      }

      setIsPaginating(true);
      setPaginationError(null);

      try {
        const response = await pagination.onPaginate({
          limit,
          offset,
        });

        setLocalPageData(response);
        setLocalPageRequestKey(pagination.requestKey);
        setGraphState(null);
        setSelectedRowIndexes([]);
        setPaginationError(null);
      } catch (error: unknown) {
        setPaginationError({
          requestKey: pagination.requestKey,
          message:
            error instanceof Error
              ? error.message
              : "Failed to load page results.",
        });
      } finally {
        setIsPaginating(false);
      }
    },
    [pagination],
  );

  const elements = useMemo(
    () => queryResultDataToCytoscapeElements(graphData),
    [graphData],
  );
  const hasResults = graphData.nodes.length > 0 || graphData.edges.length > 0;

  const drsBundleData = useMemo(
    () => {
      return activeRows === null ? [] : activeRows.filter((_, index) =>
        selectedRowIndexes.includes(index),
      ).flatMap(row => Object.values(row)).map(cell => cell?.properties as { [key: string]: string }); // TODO: This is a kludge, shouldn't be an issue but may need revisiting if the data structure changes
    },
    [activeRows, selectedRowIndexes]
  );

  return (
    <Stack spacing={1.5} sx={{ minHeight: 220 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="subtitle1">{title}</Typography>
        <ToggleButtonGroup
          value={view}
          exclusive
          size="small"
          onChange={(_, nextView: ResultView | null) => {
            if (nextView) {
              setView(nextView);
            }
          }}
          aria-label="query results view"
        >
          <ToggleButton value="table">Table</ToggleButton>
          <ToggleButton value="network">Network</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {paginationError && paginationError.requestKey === currentRequestKey ? (
        <Alert
          severity="error"
          onClose={() => {
            setPaginationError(null);
          }}
          variant="outlined"
        >
          {paginationError.message}
        </Alert>
      ) : null}

      {view === "table" ? (
        <Stack spacing={1.25}>
          <QueryResultsTable
            title=""
            rows={activeRows}
            error={activeError}
            isLoading={isLoading || isPaginating}
            emptyMessage={emptyMessage}
            onSelectionChange={(nextSelection) => {
              setSelectedRowIndexes((currentSelection) => {
                const nextSelectionIndexes = nextSelection.selectedRowIndexes;

                if (currentSelection.length !== nextSelectionIndexes.length) {
                  return nextSelectionIndexes;
                }

                for (let index = 0; index < currentSelection.length; index++) {
                  if (currentSelection[index] !== nextSelectionIndexes[index]) {
                    return nextSelectionIndexes;
                  }
                }

                return currentSelection;
              });
            }}
          />

          {paginationEnabled ? (
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              sx={{
                alignItems: { xs: "stretch", md: "center" },
                justifyContent: "space-between",
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel id="rows-per-page-label">
                    Query rows per page
                  </InputLabel>
                  <Select
                    labelId="rows-per-page-label"
                    value={String(resolvedLimit)}
                    label="Query rows per page"
                    disabled={controlsDisabled}
                    onChange={(event) => {
                      const nextLimit = Number(event.target.value);
                      if (Number.isFinite(nextLimit) && nextLimit > 0) {
                        void requestPage({
                          limit: nextLimit,
                          offset: 0,
                        });
                      }
                    }}
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <MenuItem key={size} value={String(size)}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="body2" color="text.secondary">
                  {totalRowCount === 0
                    ? "0 query rows"
                    : `Query rows ${resolvedOffset + 1}-${Math.min(resolvedOffset + resolvedLimit, totalRowCount)} of ${totalRowCount}`}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                spacing={0.5}
                useFlexGap
                sx={{
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  disabled={controlsDisabled || currentPage <= 1}
                  onClick={() => {
                    void requestPage({
                      limit: resolvedLimit,
                      offset: 0,
                    });
                  }}
                >
                  {"<<"}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={controlsDisabled || currentPage <= 1}
                  onClick={() => {
                    const targetPage = Math.max(1, currentPage - 1);
                    void requestPage({
                      limit: resolvedLimit,
                      offset: (targetPage - 1) * resolvedLimit,
                    });
                  }}
                >
                  {"<"}
                </Button>

                {pageButtons.map((entry, index) =>
                  entry === "ellipsis" ? (
                    <Typography
                      key={`ellipsis-${index}`}
                      variant="body2"
                      color="text.secondary"
                      sx={{ px: 0.75 }}
                    >
                      ...
                    </Typography>
                  ) : (
                    <Button
                      key={`page-${entry}`}
                      size="small"
                      variant={entry === currentPage ? "contained" : "outlined"}
                      disabled={controlsDisabled}
                      onClick={() => {
                        void requestPage({
                          limit: resolvedLimit,
                          offset: (entry - 1) * resolvedLimit,
                        });
                      }}
                    >
                      {entry}
                    </Button>
                  ),
                )}

                <Button
                  size="small"
                  variant="outlined"
                  disabled={controlsDisabled || currentPage >= totalPages}
                  onClick={() => {
                    const targetPage = Math.min(totalPages, currentPage + 1);
                    void requestPage({
                      limit: resolvedLimit,
                      offset: (targetPage - 1) * resolvedLimit,
                    });
                  }}
                >
                  {">"}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={controlsDisabled || currentPage >= totalPages}
                  onClick={() => {
                    void requestPage({
                      limit: resolvedLimit,
                      offset: (totalPages - 1) * resolvedLimit,
                    });
                  }}
                >
                  {">>"}
                </Button>
              </Stack>
            </Stack>
          ) : null}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={0}
            sx={{ justifyContent: "flex-start" }}
          >
            {controlsDisabled || selectedRowIndexes.length === 0 ? null : (
              <DRSBundleButton data={drsBundleData} />
            )}
          </Stack>
        </Stack>
      ) : isLoading || isPaginating ? (
        <Paper
          variant="outlined"
          sx={{
            minHeight: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={28} />
        </Paper>
      ) : activeError ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            minHeight: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="error">{activeError}</Typography>
        </Paper>
      ) : hasResults ? (
        <CytoscapeChartWrapper
          elements={elements}
          layout={QUERY_RESULTS_NETWORK_LAYOUT}
          stylesheet={[...DEFAULT_STYLESHEET, ...activeSchema.resultStylesheet]}
          style={{ height: 420, width: "100%" }}
          onExpandNode={handleExpandNode}
          onContextMenuWarning={(message) => {
            showToast(message, "warning");
          }}
          isExpandingNode={isExpandingNode}
          expandDepth={1}
        />
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            minHeight: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="text.secondary">{emptyMessage}</Typography>
        </Paper>
      )}

      <Snackbar
        open={toastState.open}
        autoHideDuration={4000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleToastClose}
          severity={toastState.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toastState.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
