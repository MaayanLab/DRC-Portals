import { Box, styled } from "@mui/material";

export const SearchBarContainer = styled(Box)({
  flexGrow: 1,
  display: "flex",
  position: "absolute",
  top: 10,
  left: 10,
  zIndex: 1,
  padding: "inherit",
});

export const BASIC_SEARCH_ERROR_MSG =
  "An error occured during your search. Please try again later.";

export const NO_RESULTS_ERROR_MSG =
  "We couldn't find any results for your search";
