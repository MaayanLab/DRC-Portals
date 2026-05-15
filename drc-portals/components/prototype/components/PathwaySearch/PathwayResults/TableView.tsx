"use client";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DownloadIcon from "@mui/icons-material/Download";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { NestedMenuItem } from "mui-nested-menu";
import { useCallback, useMemo, useState } from "react";

import DRSBundleButton from "@/app/data/c2m2/DRSBundleButton";

import { NodeResult, PathwaySearchResultRow } from "@/lib/neo4j/types";
import { isRelationshipResult } from "@/lib/neo4j/utils";

import {
  PATHWAY_SEARCH_LIMIT_CHOICES,
  StyledDataCell,
  StyledHeaderCell,
  StyledHeaderCellWithDivider,
  StyledTableCell,
} from "@/components/prototype/constants/pathway-search";
import { ColumnData } from "@/components/prototype/interfaces/pathway-search";
import { Order } from "@/components/prototype/types/pathway-search";
import { getPropertyListFromNodeLabel } from "@/components/prototype/utils/pathway-search";
import { downloadBlob } from "@/components/prototype/utils/shared";

import ReturnBtn from "../ReturnBtn";

import ColumnsPanel from "./ColumnsPanel";
import PathwayTablePagination from "./PathwayTablePagination";

interface TableViewProps {
  data: PathwaySearchResultRow[];
  limit: number;
  page: number;
  lowerPageBound: number;
  upperPageBound: number;
  order: Order;
  orderBy: number | undefined;
  columns: ColumnData[];
  onReturnBtnClick: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onOrderByChange: (column: number | undefined, order: Order) => void;
  onColumnPropertyChange: (column: number, changes: Partial<ColumnData>) => void;
  onColumnVisibilityChange: (columns: ColumnData[]) => void;
  onDownloadAll: () => Promise<void>;
}

