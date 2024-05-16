import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { Divider, Tooltip } from "@mui/material";

import { TransparentIconButton } from "../../constants/shared";

interface SearchBarEndAdornmentProps {
  showClearBtn: boolean;
  onClear: () => void;
  onSearch: () => void;
}

export default function SearchBarEndAdornment(
  cmpProps: SearchBarEndAdornmentProps
) {
  const { showClearBtn, onSearch, onClear } = cmpProps;

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
      <Tooltip title="Search" arrow>
        <TransparentIconButton aria-label="search" onClick={onSearch}>
          <SearchIcon />
        </TransparentIconButton>
      </Tooltip>
    </div>
  );
}
