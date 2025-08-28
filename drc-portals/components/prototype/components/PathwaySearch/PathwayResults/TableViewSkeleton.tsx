"use client";

import DownloadIcon from "@mui/icons-material/Download";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import {
  PATHWAY_SEARCH_LIMIT_CHOICES,
  StyledDataCell,
  StyledHeaderCell,
  StyledTableCell,
} from "@/components/prototype/constants/pathway-search";

import ReturnBtn from "../ReturnBtn";
import PathwayTablePagination from "./PathwayTablePagination";

interface TableViewSkeletonProps {
  count?: number;
  page?: number;
  lowerPageBound?: number;
  upperPageBound?: number;
  limit?: number;
  onReturnBtnClick: () => void;
}

export default function TableViewSkeleton(cmpProps: TableViewSkeletonProps) {
  const { onReturnBtnClick } = cmpProps;
  const page = cmpProps.page || 1;
  const lowerPageBound = cmpProps.page !== undefined && cmpProps.lowerPageBound !== undefined ? cmpProps.lowerPageBound : 1;
  const upperPageBound = cmpProps.page !== undefined && cmpProps.upperPageBound !== undefined ? cmpProps.upperPageBound : 1;
  const limit = cmpProps.limit || 10;
  const COL_COUNT = 5;
  const columns = new Array(COL_COUNT).fill(null);
  const data = new Array(limit || 10).fill(new Array(COL_COUNT).fill(null));

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        variant="rounded-top"
        sx={{ flexGrow: 1 }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <StyledHeaderCell padding="checkbox">
                <Checkbox disabled indeterminate={false} checked={false} />
              </StyledHeaderCell>

              {columns.map((_, idx) => (
                <StyledHeaderCell key={`header-${idx}`} />
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((_, i) => (
              <TableRow key={`row-${i}`}>
                <StyledTableCell padding="checkbox">
                  <Checkbox disabled checked={false} />
                </StyledTableCell>
                {columns.map((_, j) => (
                  <StyledDataCell key={j}>
                    <Skeleton variant="rounded" />
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
          <PathwayTablePagination
            page={page}
            lowerBound={lowerPageBound}
            upperBound={upperPageBound}
            disabled={true}
          />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <FormControl size="small">
            <Select disabled value={limit}>
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
            disabled
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={() => console.log("Download All btn clicked")}
          >
            Download All
          </Button>
        </Stack>

        <ReturnBtn onClick={onReturnBtnClick} />
      </Stack>
    </>
  );
}
