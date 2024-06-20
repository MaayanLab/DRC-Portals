import CloseIcon from "@mui/icons-material/Close";
import HubIcon from "@mui/icons-material/Hub";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import { Divider, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const { showClearBtn, onSearch, onAdvancedSearch, onClear } = cmpProps;

  const onSchemaMode = () => {
    router.push("/data/c2m2/graph/search/schema");
  };

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
          <TuneIcon />
        </TransparentIconButton>
      </Tooltip>
      <Tooltip title="Schema Mode" arrow>
        <TransparentIconButton aria-label="schema-mode" onClick={onSchemaMode}>
          <HubIcon />
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
