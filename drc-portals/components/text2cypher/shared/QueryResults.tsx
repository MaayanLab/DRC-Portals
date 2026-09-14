"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import { useCallback, useMemo, useState } from "react";

import CytoscapeChartWrapper from "./CytoscapeChartWrapper";
import QueryResultsTable from "./QueryResultsTable";
import { DEFAULT_STYLESHEET } from "@/lib/text2cypher/constants/cy/styles/defaults";
import { expandNode } from "@/lib/text2cypher/api/neo4j";
import {
  getEmptyQueryResultData,
  mergeQueryResultDataWithNodeLimit,
  type QueryResultData,
  type QueryTableRow,
  queryResultDataToCytoscapeElements,
  queryResultDataToTableRows,
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
  data: QueryResultData | null;
  rows?: QueryTableRow[];
  isLoading?: boolean;
  title?: string;
  emptyMessage?: string;
}

type ResultView = "table" | "network";

const MAX_GRAPH_NODE_COUNT = 300;

interface ToastState {
  open: boolean;
  message: string;
  severity: "warning" | "error" | "info";
}

interface GraphState {
  baseDataRef: QueryResultData | null;
  data: QueryResultData;
}

export default function QueryResults({
  data,
  rows,
  isLoading = false,
  title = "Query Results",
  emptyMessage = "No results returned for this query.",
}: QueryResultsProps) {
  const activeSchema = getActiveSchemaDefinition();
  const [view, setView] = useState<ResultView>("network");
  const [graphState, setGraphState] = useState<GraphState | null>(null);
  const [isExpandingNode, setIsExpandingNode] = useState(false);
  const [toastState, setToastState] = useState<ToastState>({
    open: false,
    message: "",
    severity: "info",
  });

  const baseGraphData = useMemo(() => {
    const base = data ?? getEmptyQueryResultData();
    return mergeQueryResultDataWithNodeLimit(
      getEmptyQueryResultData(),
      base,
      MAX_GRAPH_NODE_COUNT,
    ).data;
  }, [data]);

  const graphData =
    graphState !== null && graphState.baseDataRef === data
      ? graphState.data
      : baseGraphData;

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

        const incomingData = response.results ?? getEmptyQueryResultData();

        setGraphState((currentState) => {
          const currentData =
            currentState !== null && currentState.baseDataRef === data
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
            baseDataRef: data,
            data: mergeSummary.data,
          };
        });
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
    [baseGraphData, data, isExpandingNode, showToast],
  );

  const tableRows = useMemo(() => {
    const graphRows = queryResultDataToTableRows(graphData);
    if (graphRows.length > 0) {
      return graphRows;
    }

    return rows ?? [];
  }, [graphData, rows]);

  const elements = useMemo(
    () => queryResultDataToCytoscapeElements(graphData),
    [graphData],
  );
  const hasResults = tableRows.length > 0;

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
          <ToggleButton value="network">Network</ToggleButton>
          <ToggleButton value="table">Table</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {view === "table" ? (
        <QueryResultsTable
          title=""
          rows={tableRows}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
        />
      ) : isLoading ? (
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
