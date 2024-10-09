import { Box, styled } from "@mui/material";

export const NodeFiltersContainer = styled(Box)({
  flexGrow: 1,
  display: "flex",
  position: "absolute",
  top: 10,
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

export const filterCarouselContainerWidth = 475;
export const filterCarouselItemWidth = 225;
export const filterCarouselItemPaddingX = 4;
