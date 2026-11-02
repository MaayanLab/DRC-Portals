"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { applySpeechMapper } from "@/utils/speech";
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
const MAX_RECORDING_MS = 10000;

export default function QueryTab() {
  const [question, setQuestion] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recorderRef = useRef<any>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const stopRecording = useCallback(async () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    const recorder = recorderRef.current;
    if (!recorder) return;
    setIsRecording(false);
    setIsTranscribing(true);
    try {
      const [, blob] = await recorder.stop().getMp3();
      if (blob.size < 10) return;
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("model", "whisper-1");
      const response = await fetch("/chat/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Transcription failed.");
      const transcribed = await response.json();
      if (transcribed.text) setQuestion(applySpeechMapper(transcribed.text));
    } catch (error) {
      console.warn(error);
      setSpeechError("Could not transcribe audio. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const startRecording = useCallback(async () => {
    setSpeechError(null);
    try {
      if (!recorderRef.current) {
        const MicRecorder = require("mic-recorder-to-mp3");
        recorderRef.current = new MicRecorder({ bitRate: 128 });
      }
      await recorderRef.current.start();
      setIsRecording(true);
      recordingTimeoutRef.current = setTimeout(
        () => void stopRecording(),
        MAX_RECORDING_MS,
      );
    } catch (error) {
      console.warn(error);
      setSpeechError("Could not access the microphone.");
    }
  }, [stopRecording]);

  useEffect(
    () => () => {
      if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
    },
    [],
  );
  const [codeOutput, setCodeOutput] = useState(
    "// Generated Cypher will appear here\n",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { pageState, applyPageState, resetPageState, getPaginationConfig } =
    usePaginatedQueryResults(DEFAULT_PAGE_LIMIT);

  const PIPELINE_ERROR_PLACEHOLDER =
    "// The pipeline did not return a valid result. Please try again, or try another question.\n";

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
    },
    [],
  );

  const handleAsk = async (input: string) => {
    if (abortControllerRef.current) {
      return;
    }

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
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const result = await getPipelineResult(
        {
          question: input,
          limit: DEFAULT_PAGE_LIMIT,
          offset: 0,
        },
        abortController.signal,
      );
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
      if (abortController.signal.aborted) {
        resetPageState();
        setHasAskedQuestion(false);
        setCodeOutput("// Pipeline canceled.\n");
        return;
      }
      console.warn(error instanceof Error ? error.message : String(error));
      resetPageState();
      setCodeOutput(PIPELINE_ERROR_PLACEHOLDER);
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
  };

  const handleQuestionKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleAsk(question);
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
            onKeyDown={handleQuestionKeyDown}
            placeholder="Type your question here"
            fullWidth
            multiline
            minRows={2}
            variant="outlined"
            error={Boolean(speechError)}
            helperText={
              speechError ??
              (isRecording
                ? "Listening... click the mic to stop"
                : isTranscribing
                  ? "Transcribing..."
                  : undefined)
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ alignSelf: "flex-start", mt: 1 }}>
                  <Tooltip title={isRecording ? "Stop recording" : "Speak your question"}>
                    <span>
                      <IconButton
                        aria-label={isRecording ? "Stop recording" : "Start recording"}
                        color={isRecording ? "error" : "default"}
                        disabled={isTranscribing || isLoading}
                        onClick={() =>
                          void (isRecording ? stopRecording() : startRecording())
                        }
                      >
                        {isRecording ? <MicIcon /> : <MicOffIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
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
          {isLoading ? (
            <Button
              variant="outlined"
              size="large"
              onClick={handleCancel}
              startIcon={
                <CircularProgress
                  size={16}
                  color="inherit"
                  aria-label="Query pipeline is running"
                />
              }
            >
              Cancel
            </Button>
          ) : null}
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
