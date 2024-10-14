import {
  Autocomplete,
  AutocompleteChangeReason,
  AutocompleteOwnerState,
  AutocompleteRenderInputParams,
  AutocompleteRenderOptionState,
  Box,
  CircularProgress,
  debounce,
  Skeleton,
  TextField,
} from "@mui/material";

import { SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";

import { fetchTermsByLabelAndName } from "@/lib/neo4j/api";

import { SEARCH_PLACEHOLDER_OPTIONS } from "../../constants/shared";

interface NodeTextSearchProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

export default function NodeTextSearch(cmpProps: NodeTextSearchProps) {
  const { label, onChange } = cmpProps;
  const [value, setValue] = useState<string | null>(cmpProps.value || null);
  const [options, setOptions] = useState<readonly string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef(new AbortController());

  const abortCVTermRequest = () => {
    const abortController = abortControllerRef.current;
    if (abortController !== undefined) {
      abortController.abort("Cancelling previous CV terms request (if any).");
      abortControllerRef.current = new AbortController();
    }
  };

  const handleOnChange = (
    event: SyntheticEvent,
    value: string | null,
    reason: AutocompleteChangeReason
  ) => {
    setValue(value);

    // Only emit to the parent when an option is selected from the dropdown
    if (reason === "selectOption") {
      onChange(value || "");
    }
  };

  const handleOnInputChange = (
    event: SyntheticEvent,
    option: string,
    reason: string
  ) => {
    setValue(option);
  };

  const handleRenderInput = (params: AutocompleteRenderInputParams) => (
    <TextField
      {...params}
      label={label}
      helperText={error}
      error={error !== null}
      InputProps={{
        ...params.InputProps,
        sx: {
          backgroundColor: "#FFF",
        },
        endAdornment: (
          <>
            {loading ? <CircularProgress color="inherit" size={20} /> : null}
            {params.InputProps.endAdornment}
          </>
        ),
      }}
    />
  );

  const handleRenderOption = (
    props: any,
    option: string,
    state: AutocompleteRenderOptionState,
    ownerState: AutocompleteOwnerState<string, false, false, true, "div">
  ) => {
    const { key, ...optionProps } = props;
    return (
      <Box
        key={key}
        component="li"
        sx={{ display: "flex" }}
        {...optionProps}
        onClick={(event: MouseEvent) => {
          onChange(option);
          optionProps.onClick(event);
        }}
      >
        {loading ? (
          <Skeleton
            variant="text"
            width={SEARCH_PLACEHOLDER_OPTIONS[state.index]}
          />
        ) : (
          ownerState.getOptionLabel(option)
        )}
      </Box>
    );
  };

  const fetchOptions = useMemo(
    () =>
      debounce(async (input: string | null) => {
        if (input === null || input.length === 0) {
          setOptions([]);
          return;
        }

        setLoading(true);
        setOptions(
          SEARCH_PLACEHOLDER_OPTIONS.map((option) => option.toString())
        );

        try {
          const response = await fetchTermsByLabelAndName(label, input, {
            signal: abortControllerRef.current?.signal,
          });
          const data: string[] = await response.json();
          setOptions(data);
        } catch (error) {
          console.error(error);
          setError(
            `An error occurred fetching options for ${label}. Please try again later.`
          );
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }, 400),
    [abortControllerRef]
  );

  useEffect(() => {
    abortCVTermRequest(); // Any time value changes, abort any pending request
    fetchOptions(value);
  }, [fetchOptions, value]);

  return (
    <Autocomplete
      size="small"
      freeSolo
      value={value}
      options={options}
      onChange={handleOnChange}
      onInputChange={handleOnInputChange}
      renderInput={handleRenderInput}
      renderOption={handleRenderOption}
      filterOptions={(x) => x}
    />
  );
}
