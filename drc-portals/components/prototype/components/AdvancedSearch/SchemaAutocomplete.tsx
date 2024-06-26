import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { SyntheticEvent, useEffect, useState } from "react";
import { v4 } from "uuid";

import { SearchBarState } from "../../interfaces/query-builder";
import { SearchBarOption } from "../../types/query-builder";
import {
  CustomPaper,
  CustomPopper,
  createSearchPathEl,
  getOptions,
} from "../../utils/query-builder";

interface SchemaAutocompleteProps {
  state: SearchBarState | undefined;
  error: string | null;
  loading: boolean;
  clearError: () => void;
  onSubmit: (state: SearchBarState) => void;
}

export default function SchemaAutocomplete(cmpProps: SchemaAutocompleteProps) {
  const { state, error, loading, clearError, onSubmit } = cmpProps;
  const [value, setValue] = useState(state?.value || []);
  const [options, setOptions] = useState(getOptions(value));

  useEffect(() => {
    setOptions(getOptions(value.filter(stringFilter) as SearchBarOption[]));
  }, [value]);

  useEffect(() => {
    if (state !== undefined) {
      setValue(state.value);
    }
  }, [state]);

  const submitSearch = (value: SearchBarOption[]) => {
    if (value.length > 0) {
      onSubmit({ value });
    }
  };

  const stringFilter = (v: SearchBarOption | string) => typeof v !== "string";

  const getOptionLabel = (option: SearchBarOption | string) => {
    // Note that option *should* never be a string, MUI just requires it be included as an optional type when using `freeSolo`.
    return typeof option === "string" ? option : option.name;
  };

  const handleInputKeydown = (e: KeyboardEvent) => {
    if (e.code === "Enter") {
      submitSearch(value);
    }
  };

  // TODO: Seems like adding anonymous nodes/relationships to the search bar value actually solves a lot of problems down the line...should
  // strongly consider updating the implementation to do this.
  const handleOnChange = (
    event: SyntheticEvent,
    newValue: (SearchBarOption | string)[]
  ) => {
    clearError();

    // value can be a string due to the `freeSolo` option below. We don't want user input to be part of the current value, so we filter it
    // out. This effectively clears it if the user submits the search or chooses an option from the dropdown.
    setValue(newValue.filter(stringFilter) as SearchBarOption[]);
  };

  const handleRenderOption = (
    props: any,
    option: SearchBarOption,
    state: any
  ) => (
    <li
      {...props}
      style={
        state.index !== options.length - 1
          ? {
              ...props.style,
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            }
          : props.style
      }
      key={v4()}
    >
      {createSearchPathEl(value.concat(option))}
    </li>
  );

  // TODO: If any element in the value list has filters set, add an asterisk to it
  const handleRenderTags = (value: SearchBarOption[]) =>
    createSearchPathEl(value);

  const handleRenderInput = (params: any) => (
    <TextField
      {...params}
      color="secondary"
      label="Path"
      helperText={error}
      error={error !== null}
      InputProps={{
        ...params.InputProps,
        sx: {
          backgroundColor: "#FFF",
        },
        endAdornment: loading ? (
          <CircularProgress color="inherit" size={20} />
        ) : (
          params.InputProps.endAdornment
        ),
      }}
      FormHelperTextProps={{
        ...params.FormHelperTextProps,
        style: { backgroundColor: "transparent" },
      }}
      onKeyDown={handleInputKeydown}
    />
  );

  return (
    <Autocomplete
      multiple
      freeSolo
      forcePopupIcon={!loading}
      disableClearable={loading}
      disableCloseOnSelect
      loading={loading}
      options={options}
      value={value}
      isOptionEqualToValue={(option, value) => false} // This combined with `freeSolo` allows an option to be chosen more than once
      getOptionLabel={getOptionLabel}
      onChange={handleOnChange}
      renderOption={handleRenderOption}
      renderTags={handleRenderTags}
      renderInput={handleRenderInput}
      PaperComponent={CustomPaper}
      PopperComponent={CustomPopper}
      sx={{
        borderRadius: "4px",
        width: "auto",
        minWidth: "340px",
        backgroundColor: "transparent",
      }}
    />
  );
}
