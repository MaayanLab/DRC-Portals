"use client";

import SearchIcon from "@mui/icons-material/Search";

import { TransparentIconButton } from "../../constants/shared";

export default function PathwaySearchBarEndAdornment() {
  return (
    <div
      className="MuiAutocomplete-endAdornment"
      style={{
        display: "flex",
        alignItems: "center",
        position: "absolute",
      }}
    >
      <TransparentIconButton disabled>
        <SearchIcon />
      </TransparentIconButton>
    </div>
  );
}
