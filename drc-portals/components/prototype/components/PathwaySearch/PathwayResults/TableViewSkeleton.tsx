"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  MenuItem,
  Pagination,
  PaginationItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import {
  PATHWAY_SEARCH_LIMIT_CHOICES,
  StyledDataCell,
  StyledHeaderCell,
  StyledTableCell,
} from "@/components/prototype/constants/pathway-search";

import ReturnBtn from "../ReturnBtn";

interface TableViewSkeletonProps {
  count?: number;
  page?: number;
  limit?: number;
  onReturnBtnClick: () => void;
}

export default function TableViewSkeleton(cmpProps: TableViewSkeletonProps) {
  const { onReturnBtnClick } = cmpProps;
  const count = cmpProps.count || 10;
  const page = cmpProps.page || 1;
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
        <Pagination
          disabled
          page={page}
          count={Math.ceil(count / limit)}
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

        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="nav" noWrap>
            Rows per page:
          </Typography>

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
