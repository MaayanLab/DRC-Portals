"use client";

import Autocomplete, {
  AutocompleteOwnerState,
  AutocompleteRenderOptionState,
} from "@mui/material/Autocomplete";
import { debounce, Box, Skeleton } from "@mui/material";
import { SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";

import { fetchCVTerms } from "@/lib/neo4j/api";
import { CVTermsResult, NodeResult } from "@/lib/neo4j/types";

import PathwaySearchBarInput from "./PathwaySearchBarInput";

interface PathwaySearchBarProps {
  onSubmit: (cvTerm: NodeResult) => void;
}

export default function PathwaySearchBar(cmpProps: PathwaySearchBarProps) {
  const { onSubmit } = cmpProps;
  const [value, setValue] = useState<string>("");
  const [options, setOptions] = useState<readonly string[]>([]);
  const [loading, setLoading] = useState(false);
  const cvTermsMap = useRef(new Map<string, NodeResult>());
  const PLACEHOLDER_OPTIONS = [80, 110, 145, 170, 240];

  const submit = (cvTerm: NodeResult | undefined) => {
    if (cvTerm !== undefined) {
      onSubmit(cvTerm);
    }
  };

  // OnChange fires when an option is chosen from the autocomplete
  const handleOnChange = (event: SyntheticEvent, option: string | null) => {
    if (option === null) {
      setValue("");
    } else {
      if (cvTermsMap.current !== undefined) {
        const cvTerm = cvTermsMap.current.get(option);
        setValue(option);
        submit(cvTerm);
      }
    }
  };

  // OnInputChange fires anytime the text value of the autocomplete changes
  const handleOnInputChange = (
    event: SyntheticEvent,
    option: string,
    reason: string
  ) => {
    if (cvTermsMap.current !== undefined) {
      setValue(option);
    }
  };

  const handleRenderInput = (params: any) => (
    <PathwaySearchBarInput inputParams={params} />
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
        {loading ? (
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
        setLoading(true);
        setOptions(PLACEHOLDER_OPTIONS.map((option) => option.toString()));

        try {
          const response = await fetchCVTerms(`"${input}"`);
          const data: CVTermsResult[] = await response.json();
          if (cvTermsMap.current !== undefined) {
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
    []
  );

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
