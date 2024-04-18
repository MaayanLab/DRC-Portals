import Autocomplete from "@mui/material/Autocomplete";
import {
  CircularProgress,
  IconButton,
  Paper,
  Popper,
  styled,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import SettingsIcon from "@mui/icons-material/Settings";
import { KeyboardEvent, SyntheticEvent, useEffect, useState } from "react";
import { v4 } from "uuid";

import { DEFAULT_QUERY_SETTINGS } from "../../constants/search-bar";
import {
  SearchBarOption,
  SearchQuerySettings,
} from "../../interfaces/search-bar";
import {
  createCypher,
  createSearchPathEl,
  getOptions,
} from "../../utils/search-bar";

import SearchSettingsDialog from "./SearchBarSettingsDialog";

interface SearchBarProps {
  error: string | null;
  loading: boolean;
  clearError: () => void;
  onSubmit: (value: string) => void;
}

const SearchBarContainer = styled("div")({
  flexGrow: 1,
  position: "absolute",
  top: 10,
  left: 10,
  zIndex: 1,
  padding: "inherit",
});

/**
 * TODOS:
 * - Allow user to export the current chart data, import would reproduce what was exported (need to include the actual query in this?)
 * - Query limit
 */

export default function SearchBar(SearchBarProps: SearchBarProps) {
  const { error, loading, clearError, onSubmit } = SearchBarProps;
  const [value, setValue] = useState<SearchBarOption[]>([]);
  const [options, setOptions] = useState<SearchBarOption[]>(getOptions([]));
  const [settings, setSettings] = useState<SearchQuerySettings>(
    DEFAULT_QUERY_SETTINGS
  );
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  useEffect(() => {
    setOptions(getOptions(value.filter(stringFilter) as SearchBarOption[]));
  }, [value]);

  const submitSearch = (
    value: SearchBarOption[],
    settings: SearchQuerySettings
  ) => {
    if (value.length > 0) {
      onSubmit(createCypher(value, settings));
    }
  };

  const stringFilter = (v: SearchBarOption | string) => typeof v !== "string";

  const getOptionLabel = (option: SearchBarOption | string) => {
    // Note that option *should* never be a string, MUI just requires it be included as an optional type when using `freeSolo`.
    return typeof option === "string" ? option : option.name;
  };

  const CustomPaper = (props: any) => (
    <Paper {...props} sx={{ width: "fit-content" }} />
  );

  const CustomPopper = (props: any) => (
    <Popper {...props} placement="bottom-start" />
  );

  const handleInputKeydown = (e: KeyboardEvent) => {
    if (e.code === "Enter") {
      submitSearch(value, settings);
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
      label="Search Graph"
      helperText={error}
      error={error !== null}
      InputProps={{
        ...params.InputProps,
        sx: {
          backgroundColor: "#FFF",
        },
        startAdornment: (
          <>
            {value.length ? (
              <IconButton
                aria-label="search settings"
                onClick={handleClickSettingsDialogBtn}
                sx={{ marginRight: "8px" }}
              >
                <SettingsIcon />
              </IconButton>
            ) : null}
            {params.InputProps.startAdornment}
          </>
        ),
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

  const handleClickSettingsDialogBtn = () => {
    setSearchDialogOpen(true);
  };

  const handleDialogClose = () => {
    setSearchDialogOpen(false);
  };

  const handleDialogSubmit = (
    value: SearchBarOption[],
    settings: SearchQuerySettings
  ) => {
    setSearchDialogOpen(false);
    setValue(value);
    setSettings(settings);
    submitSearch(value, settings);
  };

  return (
    <SearchBarContainer>
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
      <SearchSettingsDialog
        value={value}
        settings={settings}
        open={searchDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
      />
    </SearchBarContainer>
  );
}
