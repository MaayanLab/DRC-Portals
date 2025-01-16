"use client";

import Autocomplete, {
  AutocompleteRenderOptionState,
} from "@mui/material/Autocomplete";
import { debounce, Box, Skeleton } from "@mui/material";
import { SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";

import { fetchCVTerms } from "@/lib/neo4j/api";
import { CVTermsResult, NodeResult } from "@/lib/neo4j/types";

import { SEARCH_PLACEHOLDER_OPTIONS } from "../../constants/shared";
import { createNodeElement } from "../../utils/shared";

import PathwaySearchBarInput from "./PathwaySearchBarInput";

interface PathwaySearchBarProps {
  onSubmit: (cvTerm: NodeResult) => void;
}

export default function PathwaySearchBar(cmpProps: PathwaySearchBarProps) {
  const { onSubmit } = cmpProps;
  const [value, setValue] = useState<string>("");
  const [options, setOptions] = useState<readonly string[]>([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(new AbortController());
  const cvTermsMap = useRef(new Map<string, NodeResult>());

  const abortCVTermRequest = () => {
    const abortController = abortControllerRef.current;
    if (abortController !== undefined) {
      abortController.abort("Cancelling previous CV terms request (if any).");
      abortControllerRef.current = new AbortController();
    }
  };

  const submit = (cvTerm: NodeResult | undefined) => {
    if (cvTerm !== undefined) {
      onSubmit(cvTerm);
    }
  };

  const handleOnChange = (
    event: SyntheticEvent,
    option: string | null,
    reason: string
  ) => {
    if (option === null) {
      setValue("");
    } else {
      setValue(option);
    }
  };

  // OnInputChange fires anytime the text value of the autocomplete changes
  const handleOnInputChange = (
    event: SyntheticEvent,
    option: string,
    reason: string
  ) => {
    setValue(option);
  };

  const handleRenderInput = (params: any) => (
    <PathwaySearchBarInput inputParams={params} />
  );

  const getOptionLabel = (option: string) => {
    const termName = cvTermsMap.current.get(option)?.properties.name;
    return option === termName ? (
      option
    ) : (
      <>
        {option} <em>({termName})</em>
      </>
    );
  };

  const handleRenderOption = (
    props: any,
    option: string,
    state: AutocompleteRenderOptionState
  ) => {
    const { key, ...optionProps } = props;
    return (
      <Box
        key={key}
        component="li"
        sx={{ display: "flex" }}
        {...optionProps}
        onClick={(event: MouseEvent) => {
          if (cvTermsMap.current !== undefined) {
            const cvTerm = cvTermsMap.current.get(option);
            submit(cvTerm);
          }
          optionProps.onClick(event);
        }}
      >
        {loading ? (
          <Skeleton
            variant="text"
            width={SEARCH_PLACEHOLDER_OPTIONS[state.index]}
          />
        ) : (
          <Box
            display="flex"
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Box>{getOptionLabel(option)}</Box>
            <Box>
              {createNodeElement(
                cvTermsMap.current.get(option)?.labels[0] || "Unknown"
              )}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  const fetchOptions = useMemo(
    () =>
      debounce(async (input: string) => {
        if (input.length === 0) {
          setOptions([]);
          return;
        }

        setLoading(true);
        setOptions(
          SEARCH_PLACEHOLDER_OPTIONS.map((option) => option.toString())
        );

        try {
          const response = await fetchCVTerms(`"${input}"`, {
            signal: abortControllerRef.current?.signal,
          });
          const data: CVTermsResult[] = await response.json();
          if (cvTermsMap.current !== undefined) {
            cvTermsMap.current.clear();
            data.forEach((row) => {
              cvTermsMap.current.set(row.synonym, row.cvTerm);
            });
            setOptions(Array.from(cvTermsMap.current.keys()));
          }
        } catch (error) {
          console.error(error);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }, 400),
    [cvTermsMap, abortControllerRef]
  );

  useEffect(() => {
    abortCVTermRequest(); // Any time value changes, abort any pending request
    fetchOptions(value);
  }, [fetchOptions, value]);

  return (
    <Autocomplete
      freeSolo
      value={value}
      options={options}
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
