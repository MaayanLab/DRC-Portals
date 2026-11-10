"use client";

import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  Link,
  Menu,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { styled } from "@mui/material/styles";
import { useState, useEffect } from "react";

import type {
  QueryResultRow,
  QueryResultRowCell,
} from "@/lib/text2cypher/neo4j/query-results";
import {
  getNodeDisplayLabel as formatNodeDisplayLabel,
  getQueryResultRowColumns,
  getQueryResultRowNodeColumns,
  getQueryResultRowRelationshipColumns,
  isQueryResultEdgeCell,
} from "@/lib/text2cypher/neo4j/query-results";
import { getActiveSchemaDefinition } from "@/lib/text2cypher/schema/active";
import { isHttpUrlLike } from "@/lib/text2cypher/utils/url";

export interface QueryResultsSelectionPayload {
  selectedRowIndexes: number[];
  selectedRowCount: number;
  totalRowCount: number;
}

interface QueryResultsTableProps {
  rows?: QueryResultRow[] | null;
  error?: string | null;
  isLoading?: boolean;
  title?: string;
  emptyMessage?: string;
  onSelectionChange?: (payload: QueryResultsSelectionPayload) => void;
}

const DEFAULT_LOADING_COLUMNS = ["Column 1", "Column 2", "Column 3"];

const isNodeCell = (
  value: QueryResultRowCell,
): value is {
  id: string;
  label: string;
  properties: Record<string, unknown>;
} => {
  return (
    value !== null &&
    typeof value === "object" &&
    "id" in value &&
    "label" in value &&
    "properties" in value &&
    !("source" in value && "target" in value && "type" in value)
  );
};

const formatCellValue = (value: QueryResultRowCell, property?: string) => {
  if (isNodeCell(value)) {
    if (property) {
      const propertyValue = value.properties[property];

      if (propertyValue === null || propertyValue === undefined) {
        return "null";
      }

      return typeof propertyValue === "object"
        ? JSON.stringify(propertyValue)
        : String(propertyValue);
    }

    return formatNodeDisplayLabel(value);
  }

  if (isQueryResultEdgeCell(value)) {
    return `${value.type} (${value.source} -> ${value.target})`;
  }

  return "null";
};

