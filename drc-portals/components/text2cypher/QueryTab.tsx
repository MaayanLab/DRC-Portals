"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import CypherDisplayBox from "./shared/CypherDisplayBox";
import QueryResults from "./shared/QueryResults";
import { getPipelineResult } from "@/lib/text2cypher/api/pipeline";
import type { QueryResultData, QueryTableRow } from "@/lib/text2cypher/neo4j/query-results";

export default function QueryTab() {
  const [question, setQuestion] = useState("");
  const [codeOutput, setCodeOutput] = useState(
    "// Generated Cypher will appear here\n",
  );
  const [queryData, setQueryData] = useState<QueryResultData | null>(null);
  const [queryRows, setQueryRows] = useState<QueryTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);

  const PIPELINE_ERROR_PLACEHOLDER =
    "// The pipeline did not return a valid result. Please try again, or try another question.\n";

  const handleAsk = async (input: string) => {
    if (!input.trim()) {
      setQueryData(null);
      setQueryRows([]);
      setHasAskedQuestion(false);
      setCodeOutput("// Enter a question and click Ask to generate Cypher.\n");
      return;
    }

    setHasAskedQuestion(true);
    setIsLoading(true);
    setQueryData(null);
    setQueryRows([]);
    setCodeOutput("// Running pipeline...\n");

    try {
      const result = await getPipelineResult({ question: input });
      if (result.success && result.cypher) {
        setCodeOutput(result.cypher);
        setQueryData(result.results ?? null);
        setQueryRows(result.rawResults ?? []);
      } else {
        // TODO: We should be able to identify when a known error happens, e.g., when the user asks about something not in the schema.
        console.warn(result.error);
        setQueryData(null);
        setQueryRows([]);
        setCodeOutput(PIPELINE_ERROR_PLACEHOLDER);
      }
    } catch (error: unknown) {
      console.warn(error instanceof Error ? error.message : String(error));
      setQueryData(null);
      setQueryRows([]);
      setCodeOutput(PIPELINE_ERROR_PLACEHOLDER);
    } finally {
      setIsLoading(false);
    }
  };

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
            sx={{
              backgroundColor: "secondary"
            }}
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
            data={queryData}
            rows={queryRows}
            isLoading={isLoading}
          />
        ) : null}
      </Stack>
    </Paper>
  );
}
