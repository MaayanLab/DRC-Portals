import CloseIcon from "@mui/icons-material/Close";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Divider, Tooltip } from "@mui/material";

import { TransparentIconButton } from "../../constants/shared";

interface SchemaAutocompleteEndAdornmentProps {
  showBtns: boolean;
  onClear: () => void;
  onReverse: () => void;
}

export default function SchemaAutocompleteEndAdornment(
  cmpProps: SchemaAutocompleteEndAdornmentProps
) {
  const { showBtns, onReverse, onClear } = cmpProps;

  return (
    <div
      className="MuiAutocomplete-endAdornment"
      style={{
        display: "flex",
        alignItems: "center",
        position: "absolute",
      }}
    >
      <>
        {showBtns ? (
          <>
            <Tooltip title="Clear Search" arrow>
              <TransparentIconButton
                aria-label="clear search"
                onClick={onClear}
              >
                <CloseIcon className="MuiAutocomplete-clearIndicator" />
              </TransparentIconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem />
            <Tooltip title="Reverse Path" arrow>
              <TransparentIconButton
                aria-label="reverse-path"
                onClick={onReverse}
              >
                <SwapHorizIcon />
              </TransparentIconButton>
            </Tooltip>
          </>
        ) : null}
      </>
    </div>
  );
}
