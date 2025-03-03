import { TabPanel as BaseTabPanel } from "@mui/base/TabPanel";
import { Box, Paper, TableCell, styled, tableCellClasses } from "@mui/material";

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
  [`&.${tableCellClasses.root}`]: {
    color: "#2D5986",
    height: "38px",
    overflow: "hidden",
    textAlign: "left",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#CAD2E9",
    fontWeight: "bold",
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
