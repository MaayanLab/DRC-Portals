"use client";

import { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import CypherDisplayBox from "./shared/CypherDisplayBox";
import QueryResults, {
  type QueryResultsPageData,
} from "./shared/QueryResults";
import {
  getPipelineResult,
  repaginatePipelineResult,
} from "@/lib/text2cypher/api/pipeline";
import { usePaginatedQueryResults } from "@/lib/text2cypher/hooks/usePaginatedQueryResults";

const DEFAULT_PAGE_LIMIT = 10;

export default function QueryTab() {
  const [question, setQuestion] = useState("");
  const [codeOutput, setCodeOutput] = useState(
    "// Generated Cypher will appear here\n",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);
  const { pageState, applyPageState, resetPageState, getPaginationConfig } =
    usePaginatedQueryResults(DEFAULT_PAGE_LIMIT);

  const PIPELINE_ERROR_PLACEHOLDER =
    "// The pipeline did not return a valid result. Please try again, or try another question.\n";

  const handleAsk = async (input: string) => {
    if (!input.trim()) {
      resetPageState();
      setHasAskedQuestion(false);
      setCodeOutput("// Enter a question and click Ask to generate Cypher.\n");
      return;
    }

    setHasAskedQuestion(true);
    setIsLoading(true);
    resetPageState();
    setCodeOutput("// Running pipeline...\n");

    try {
      const result = await getPipelineResult({
        question: input,
        limit: DEFAULT_PAGE_LIMIT,
        offset: 0,
      });
      if (result.success && result.cypher) {
        setCodeOutput(result.cypher);
        applyPageState({
          rows: result.rows ?? null,
          error: result.error ?? null,
          cypher: result.cypher,
          params: result.params ?? {},
          limit: result.limit ?? DEFAULT_PAGE_LIMIT,
          offset: result.offset ?? 0,
          totalRowCount: result.totalRowCount ?? 0,
          requestKey: result.cypher,
        });
      } else {
        // TODO: We should be able to identify when a known error happens, e.g., when the user asks about something not in the schema.
        console.warn(result.error);
        resetPageState();
        setCodeOutput(PIPELINE_ERROR_PLACEHOLDER);
      }
    } catch (error: unknown) {
      console.warn(error instanceof Error ? error.message : String(error));
      resetPageState();
      setCodeOutput(PIPELINE_ERROR_PLACEHOLDER);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaginate = useCallback(
    async ({ limit, offset }: { limit: number; offset: number }) => {
      if (!pageState.cypher) {
        throw new Error("Cannot paginate before a query has been generated.");
      }

      const result = await repaginatePipelineResult({
        cypher: pageState.cypher,
        params: pageState.params,
        limit,
        offset,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to paginate query results.");
      }

      const nextData: QueryResultsPageData = {
        rows: result.rows ?? null,
        error: result.error ?? null,
        limit: result.limit ?? limit,
        offset: result.offset ?? offset,
        totalRowCount: result.totalRowCount ?? 0,
      };

      applyPageState({
        ...nextData,
        cypher: pageState.cypher,
        params: pageState.params,
        requestKey: pageState.requestKey,
      });

      return nextData;
    },
    [applyPageState, pageState],
  );

  const pagination = getPaginationConfig(handlePaginate);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: 2,
      }}
    >
      <Stack spacing={2} sx={{ flex: 1, height: "100%" }}>
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="subtitle1">Your question</Typography>
          </Box>

          <TextField
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Type your question here"
            fullWidth
            multiline
            minRows={2}
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => handleAsk(question)}
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? "Working..." : "Ask"}
          </Button>
          {isLoading ? <CircularProgress size={24} /> : null}
        </Box>

        <CypherDisplayBox cypher={codeOutput} title="Generated Cypher" />

        {/* TODO: Refine system prompts to ensure returned Cypher query is compatible with the QueryResults data format */}
        {hasAskedQuestion ? (
          <QueryResults
            title="Query Results"
            rows={pageState.rows}
            error={pageState.error}
            isLoading={isLoading}
            pagination={pagination}
          />
        ) : null}
      </Stack>
    </Paper>
  );
}
