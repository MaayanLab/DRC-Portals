import { TabPanel as BaseTabPanel } from "@mui/base/TabPanel";
import { Box, Paper, TableCell, styled } from "@mui/material";

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
});

export const NodeFilterBox = styled(Box)(() => ({
  minWidth: "225px",
  paddingTop: "8px",
  paddingRight: "2px",
  paddingLeft: "2px",
}));

export const PathwayResultTabPanel = styled(BaseTabPanel)(() => ({
  width: "100%",
  height: "573px",
}));

export const TableViewContainer = styled(Paper)(() => ({
  display: "flex",
  flexDirection: "column",
  padding: "8px",
  width: "100%",
  height: "100%",
  overflowX: "auto",
}));

export const StyledTableCell = styled(TableCell)(() => ({
  color: "#2D5986",
  height: "38px",
  overflow: "hidden",
  padding: "6px 5px 6px 10px",
  textAlign: "left",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  backgroundColor: "#FFF",
}));

export const StyledHeaderCell = styled(StyledTableCell)(() => ({
  backgroundColor: "#CAD2E9",
  fontWeight: "bold",
}));

export const StyledHeaderCellWithDivider = styled(StyledHeaderCell)(() => ({
  position: "relative",
  ["&:not(:last-child)::after"]: {
    content: `""`,
    position: "absolute",
    top: "25%",
    bottom: "25%",
    right: "0",
    width: "1px",
    backgroundColor: "#2D5986",
  },
}));

export const StyledDataCell = styled(StyledTableCell)(() => ({
  minWidth: "150px",
  maxWidth: "200px",
  [":hover"]: {
    overflow: "visible",
    wordBreak: "break-all",
    whiteSpace: "normal",
  },
}));

export const PATHWAY_SEARCH_DEFAULT_LIMIT = 10;
export const PATHWAY_SEARCH_LIMIT_CHOICES = [10, 25, 50];


export const stringTypeConfigs = {
  name: {
    type: "string" as const,
  },
  id: {
    type: "string" as const,
  }
}

// Another usage example:
/*
export const numberTypeConfigs = {
  age_at_sampling: {
    type: "number" as const,
  }
}
*/
export const propertyTypeConfigs = {
  ...stringTypeConfigs,
  // ...numberTypeConfigs
};
