"use client";

import Autocomplete from "@mui/material/Autocomplete";
import { KeyboardEvent, SyntheticEvent, useState } from "react";

import SearchBarInput from "./SearchBarInput";

interface SearchBarProps {
  value: string | null;
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
  const [value, setValue] = useState<string | null>(cmpProps.value);

  const submit = () => {
    if (value !== null && value.length > 0) {
      onSubmit(value);
    }
  };

  const handleInputKeydown = (e: KeyboardEvent) => {
    if (e.code === "Enter") {
      submit();
    }
  };

  const handleOnChange = (event: SyntheticEvent, newValue: string | null) => {
    clearError();
    setValue(newValue);
  };

  const handleOnInputChange = (event: SyntheticEvent, newValue: string) => {
    clearError();
    setValue(newValue);
  };

  const handleRenderInput = (params: any) => (
    <SearchBarInput
      inputParams={params}
      error={error}
      loading={loading}
      showClearBtn={value !== null && value.length > 0}
      onClear={() => setValue("")}
      onSearch={submit}
      onKeyDown={handleInputKeydown}
    />
  );

  return (
    <Autocomplete
      freeSolo
      value={value}
      options={[]}
      onChange={handleOnChange}
      onInputChange={handleOnInputChange}
      renderInput={handleRenderInput}
      sx={{
        borderRadius: "4px",
        width: "auto",
        minWidth: "510px",
        backgroundColor: "transparent",
      }}
    />
  );
}
