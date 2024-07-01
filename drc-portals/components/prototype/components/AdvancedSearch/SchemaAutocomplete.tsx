import { Autocomplete, TextField } from "@mui/material";
import { SyntheticEvent, useEffect, useState } from "react";
import { v4 } from "uuid";

import { SearchBarOption } from "../../types/schema-search";
import {
  CustomPaper,
  CustomPopper,
  createSearchPathEl,
  getOptions,
} from "../../utils/schema-search";

interface SchemaAutocompleteProps {
  value?: SearchBarOption[];
  onChange: (value: SearchBarOption[]) => void;
  // TODO: Could have a prop here for custom options, specifically could be useful for listing elements which exist in all current paths,
  // which are also a valid connection to the last element of this path
}

export default function SchemaAutocomplete(cmpProps: SchemaAutocompleteProps) {
  const { onChange } = cmpProps;
  const [value, setValue] = useState(cmpProps?.value || []);
  const [options, setOptions] = useState(getOptions(value));

  useEffect(() => {
    setOptions(getOptions(value.filter(stringFilter) as SearchBarOption[]));
  }, [value]);

  const stringFilter = (v: SearchBarOption | string) => typeof v !== "string";

  const getOptionLabel = (option: SearchBarOption | string) => {
    // Note that option *should* never be a string, MUI just requires it be included as an optional type when using `freeSolo`.
    return typeof option === "string" ? option : option.name;
  };

  // TODO: Seems like adding anonymous nodes/relationships to the search bar value actually solves a lot of problems down the line...should
  // strongly consider updating the implementation to do this.
  const handleOnChange = (
    event: SyntheticEvent,
    newValue: (SearchBarOption | string)[]
  ) => {
    // value can be a string due to the `freeSolo` option below. We don't want user input to be part of the current value, so we filter it
    // out. This effectively clears it if the user chooses an option from the dropdown.
    const filteredValue = newValue.filter(stringFilter) as SearchBarOption[];
    setValue(filteredValue);
    // TODO: Put this in the `value` effect above?
    onChange([...filteredValue]);
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
      InputProps={{
        ...params.InputProps,
        sx: {
          backgroundColor: "#FFF",
        },
      }}
      FormHelperTextProps={{
        ...params.FormHelperTextProps,
        style: { backgroundColor: "transparent" },
      }}
    />
  );

  return (
    <Autocomplete
      multiple
      freeSolo
      disableCloseOnSelect
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
