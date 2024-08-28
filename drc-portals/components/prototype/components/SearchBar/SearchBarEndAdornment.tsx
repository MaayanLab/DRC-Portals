"use client";

import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import { CircularProgress, Divider, Link, Tooltip } from "@mui/material";
import { useSearchParams } from "next/navigation";

import { TransparentIconButton } from "../../constants/shared";

interface SearchBarEndAdornmentProps {
  loading: boolean;
  showClearBtn: boolean;
  onClear: () => void;
  onSearch: () => void;
}

export default function SearchBarEndAdornment(
  cmpProps: SearchBarEndAdornmentProps
) {
  const searchParams = useSearchParams();
  const { loading, showClearBtn, onSearch, onClear } = cmpProps;
  const advancedSearchURL = `/data/c2m2/graph/search/advanced?${searchParams.toString()}`;

  return (
    <div
      className="MuiAutocomplete-endAdornment"
      style={{
        display: "flex",
        alignItems: "center",
        position: "absolute",
      }}
    >
      {loading ? (
        <CircularProgress color="inherit" size={20} />
      ) : (
        <>
          {showClearBtn ? (
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
            </>
          ) : null}
          <Tooltip title="Advanced Search" arrow>
            <Link href={advancedSearchURL}>
              <TransparentIconButton aria-label="advanced-search">
                <TuneIcon />
              </TransparentIconButton>
            </Link>
          </Tooltip>
          <Tooltip title="Search" arrow>
            <TransparentIconButton aria-label="search" onClick={onSearch}>
              <SearchIcon />
            </TransparentIconButton>
          </Tooltip>
        </>
      )}
    </div>
  );
}