export default function TableView(cmpProps: TableViewProps) {
  const {
    data,
    limit,
    page,
    lowerPageBound,
    upperPageBound,
    order,
    orderBy,
    columns,
    onReturnBtnClick,
    onPageChange,
    onLimitChange,
    onOrderByChange,
    onColumnPropertyChange,
    onColumnVisibilityChange,
    onDownloadAll,
  } = cmpProps;
  const [selected, setSelected] = useState<boolean[]>(
    new Array(data.length).fill(false)
  );
  const [sortedColumn, setSortedColumn] = useState(orderBy);
  const [downloading, setDownloading] = useState(false);
  const [colMenuAnchorEl, setColMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [colMenuColumn, setColMenuColumn] = useState<number>();
  const colMenuOpen = Boolean(colMenuAnchorEl);
  const [colVisibilityMenuAnchorEl, setColVisibilityMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const colVisibilityMenuOpen = Boolean(colVisibilityMenuAnchorEl);

  const drsBundleData = useMemo(
    () =>
      data
        .filter((_, idx) => selected[idx])
        .flat()
        .filter((element) => !isRelationshipResult(element))
        .map((node) => node.properties),
    [data, selected]
  );

  const getColumnHeaderText = (column: ColumnData) => {
    return (
      column.label +
      (column.postfix === undefined ? "" : `-${column.postfix}`) +
      `.${column.displayProp}`
    );
  };

  const handleCheckboxChange = useCallback(
    (rowIdx: number) => {
      setSelected(
        selected.map((rowChecked, idx) =>
          idx === rowIdx ? !rowChecked : rowChecked
        )
      );
    },
    [selected]
  );

  const handleColSort = (column: number | undefined, order: Order) => {
    setSortedColumn(column);
    onOrderByChange(column, order);
  };

  const handleColMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    column: number
  ) => {
    setColMenuColumn(column);
    setColMenuAnchorEl(event.currentTarget);
  };

  const handleColMenuClose = () => {
    setColMenuAnchorEl(null);
  };

  const handleColVisibilityMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setColVisibilityMenuAnchorEl(event.currentTarget);
  };

  const handleColVisibilityMenuClose = () => {
    setColVisibilityMenuAnchorEl(null);
  };

  const colMenuFnWrapper = <Args extends any[]>(
    fn: (...args: Args) => void,
    ...args: Args
  ) => {
    fn(...args);
    handleColMenuClose();
  };

  const handleColMenuSort = (column: number | undefined, order: Order) => {
    colMenuFnWrapper(handleColSort, column, order);
  };

  const handleColMenuPropertyUpdate = (column: number, property: string) => {
    colMenuFnWrapper(onColumnPropertyChange, column, {
      displayProp: property,
    });
  };

  const handleColumnVisibilitySwitch = useCallback(
    (changedColumn: number) => {
      const newColumns = columns.map((col, idx) =>
        idx === changedColumn ? { ...col, visible: !columns[changedColumn].visible } : { ...col }
      );
      onColumnVisibilityChange(newColumns);
    },
    [columns]
  );

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(new Array(data.length).fill(true));
    } else {
      setSelected(new Array(data.length).fill(false));
    }
  };

  const handleSortBtnClicked = useCallback(
    (event: React.MouseEvent<unknown>, column: number) => {
      let newOrder: Order = undefined;
      let newOrderBy: number | undefined = column;

      if (sortedColumn === column) {
        if (order === "asc")
          newOrder = "desc"; // order column by desc
        else if (order === "desc")
          newOrderBy = undefined; // unorder column
        else newOrder = "asc"; // order column by asc
      } else {
        newOrder = "asc"; // order column by asc
      }

      handleColSort(newOrderBy, newOrder);
    },
    [order, sortedColumn]
  );

  const handleDownloadSelectedClicked = useCallback(() => {
    const jsonString = JSON.stringify(
      data
        .filter((_, idx) => selected[idx])
        .map((row) => row.filter((element) => !isRelationshipResult(element)))
    );
    downloadBlob(jsonString, "application/json", "c2m2-graph-data.json");
  }, [data, selected]);

  const handleDownloadAllClicked = () => {
    setDownloading(true);
    onDownloadAll().then(() => setDownloading(false));
  };

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    onLimitChange(Number(event.target.value));
  };

  return (
    <>
      {/* Start table header */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ flexGrow: 1, borderRadius: 0 }}
      >
        <Table size="small" sx={{ borderCollapse: "separate" }}>
          <TableHead sx={{ position: "sticky", top: "0px", zIndex: 5 }}>
            {/*Table Toolbar*/}
            <TableRow>
              <StyledHeaderCell
                // 2 extra columns for the checkbox and row #
                colSpan={columns.length + 2}
                sx={{
                  position: "sticky",
                  left: 0,
                  zIndex: 3,
                  borderTopLeftRadius: "4px",
                  borderTopRightRadius: "4px",
                  backgroundColor: "#fff",
                  border: "1px solid #DCDBDC",
                  borderBottomColor: "#CAD2E9",
                  paddingBottom: 0
                }}
              >
                <Button
                  sx={{
                    backgroundColor: "#CAD2E9",
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    padding: "5px 12px",
                    '&:hover': {
                      backgroundColor: '#C3E1E6', // Hover background color
                    },
                  }}
                  color="secondary"
                  size="small"
                  startIcon={<ViewColumnIcon />}
                  onClick={handleColVisibilityMenuClick}
                >
                  Columns
                </Button>
              </StyledHeaderCell>
            </TableRow>
            <TableRow>
              <StyledHeaderCell
                padding="checkbox"
                sx={{ position: "sticky", left: 0, zIndex: 3 }}
              >
                <Checkbox
                  indeterminate={
                    selected.some((val) => val) && // Some checked
                    selected.some((val) => !val) // And some not checked
                  }
                  indeterminateIcon={
                    <IndeterminateCheckBoxIcon sx={{ color: "#2D5986" }} />
                  }
                  checked={selected.every((val) => val)}
                  onChange={handleSelectAllClick}
                />
              </StyledHeaderCell>
              <StyledHeaderCellWithDivider
                sx={{ width: "1%", padding: "6px 10px" }}
              >
                <Typography variant="body1">#</Typography>
              </StyledHeaderCellWithDivider>
              {columns
                .map((col, idx) => (
                  <StyledHeaderCellWithDivider key={col.key}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <TableSortLabel
                        disabled={false}
                        active={sortedColumn === idx && order !== undefined}
                        direction={sortedColumn === idx ? order : "asc"}
                        onClick={(event) => handleSortBtnClicked(event, idx)}
                      >
                        {getColumnHeaderText(col)}
                        {sortedColumn === idx ? (
                          <Box component="span" sx={visuallyHidden}>
                            {order === "desc"
                              ? "sorted descending"
                              : "sorted ascending"}
                          </Box>
                        ) : null}
                      </TableSortLabel>
                      <IconButton
                        size="small"
                        onClick={(event) => handleColMenuClick(event, idx)}
                      >
                        <MoreVertIcon fontSize="inherit" />
                      </IconButton>
                    </Box>
                  </StyledHeaderCellWithDivider>
                ))
                .filter((_, j) => columns[j].visible) // Skip hidden columns
              }
            </TableRow>
          </TableHead>
          <TableBody sx={{ zIndex: 4 }}>
            {data.map((row, i) => (
              <TableRow key={`row-${i}`}>
                <StyledTableCell
                  padding="checkbox"
                  sx={{ position: "sticky", left: 0, zIndex: 3 }}
                >
                  <Checkbox
                    checked={selected[i]}
                    onChange={() => handleCheckboxChange(i)}
                  />
                </StyledTableCell>
                <StyledTableCell>{(page - 1) * limit + i + 1}</StyledTableCell>
                {
                  row
                    .filter((col) => !isRelationshipResult(col)) // Skip relationship data (this shrinks the row width to match the length of `columns`)
                    .map((nodeCol, j) => {
                      const visibleColumns = columns.filter(col => col.visible);
                      return (
                        <StyledDataCell key={j}>
                          {visibleColumns[j].valueGetter(
                            nodeCol as NodeResult,
                            visibleColumns[j].displayProp
                          )}
                        </StyledDataCell>
                      )
                    })
                }
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Start pagination */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginTop={1}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <PathwayTablePagination
            page={page}
            lowerBound={lowerPageBound}
            upperBound={upperPageBound}
            onChange={onPageChange}
          />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="nav" noWrap>
            Rows per page:
          </Typography>

          <FormControl size="small">
            <Select value={limit} onChange={handleLimitChange}>
              {PATHWAY_SEARCH_LIMIT_CHOICES.map((rowsPerPage) => (
                <MenuItem key={rowsPerPage} value={rowsPerPage}>
                  {rowsPerPage}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Start download buttons */}
      <Stack direction="row" marginTop={1} justifyContent="space-between">
        <Stack direction="row" spacing={1}>
          {selected.some((val) => val) ? (
            <DRSBundleButton data={drsBundleData} />
          ) : null}
          {selected.some((val) => val) ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadSelectedClicked}
            >
              Download Selected
            </Button>
          ) : null}
          {/* <Button
            variant="contained"
            color="primary"
            startIcon={
              downloading ? (
                <CircularProgress color="secondary" size={20} />
              ) : (
                <DownloadIcon />
              )
            }
            onClick={handleDownloadAllClicked}
          >
            Download All
          </Button> */}
        </Stack>

        <ReturnBtn onClick={onReturnBtnClick} />
      </Stack>
      <Menu
        id="col-visibility-menu"
        anchorEl={colVisibilityMenuAnchorEl}
        open={colVisibilityMenuOpen}
        onClose={handleColVisibilityMenuClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: 48 * 4.5,
              width: "20ch",
            },
          },
        }}
      >
        <ColumnsPanel
          columns={columns}
          onSwitch={handleColumnVisibilitySwitch}
        />
      </Menu>
      {/* Individual Column Menu */}
      <Menu
        id="col-menu"
        anchorEl={colMenuAnchorEl}
        open={colMenuOpen}
        onClose={handleColMenuClose}
      >
        {colMenuColumn !== undefined ? (
          <>
            <MenuItem onClick={() => handleColumnVisibilitySwitch(colMenuColumn)}>
              <ListItemIcon>
                <VisibilityOffIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Hide Column</ListItemText>
            </MenuItem>
            <NestedMenuItem
              rightIcon={<KeyboardArrowRightIcon />}
              parentMenuOpen={colMenuOpen}
              renderLabel={() => "Set column property"}
              sx={{ paddingX: "16px" }}
            >
              {getPropertyListFromNodeLabel(columns[colMenuColumn].label).map(
                (property, idx) => (
                  <MenuItem
                    key={`column-menu-prop-select-${idx}`}
                    onClick={() =>
                      handleColMenuPropertyUpdate(colMenuColumn, property)
                    }
                  >
                    {property}
                  </MenuItem>
                )
              )}
            </NestedMenuItem>
          </>
        ) : null}
        {colMenuColumn !== sortedColumn ||
          order === undefined ||
          order === "desc" ? (
          <MenuItem onClick={() => handleColMenuSort(colMenuColumn, "asc")}>
            <ListItemIcon>
              <ArrowUpwardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sort by ASC</ListItemText>
          </MenuItem>
        ) : null}
        {colMenuColumn !== sortedColumn ||
          order === undefined ||
          order === "asc" ? (
          <MenuItem onClick={() => handleColMenuSort(colMenuColumn, "desc")}>
            <ListItemIcon>
              <ArrowDownwardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sort by DESC</ListItemText>
          </MenuItem>
        ) : null}
        {colMenuColumn === sortedColumn && order !== undefined ? (
          <MenuItem onClick={() => handleColMenuSort(undefined, undefined)}>
            <ListItemIcon />
            <ListItemText>Unsort</ListItemText>
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );
}
