"use client";

import Autocomplete, {
  AutocompleteOwnerState,
  AutocompleteRenderOptionState,
} from "@mui/material/Autocomplete";
import { debounce, Box, Skeleton } from "@mui/material";
import {
  KeyboardEvent,
  SyntheticEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { fetchSynonyms } from "@/lib/neo4j/api";
import { SynoynmsResult } from "@/lib/neo4j/types";

import SearchBarInput from "./SearchBarInput";

interface SearchBarProps {
  value: string;
  error: string | null;
  loading: boolean;
  clearError: () => void;
  onSubmit: (term: string) => void;
}

/**
 * TODOS:
 * - Allow user to export the current chart data, import would reproduce what was exported (need to include the actual query in this?)
 * - Query limit
 */

export default function SearchBar(cmpProps: SearchBarProps) {
  const { error, loading, clearError, onSubmit } = cmpProps;
  const [value, setValue] = useState<string>(cmpProps.value);
  const [options, setOptions] = useState<readonly string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const PLACEHOLDER_OPTIONS = [80, 110, 145, 170, 240];

  const submit = (input: string) => {
    if (input.length > 0) {
      onSubmit(input);
    }
  };

  const handleInputKeydown = (e: KeyboardEvent) => {
    if (e.code === "Enter") {
      submit(value);
    }
  };

  // OnChange fires when an option is chosen from the autocomplete
  const handleOnChange = (event: SyntheticEvent, newValue: string | null) => {
    clearError();

    if (newValue === null) {
      setValue("");
    } else {
      setValue(newValue);
      submit(newValue);
    }
  };

  // OnInputChange fires anytime the text value of the autocomplete changes
  const handleOnInputChange = (
    event: SyntheticEvent,
    newValue: string,
    reason: string
  ) => {
    // Only clear the error if the user directly updated the search field
    if (reason === "input") {
      clearError();
    }
    setValue(newValue);
  };

  const handleRenderInput = (params: any) => (
    <SearchBarInput
      inputParams={params}
      error={error}
      loading={loading}
      showClearBtn={value !== null && value.length > 0}
      onClear={() => setValue("")}
      onSearch={() => submit(value)}
      onKeyDown={handleInputKeydown}
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
      <Box key={key} component="li" sx={{ display: "flex" }} {...optionProps}>
        {loadingOptions ? (
          <Skeleton variant="text" width={PLACEHOLDER_OPTIONS[state.index]} />
        ) : (
          ownerState.getOptionLabel(option)
        )}
      </Box>
    );
  };

  const fetchOptions = useMemo(
    () =>
      debounce(async (input: string) => {
        setLoadingOptions(true);
        setOptions(PLACEHOLDER_OPTIONS.map((option) => option.toString()));

        try {
          const response = await fetchSynonyms(input);
          const data: SynoynmsResult[] = await response.json();
          setOptions(data.map((row) => row.synonym));
        } catch (error) {
          setOptions([]);
        } finally {
          setLoadingOptions(false);
        }
      }, 400),
    []
  );

  useEffect(() => {
    setValue(cmpProps.value);
  }, [cmpProps.value]);

  useEffect(() => {
    if (value.length > 0) {
      fetchOptions(value);
    } else {
      setOptions([]);
    }
  }, [fetchOptions, value]);

  return (
    <Autocomplete
      freeSolo
      value={value}
      options={options.map((option) => `"${option}"`)}
      onChange={handleOnChange}
      onInputChange={handleOnInputChange}
      renderInput={handleRenderInput}
      renderOption={handleRenderOption}
      filterOptions={(x) => x}
      sx={{
        borderRadius: "4px",
        width: "auto",
        minWidth: "480px",
        backgroundColor: "transparent",
        "& .MuiOutlinedInput-root": {
          paddingRight: "120px!important",
        },
      }}
    />
  );
}
