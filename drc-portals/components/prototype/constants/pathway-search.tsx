import { Box, IconButton, styled } from "@mui/material";

export const NodeFiltersContainer = styled(Box)({
  flexGrow: 1,
  display: "flex",
  position: "absolute",
  top: 2,
  left: 10,
  zIndex: 1,
  padding: "inherit",
});

export const PathwayModeBtnContainer = styled(Box)({
  flexGrow: 1,
  display: "flex",
  position: "absolute",
  bottom: 10,
  right: 10,
  zIndex: 1,
  padding: "inherit",
});

export const NodeFilterCarousel = styled(Box)(() => ({
  maxWidth: "475px",
  display: "flex",
  overflowX: "scroll",
  overflowY: "hidden",
  scrollBehavior: "smooth",
  scrollbarWidth: "none",
  overscrollBehavior: "contain",
}));

export const NodeFilterBox = styled(Box)(() => ({
  minWidth: "225px",
  paddingTop: "8px",
  paddingRight: "2px",
  paddingLeft: "2px",
}));

export const NodeFilterButton = styled(IconButton)(({ theme }) => ({
  color: "white",
  backgroundColor: theme.palette.secondary.main,
  "&:hover, &.Mui-focusVisible": {
    backgroundColor: theme.palette.secondary.dark,
  },
}));