const getRowSelectionKey = (row: QueryResultRow, rowIndex: number) =>
  `${rowIndex}:${JSON.stringify(row)}`;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function QueryResultsTable({
  rows = null,
  error = null,
  isLoading = false,
  title = "Query Results",
  emptyMessage = "No results returned for this query.",
  onSelectionChange,
}: QueryResultsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [showRelationshipColumns, setShowRelationshipColumns] = useState(false);
  // Display-only overrides; they never affect row ordering or pagination.
  const [columnProperties, setColumnProperties] = useState<
    Record<string, string>
  >({});
  const [menuState, setMenuState] = useState<{
    column: string;
    anchor: HTMLElement;
  } | null>(null);
  const [submenuAnchor, setSubmenuAnchor] = useState<HTMLElement | null>(null);

  const closeMenu = () => {
    setMenuState(null);
    setSubmenuAnchor(null);
  };

  const getColumnPropertyOptions = (column: string) => {
    const nodeProperties = getActiveSchemaDefinition().nodeProperties;
    const options = new Set<string>();

    for (const row of rows ?? []) {
      const cell = row[column];

      if (isNodeCell(cell ?? null)) {
        (nodeProperties.get((cell as { label: string }).label) ?? []).forEach(
          (property) => options.add(property),
        );
      }
    }

    return Array.from(options);
  };

  const tableRows = rows ?? [];
  const resolvedColumns = getQueryResultRowColumns(tableRows);
  const nodeColumns = getQueryResultRowNodeColumns(tableRows);
  const relationshipColumns = getQueryResultRowRelationshipColumns(tableRows);
  const visibleColumns =
    showRelationshipColumns || nodeColumns.length === 0
      ? resolvedColumns
      : nodeColumns;
  const headerColumns =
    isLoading && visibleColumns.length === 0
      ? DEFAULT_LOADING_COLUMNS
      : visibleColumns;

  const emptyState = !isLoading && !error && tableRows.length === 0;

  const rowSelectionKeys = tableRows.map((row, rowIndex) =>
    getRowSelectionKey(row, rowIndex),
  );
  const selectableRowCount = isLoading ? 0 : tableRows.length;
  const selectedRowCount = isLoading
    ? 0
    : rowSelectionKeys.filter((rowKey) => selectedRowKeys.has(rowKey)).length;
  const allRowsSelected =
    selectableRowCount > 0 && selectedRowCount === selectableRowCount;
  const partiallySelected =
    selectedRowCount > 0 && selectedRowCount < selectableRowCount;

  useEffect(() => {
    if (!onSelectionChange) {
      return;
    }

    const selectedRowIndexes: number[] = [];

    rowSelectionKeys.forEach((rowKey, rowIndex) => {
      if (selectedRowKeys.has(rowKey)) {
        selectedRowIndexes.push(rowIndex);
      }
    });

    onSelectionChange({
      selectedRowIndexes,
      selectedRowCount: selectedRowIndexes.length,
      totalRowCount: tableRows.length,
    });
  }, [onSelectionChange, rowSelectionKeys, tableRows.length, selectedRowKeys]);

  const handleToggleAllRows = () => {
    if (allRowsSelected) {
      setSelectedRowKeys(new Set());
      return;
    }

    setSelectedRowKeys(new Set(rowSelectionKeys));
  };

  const handleToggleRow = (rowKey: string) => {
    setSelectedRowKeys((currentSelection) => {
      const nextSelection = new Set(currentSelection);

      if (nextSelection.has(rowKey)) {
        nextSelection.delete(rowKey);
      } else {
        nextSelection.add(rowKey);
      }

      return nextSelection;
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 220 }}>
      {title ? (
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
      ) : null}

      {error ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 180,
          }}
        >
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : null}

      {!error && emptyState ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 180,
          }}
        >
          <Typography color="text.secondary">{emptyMessage}</Typography>
        </Paper>
      ) : !error ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {relationshipColumns.length > 0 ? (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={showRelationshipColumns}
                    onChange={(event) => {
                      setShowRelationshipColumns(event.target.checked);
                    }}
                  />
                }
                label="Show relationship columns"
                sx={{ mr: 0 }}
              />
            </Box>
          ) : null}

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ maxHeight: 420, overflow: "auto" }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell padding="checkbox">
                    <Checkbox
                      checked={allRowsSelected}
                      indeterminate={partiallySelected}
                      disabled={selectableRowCount === 0}
                      onChange={handleToggleAllRows}
                      sx={{
                        "& .MuiSvgIcon-root": {
                          color: "white",
                        },
                      }}
                    />
                  </StyledTableCell>
                  {headerColumns.map((column) => (
                    <StyledTableCell key={column}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <span>
                          {column}
                          {columnProperties[column]
                            ? ` (${columnProperties[column]})`
                            : ""}
                        </span>
                        {!isLoading &&
                        getColumnPropertyOptions(column).length > 0 ? (
                          <IconButton
                            size="small"
                            aria-label={`Column options for ${column}`}
                            onClick={(event) =>
                              setMenuState({
                                column,
                                anchor: event.currentTarget,
                              })
                            }
                            sx={{ color: "white", ml: "auto" }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        ) : null}
                      </Box>
                    </StyledTableCell>
                  ))}
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }, (_, index) => (
                    <StyledTableRow key={`loading-row-${index}`}>
                      <StyledTableCell padding="checkbox">
                        <Checkbox disabled />
                      </StyledTableCell>
                      {headerColumns.map((column) => (
                        <StyledTableCell
                          key={`${column}-${index}`}
                          sx={{ minWidth: 120 }}
                        >
                          <Skeleton variant="text" width="70%" />
                        </StyledTableCell>
                      ))}
                    </StyledTableRow>
                  ))
                ) : tableRows.length === 0 ? (
                  <StyledTableRow>
                    <StyledTableCell
                      colSpan={(headerColumns.length || 1) + 1}
                      align="center"
                    >
                      <Typography color="text.secondary">
                        {emptyMessage}
                      </Typography>
                    </StyledTableCell>
                  </StyledTableRow>
                ) : (
                  tableRows.map((row, rowIndex) => {
                    const rowKey = getRowSelectionKey(row, rowIndex);

                    return (
                      <StyledTableRow key={`row-${rowKey}`} hover>
                        <StyledTableCell padding="checkbox">
                          <Checkbox
                            checked={selectedRowKeys.has(rowKey)}
                            onChange={() => handleToggleRow(rowKey)}
                          />
                        </StyledTableCell>
                        {headerColumns.map((column) => {
                          const value = row[column];
                          const formattedValue = formatCellValue(
                            value ?? null,
                            columnProperties[column],
                          );
                          const isLinkValue = isHttpUrlLike(formattedValue);

                          return (
                            <StyledTableCell
                              key={`${rowIndex}-${column}`}
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              {isLinkValue ? (
                                <Link
                                  href={formattedValue}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  underline="hover"
                                >
                                  {formattedValue}
                                </Link>
                              ) : (
                                formattedValue
                              )}
                            </StyledTableCell>
                          );
                        })}
                      </StyledTableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Menu
            anchorEl={menuState?.anchor ?? null}
            open={menuState !== null}
            onClose={closeMenu}
          >
            <Box
              onMouseEnter={(event) => setSubmenuAnchor(event.currentTarget)}
              onMouseLeave={() => setSubmenuAnchor(null)}
            >
              <MenuItem>
                <Typography sx={{ flexGrow: 1 }}>Set column property</Typography>
                <ChevronRightIcon fontSize="small" />
              </MenuItem>
              <Popper
                open={submenuAnchor !== null && menuState !== null}
                anchorEl={submenuAnchor}
                placement="right-start"
                sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
              >
                <Paper elevation={8} sx={{ maxHeight: 320, overflow: "auto" }}>
                  <MenuList dense>
                    {(menuState
                      ? getColumnPropertyOptions(menuState.column)
                      : []
                    ).map((property) => (
                      <MenuItem
                        key={property}
                        selected={
                          menuState !== null &&
                          columnProperties[menuState.column] === property
                        }
                        onClick={() => {
                          if (menuState) {
                            setColumnProperties((current) => ({
                              ...current,
                              [menuState.column]: property,
                            }));
                          }
                          closeMenu();
                        }}
                      >
                        {property}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Paper>
              </Popper>
            </Box>
          </Menu>
        </Box>
      ) : null}
    </Box>
  );
}
