"use client";

import Autocomplete from "@mui/material/Autocomplete";
import { debounce } from "@mui/material";
import {
  KeyboardEvent,
  SyntheticEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import SearchBarInput from "./SearchBarInput";
import { getDriver } from "../../neo4j";
import Neo4jService from "../../services/neo4j";
import {
  createSynonymOptionsCypher,
  inputIsValidLucene,
} from "../../utils/neo4j";

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
  const neo4jService = new Neo4jService(getDriver());

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
      submit(`"${newValue}"`);
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

  const fetchOptions = useMemo(
    () =>
      debounce(async (input: string) => {
        if (inputIsValidLucene(input)) {
          await neo4jService
            .executeRead(createSynonymOptionsCypher(), { input })
            .then((records) => {
              setOptions(records.map((record) => record.get("synonym")));
            })
            .catch((error) => {
              console.debug(error);
              setOptions([]);
            });
        } else {
          // If the input was not Lucene parseable, then don't attempt to run a query and instead reset the options list
          setOptions([]);
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
      options={options}
      onChange={handleOnChange}
      onInputChange={handleOnInputChange}
      renderInput={handleRenderInput}
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
