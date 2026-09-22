"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useEffect, useMemo, useState } from "react";

import CypherDisplayBox from "./shared/CypherDisplayBox";
import QueryResults, {
  type QueryResultsPageData,
} from "./shared/QueryResults";
import { getTemplates, runTemplate } from "@/lib/text2cypher/api/neo4j";
import { repaginatePipelineResult } from "@/lib/text2cypher/api/pipeline";
import type { Template } from "@/lib/text2cypher/neo4j/types";
import { usePaginatedQueryResults } from "@/lib/text2cypher/hooks/usePaginatedQueryResults";

const DEFAULT_PAGE_LIMIT = 10;

export default function TemplatesTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [paramTouched, setParamTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRunningTemplate, setIsRunningTemplate] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [hasRunTemplate, setHasRunTemplate] = useState(false);
  const { pageState, applyPageState, resetPageState, getPaginationConfig } =
    usePaginatedQueryResults(DEFAULT_PAGE_LIMIT);

  useEffect(() => {
    let isMounted = true;

    const loadTemplates = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await getTemplates();

        if (!isMounted) {
          return;
        }

        setTemplates(response.templates);
        setSelectedTemplateId(response.templates[0]?.id ?? "");
        setParamValues({});
        setParamTouched({});
        resetPageState();
        setHasRunTemplate(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to load templates", error);
        setLoadError("Unable to load templates right now.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadTemplates();

    return () => {
      isMounted = false;
    };
  }, [resetPageState]);

  const selectedTemplate = useMemo(
    () =>
      templates.find((template) => template.id === selectedTemplateId) ??
      templates[0],
    [selectedTemplateId, templates],
  );

  const paramErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (!selectedTemplate) {
      return errors;
    }

    for (const param of selectedTemplate.params) {
      const rawValue = paramValues[param.name] ?? "";
      const value = rawValue.trim();

      if (!value) {
        errors[param.name] = "Required";
        continue;
      }

      if (param.type === "number" && Number.isNaN(Number(value))) {
        errors[param.name] = "Must be a valid number";
      }
    }

    return errors;
  }, [paramValues, selectedTemplate]);

  const hasParamErrors = Object.keys(paramErrors).length > 0;

  const handleParamChange = (paramName: string, value: string) => {
    setParamValues((current) => ({ ...current, [paramName]: value }));
  };

  const handleParamBlur = (paramName: string) => {
    setParamTouched((current) => ({ ...current, [paramName]: true }));
  };

  const handleRunTemplate = () => {
    if (!selectedTemplate) {
      return;
    }

    if (hasParamErrors) {
      const touched = Object.fromEntries(
        selectedTemplate.params.map((param) => [param.name, true]),
      );
      setParamTouched(touched);
      setRunError("Please fix highlighted parameter errors.");
      return;
    }

    const run = async () => {
      setIsRunningTemplate(true);
      setRunError(null);
      setHasRunTemplate(true);
      resetPageState();

      try {
        const params = Object.fromEntries(
          Object.entries(paramValues).filter(
            ([, value]) => value.trim() !== "",
          ),
        );
        const response = await runTemplate(selectedTemplate.id, {
          params,
          limit: DEFAULT_PAGE_LIMIT,
          offset: 0,
        });
        const cypher = response.cypher ?? selectedTemplate.query;
        const normalizedParams = response.params ?? params;

        applyPageState({
          rows: response.rows ?? null,
          error: response.error ?? null,
          cypher,
          params: normalizedParams,
          limit: response.limit ?? DEFAULT_PAGE_LIMIT,
          offset: response.offset ?? 0,
          totalRowCount: response.totalRowCount ?? 0,
          requestKey: `${selectedTemplate.id}:${cypher}:${JSON.stringify(normalizedParams)}`,
        });
      } catch (error: unknown) {
        resetPageState();
        setRunError(
          error instanceof Error
            ? error.message
            : "Failed to run selected template.",
        );
      } finally {
        setIsRunningTemplate(false);
      }
    };

    void run();
  };

  const handleTemplateSelectionChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setParamValues({});
    setParamTouched({});
    setRunError(null);
    resetPageState();
    setHasRunTemplate(false);
  };

  const handlePaginateTemplate = async ({
    limit,
    offset,
  }: {
    limit: number;
    offset: number;
  }): Promise<QueryResultsPageData> => {
    if (!pageState.cypher) {
      throw new Error("Cannot paginate before running a template.");
    }

    const response = await repaginatePipelineResult({
      cypher: pageState.cypher,
      params: pageState.params,
      limit,
      offset,
    });

    if (!response.success) {
      throw new Error(response.error || "Failed to paginate template results.");
    }

    const nextPage: QueryResultsPageData = {
      rows: response.rows ?? null,
      error: response.error ?? null,
      limit: response.limit ?? limit,
      offset: response.offset ?? offset,
      totalRowCount: response.totalRowCount ?? 0,
    };

    applyPageState({
      ...nextPage,
      cypher: pageState.cypher,
      params: pageState.params,
      requestKey: pageState.requestKey,
    });

    return nextPage;
  };

  const pagination = getPaginationConfig(handlePaginateTemplate);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        {isLoading ? (
          <Stack
            sx={{
              flex: 1,
              minHeight: 0,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={28} />
          </Stack>
        ) : null}

        {!isLoading && loadError ? (
          <Typography color="error">{loadError}</Typography>
        ) : null}

        {!isLoading && !loadError && templates.length === 0 ? (
          <Typography>No templates available.</Typography>
        ) : null}

        {!isLoading && !loadError && selectedTemplate ? (
          <>
            <FormControl fullWidth>
              <InputLabel id="template-select-label">
                Select Template
              </InputLabel>
              <Select
                labelId="template-select-label"
                value={selectedTemplateId}
                label="Select Template"
                onChange={(event) =>
                  handleTemplateSelectionChange(event.target.value as string)
                }
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {selectedTemplate.description}
              </Typography>
              <Stack spacing={1.5}>
                {selectedTemplate.params.map((param) =>
                  (() => {
                    const errorText = paramErrors[param.name];
                    const showError = Boolean(
                      errorText && paramTouched[param.name],
                    );

                    return (
                      <TextField
                        key={param.name}
                        label={param.name}
                        type={param.type === "number" ? "number" : "text"}
                        value={paramValues[param.name] ?? ""}
                        onChange={(event) =>
                          handleParamChange(param.name, event.target.value)
                        }
                        onBlur={() => handleParamBlur(param.name)}
                        error={showError}
                        helperText={
                          showError ? errorText : `Example: ${param.example}`
                        }
                        fullWidth
                      />
                    );
                  })(),
                )}
              </Stack>
            </Box>

            <CypherDisplayBox cypher={selectedTemplate.query} />

            <Button
              variant="contained"
              size="large"
              onClick={handleRunTemplate}
              disabled={isRunningTemplate || hasParamErrors}
              fullWidth
            >
              {isRunningTemplate ? "Running..." : "Run Template"}
            </Button>

            {runError ? (
              <Typography color="error">{runError}</Typography>
            ) : null}

            {hasRunTemplate ? (
              <QueryResults
                title="Query Results"
                rows={pageState.rows}
                error={pageState.error}
                isLoading={isRunningTemplate}
                pagination={pagination}
              />
            ) : null}
          </>
        ) : null}
      </Stack>
    </Paper>
  );
}
