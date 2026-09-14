import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import type { QueryTableRow } from "@/lib/text2cypher/neo4j/query-results";

interface QueryResultsTableProps {
  rows: QueryTableRow[];
  columns?: string[];
  isLoading?: boolean;
  title?: string;
  emptyMessage?: string;
}

const DEFAULT_LOADING_COLUMNS = ["Column 1", "Column 2", "Column 3"];

const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "null";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => formatCellValue(entry)).join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const getColumns = (rows: QueryTableRow[], explicitColumns?: string[]) => {
  if (explicitColumns && explicitColumns.length > 0) {
    return explicitColumns;
  }

  const keys = new Set<string>();
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => keys.add(key));
  });

  return Array.from(keys);
};

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
  rows,
  columns,
  isLoading = false,
  title = "Query Results",
  emptyMessage = "No results returned for this query.",
}: QueryResultsTableProps) {
  const resolvedColumns = getColumns(rows, columns);
  const displayColumns =
    isLoading && resolvedColumns.length === 0
      ? DEFAULT_LOADING_COLUMNS
      : resolvedColumns;

  const emptyState =
    !isLoading && rows.length === 0 && resolvedColumns.length === 0;

  const headerColumns = isLoading ? DEFAULT_LOADING_COLUMNS : displayColumns;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 220 }}>
      {title ? (
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
      ) : null}

      {emptyState ? (
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
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ maxHeight: 420, overflow: "auto" }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <StyledTableRow>
                {headerColumns.map((column) => (
                  <StyledTableCell key={column}>{column}</StyledTableCell>
                ))}
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }, (_, index) => (
                  <StyledTableRow key={`loading-row-${index}`}>
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
              ) : rows.length === 0 ? (
                <StyledTableRow>
                  <StyledTableCell
                    colSpan={displayColumns.length || 1}
                    align="center"
                  >
                    <Typography color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </StyledTableCell>
                </StyledTableRow>
              ) : (
                rows.map((row, rowIndex) => (
                  <StyledTableRow key={`row-${rowIndex}`} hover>
                    {displayColumns.map((column) => (
                      <StyledTableCell
                        key={`${rowIndex}-${column}`}
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        {formatCellValue(row[column])}
                      </StyledTableCell>
                    ))}
                  </StyledTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
