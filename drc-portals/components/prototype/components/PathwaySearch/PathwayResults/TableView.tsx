"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DownloadIcon from "@mui/icons-material/Download";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Pagination,
  PaginationItem,
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
  TextField,
  Typography,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { NestedMenuItem } from "mui-nested-menu";
import { ChangeEvent, KeyboardEvent, useCallback, useState } from "react";

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

interface TableViewProps {
  data: PathwaySearchResultRow[];
  limit: number;
  page: number;
  count: number;
  order: Order;
  orderBy: number | undefined;
  columns: ColumnData[];
  onReturnBtnClick: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onOrderByChange: (column: number | undefined, order: Order) => void;
  onColumnChange: (column: number, changes: Partial<ColumnData>) => void;
  onDownloadAll: () => Promise<void>;
}

export default function TableView(cmpProps: TableViewProps) {
  const {
    data,
    limit,
    page,
    order,
    orderBy,
    columns,
    count,
    onReturnBtnClick,
    onPageChange,
    onLimitChange,
    onOrderByChange,
    onColumnChange,
    onDownloadAll,
  } = cmpProps;
  const MAX_PAGE = Math.ceil(count / limit);
  const JUMP_TO_PAGE_DEFAULT_LABEL = "Jump to Page";
  const [selected, setSelected] = useState<boolean[]>(
    new Array(data.length).fill(false)
  );
  const [sortedColumn, setSortedColumn] = useState(orderBy);
  const [downloading, setDownloading] = useState(false);
  const [jumpToPageVal, setJumpToPageVal] = useState(page.toString());
  const [jumpToPageError, setJumpToPageError] = useState(false);
  const [jumpToPageHelperText, setJumpToPageHelperText] = useState<
    string | undefined
  >();
  const [colMenuAnchorEl, setColMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [colMenuColumn, setColMenuColumn] = useState<number>();
  const colMenuOpen = Boolean(colMenuAnchorEl);

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
    colMenuFnWrapper(onColumnChange, column, {
      displayProp: property,
    });
  };

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
        if (order === "asc") newOrder = "desc"; // order column by desc
        else if (order === "desc") newOrderBy = undefined; // unorder column
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

  const handleJumpToPageKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        const jumpToPageNum = Number(jumpToPageVal);
        if (Number.isNaN(jumpToPageNum)) {
          setJumpToPageError(true);
          setJumpToPageHelperText("Page must be a number");
        } else if (1 <= jumpToPageNum && jumpToPageNum <= MAX_PAGE) {
          onPageChange(jumpToPageNum);
        } else {
          setJumpToPageError(true);
          setJumpToPageHelperText(`Page must be between 1 and ${MAX_PAGE}`);
        }
      }
    },
    [jumpToPageVal]
  );

  const handleJumpToPageOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    setJumpToPageError(false);
    setJumpToPageHelperText(undefined);
    setJumpToPageVal(event.target.value);
  };

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    onLimitChange(Number(event.target.value));
  };

  return (
    <>
      {/* Start table */}
      <TableContainer
        component={Paper}
        elevation={0}
        variant="rounded-top"
        sx={{ flexGrow: 1 }}
      >
        <Table size="small" sx={{ borderCollapse: "separate" }}>
          <TableHead sx={{ position: "sticky", top: "0px", zIndex: 4 }}>
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
              {/* width: 1% forces minimal use of space */}
              <StyledHeaderCellWithDivider
                sx={{ width: "1%", padding: "6px 10px" }}
              >
                <Typography variant="body1">#</Typography>
              </StyledHeaderCellWithDivider>
              {columns.map((col, idx) => (
                <StyledHeaderCellWithDivider key={col.key}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
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
              ))}
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
                {row
                  .filter((col) => !isRelationshipResult(col))
                  .map((nodeCol, j) => (
                    <StyledDataCell key={j}>
                      {columns[j].valueGetter(
                        nodeCol as NodeResult,
                        columns[j].displayProp
                      )}
                    </StyledDataCell>
                  ))}
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
          <Pagination
            page={page}
            count={MAX_PAGE}
            onChange={(event, page) => onPageChange(page)}
            variant="text"
            shape="rounded"
            color="primary"
            renderItem={(item) => (
              <PaginationItem
                slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                {...item}
              />
            )}
          />
          <Box sx={{ position: "relative" }}>
            <TextField
              sx={{
                width: "150px",
                "& .MuiFormHelperText-root": {
                  top: "100%",
                  position: "absolute",
                },
              }}
              value={jumpToPageVal}
              aria-label={JUMP_TO_PAGE_DEFAULT_LABEL}
              label="Jump to Page"
              helperText={jumpToPageHelperText}
              error={jumpToPageError}
              onKeyDown={handleJumpToPageKeyDown}
              onChange={handleJumpToPageOnChange}
            />
          </Box>
          <Typography>(Total Rows: {count})</Typography>
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
          <Button
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
          </Button>
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
        </Stack>

        <ReturnBtn onClick={onReturnBtnClick} />
      </Stack>
      <Menu
        id="col-menu"
        anchorEl={colMenuAnchorEl}
        open={colMenuOpen}
        onClose={handleColMenuClose}
      >
        {colMenuColumn !== undefined ? (
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
