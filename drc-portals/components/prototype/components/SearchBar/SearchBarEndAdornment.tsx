import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import { Divider, Tooltip } from "@mui/material";

import { TransparentIconButton } from "../../constants/shared";

interface SearchBarEndAdornmentProps {
  showClearBtn: boolean;
  onClear: () => void;
  onSearch: () => void;
  onAdvancedSearch: () => void;
}

export default function SearchBarEndAdornment(
  cmpProps: SearchBarEndAdornmentProps
) {
  const { showClearBtn, onSearch, onAdvancedSearch, onClear } = cmpProps;

  return (
    <div
      className="MuiAutocomplete-endAdornment"
      style={{
        display: "flex",
        alignItems: "center",
        position: "absolute",
      }}
    >
      {showClearBtn ? (
        <>
          <Tooltip title="Clear Search" arrow>
            <TransparentIconButton aria-label="clear search" onClick={onClear}>
              <CloseIcon className="MuiAutocomplete-clearIndicator" />
            </TransparentIconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem />
        </>
      ) : null}
      <Tooltip title="Advanced Search" arrow>
        <TransparentIconButton
          aria-label="advanced-search"
          onClick={onAdvancedSearch}
        >
          <TextFieldsIcon />
        </TransparentIconButton>
      </Tooltip>
      <Tooltip title="Search" arrow>
        <TransparentIconButton aria-label="search" onClick={onSearch}>
          <SearchIcon />
        </TransparentIconButton>
      </Tooltip>
    </div>
  );
}
