import { CircularProgress, TextField } from "@mui/material";
import { KeyboardEvent } from "react";

import SearchBarEndAdornment from "./SearchBarEndAdornment";

interface SearchBarInputProps {
  inputParams: any;
  error: string | null;
  loading: boolean;
  showClearBtn: boolean;
  onClear: () => void;
  onSearch: () => void;
  onAdvancedSearch: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
}

export default function SearchBarInput(cmpProps: SearchBarInputProps) {
  const {
    inputParams,
    error,
    loading,
    showClearBtn,
    onClear,
    onSearch,
    onAdvancedSearch,
    onKeyDown,
  } = cmpProps;
  return (
    <TextField
      {...inputParams}
      color="secondary"
      label="Search Graph"
      helperText={error}
      error={error !== null}
      InputProps={{
        ...inputParams.InputProps,
        sx: {
          backgroundColor: "#FFF",
        },
        endAdornment: loading ? (
          <CircularProgress color="inherit" size={20} />
        ) : (
          <SearchBarEndAdornment
            showClearBtn={showClearBtn}
            onSearch={onSearch}
            onAdvancedSearch={onAdvancedSearch}
            onClear={onClear}
          />
        ),
      }}
      FormHelperTextProps={{
        ...inputParams.FormHelperTextProps,
        style: { backgroundColor: "transparent" },
      }}
      onKeyDown={onKeyDown}
    />
  );
}
