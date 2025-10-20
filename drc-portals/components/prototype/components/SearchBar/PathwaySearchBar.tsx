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
  const [showNoOptions, setShowNoOptions] = useState(false);
  const abortControllerRef = useRef(new AbortController());
  const cvTermsMap = useRef(new Map<string, [string, NodeResult]>());

  const NO_OPTIONS_TEXT = "No terms found";

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
    const synonymAndTerm = cvTermsMap.current.get(option);
    const synonymName = synonymAndTerm !== undefined ? synonymAndTerm[0] : "Unknown"
    return option === synonymName ? (
      option
    ) : (
      <>
        {synonymName} <em>({option})</em>
      </>
    );
  };

  const handleRenderOption = (
    props: any,
    option: string,
    state: AutocompleteRenderOptionState
  ) => {
    const { key, ...optionProps } = props;
    let content;

    if (loading) {
      content = (
        <Skeleton
          variant="text"
          width={SEARCH_PLACEHOLDER_OPTIONS[state.index]}
        />
      );
    } else if (showNoOptions) {
      content = option;
    } else {
      const synonymAndTerm = cvTermsMap.current.get(option);
      const label = synonymAndTerm !== undefined ? (synonymAndTerm[1].labels[0] || "Unknown") : "Unknown"
      content = (
        <Box
          display="flex"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Box>{getOptionLabel(option)}</Box>
          <Box>{createNodeElement(label)}</Box>
        </Box>
      );
    }

    return (
      <Box
        key={key}
        component="li"
        sx={{ display: "flex" }}
        {...optionProps}
        onClick={(event: MouseEvent) => {
          if (cvTermsMap.current !== undefined) {
            const synonymAndTerm = cvTermsMap.current.get(option);
            submit(synonymAndTerm !== undefined ? synonymAndTerm[1] : undefined);
          }
          optionProps.onClick(event);
        }}
      >
        {content}
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
          const response = await fetchCVTerms(`${input}`, {
            signal: abortControllerRef.current?.signal,
          });
          const data: CVTermsResult[] = await response.json();

          if (data.length === 0) {
            setShowNoOptions(true);
            setOptions([NO_OPTIONS_TEXT]);
          } else {
            if (cvTermsMap.current !== undefined) {
              cvTermsMap.current.clear();
              data.forEach((row) => {
                cvTermsMap.current.set(row.cvTerm.properties.name || "Unknown", [row.synonym, row.cvTerm]);
              });
              setShowNoOptions(false);
              setOptions(Array.from(cvTermsMap.current.keys()));
            }
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
      openOnFocus={true}
      value={value}
      options={options}
      getOptionDisabled={() => showNoOptions}
      onChange={handleOnChange}
      onInputChange={handleOnInputChange}
      renderInput={handleRenderInput}
      renderOption={handleRenderOption}
      filterOptions={(x) => x}
      ListboxProps={{
        style: {
          maxHeight: "280px",
        },
      }}
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
