"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DownloadIcon from "@mui/icons-material/Download";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
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
  TextField,
  Typography,
} from "@mui/material";
import {
  ChangeEvent,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  BIOSAMPLE_LABEL,
  BIOSAMPLE_RELATED_LABELS,
  COLLECTION_LABEL,
  DCC_LABEL,
  FILE_LABEL,
  FILE_RELATED_LABELS,
  ID_NAMESPACE_LABEL,
  PROJECT_LABEL,
  SUBJECT_LABEL,
  SUBJECT_RELATED_LABELS,
  TERM_LABELS,
} from "@/lib/neo4j/constants";
import { NodeResult, PathwaySearchResultRow } from "@/lib/neo4j/types";
import { isRelationshipResult } from "@/lib/neo4j/utils";

import {
  downloadBlob,
  getExternalLinkElement,
  getOntologyLink,
} from "@/components/prototype/utils/shared";
import {
  PATHWAY_SEARCH_LIMIT_CHOICES,
  StyledDataCell,
  StyledTableCell,
} from "@/components/prototype/constants/pathway-search";

import ReturnBtn from "../ReturnBtn";

interface ColumnData {
  pathIdx: number;
  key: string;
  header: string;
  valueGetter: (node: NodeResult) => ReactNode;
}

interface TableViewProps {
  data: PathwaySearchResultRow[];
  limit: number;
  page: number;
  count: number;
  onReturnBtnClick: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onDownloadAll: () => Promise<void>;
}

export default function TableView(cmpProps: TableViewProps) {
  const {
    data,
    limit,
    page,
    count,
    onReturnBtnClick,
    onPageChange,
    onLimitChange,
    onDownloadAll,
  } = cmpProps;
  const MAX_PAGE = Math.ceil(count / limit);
  const JUMP_TO_PAGE_DEFAULT_LABEL = "Jump to Page";
  const [columns, setColumns] = useState<ColumnData[]>([]);
  const [selected, setSelected] = useState<boolean[]>(
    new Array(data.length).fill(false)
  );
  const [downloading, setDownloading] = useState(false);
  const [jumpToPageVal, setJumpToPageVal] = useState(page.toString());
  const [jumpToPageError, setJumpToPageError] = useState(false);
  const [jumpToPageHelperText, setJumpToPageHelperText] = useState<
    string | undefined
  >();

  const handleCheckboxChange = (rowIdx: number) => {
    setSelected(
      selected.map((rowChecked, idx) =>
        idx === rowIdx ? !rowChecked : rowChecked
      )
    );
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(new Array(data.length).fill(true));
    } else {
      setSelected(new Array(data.length).fill(false));
    }
  };

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

  useEffect(() => {
    let newColumns = [];
    if (data.length > 0) {
      const firstRow = data[0];

      const labelCounts = new Map<string, number>();
      for (let i = 0; i < firstRow.length; i++) {
        const element = firstRow[i];
        if (!isRelationshipResult(element)) {
          const nodeLabel =
            element.labels.length > 0 ? element.labels[0] : "Unknown";
          const labelCount = labelCounts.get(nodeLabel);
          let colPostfix;

          if (labelCount === undefined) {
            colPostfix = 1;
            labelCounts.set(nodeLabel, colPostfix);
          } else {
            colPostfix = labelCount + 1;
            labelCounts.set(nodeLabel, colPostfix);
          }

          const linkRegex =
            /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;
          let valueGetter;
          if (
            [
              ...TERM_LABELS,
              ...FILE_RELATED_LABELS,
              ...SUBJECT_RELATED_LABELS,
              ...BIOSAMPLE_RELATED_LABELS,
            ].includes(nodeLabel)
          ) {
            valueGetter = (node: NodeResult) => {
              const ontologyLink = getOntologyLink(
                nodeLabel,
                node.properties.id
              );
              return getExternalLinkElement(ontologyLink, node.properties.name);
            };
          } else if (
            [PROJECT_LABEL, COLLECTION_LABEL, FILE_LABEL].includes(nodeLabel)
          ) {
            valueGetter = (node: NodeResult) => {
              const val =
                node.properties.persistent_id || node.properties.access_url;
              if (val !== undefined) {
                if (linkRegex.test(val)) {
                  return getExternalLinkElement(
                    val,
                    node.properties.local_id || val
                  );
                } else {
                  return val;
                }
              } else {
                return node.properties.local_id || "Unknown";
              }
            };
          } else if (nodeLabel === DCC_LABEL) {
            valueGetter = (node: NodeResult) => {
              const url = node.properties.url;
              const data =
                node.properties.abbreviation ||
                node.properties.name ||
                "Unknown";
              if (url !== undefined) {
                if (linkRegex.test(url)) {
                  return getExternalLinkElement(url, data);
                } else {
                  return data;
                }
              } else {
                return data;
              }
            };
          } else if (nodeLabel === ID_NAMESPACE_LABEL) {
            valueGetter = (node: NodeResult) => {
              const url = node.properties.id;
              const data =
                node.properties.abbreviation ||
                node.properties.name ||
                node.properties.id ||
                "Unknown";
              if (url !== undefined) {
                return getExternalLinkElement(url, data);
              } else {
                return data;
              }
            };
          } else if ([SUBJECT_LABEL, BIOSAMPLE_LABEL].includes(nodeLabel)) {
            valueGetter = (node: NodeResult) =>
              node.properties.local_id || "Unknown";
          } else {
            valueGetter = () => "Unknown";
          }

          newColumns.push({
            pathIdx: i,
            key: `${nodeLabel}_${colPostfix}`.toLowerCase(),
            header: `${nodeLabel}-${colPostfix}`,
            valueGetter,
          });
        }
      }

      newColumns = newColumns.map((col) => {
        const [label, _] = col.header.split("-");
        return {
          ...col,
          header: (labelCounts.get(label) as number) === 1 ? label : col.header,
        };
      });

      setColumns(newColumns);
    }
  }, [data]);

  return (
    <>
      {/* Start table */}
      <TableContainer
        component={Paper}
        elevation={0}
        variant="rounded-top"
        sx={{ flexGrow: 1 }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell
                padding="checkbox"
                sx={{ position: "sticky", left: 0, zIndex: 4 }}
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
              </StyledTableCell>
              {/* width: 1% forces minimal use of space */}
              <StyledTableCell sx={{ width: "1%" }}>
                <Typography variant="body1">#</Typography>
              </StyledTableCell>
              {columns.map((col) => (
                <StyledDataCell key={col.key}>
                  <Typography variant="body1">{col.header}</Typography>
                </StyledDataCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={`row-${i}`}>
                <StyledTableCell
                  padding="checkbox"
                  sx={{
                    position: "sticky",
                    left: 0,
                    zIndex: 3,
                    background: "white",
                  }}
                >
                  <Checkbox
                    checked={selected[i]}
                    onChange={() => handleCheckboxChange(i)}
                  />
                </StyledTableCell>
                <StyledTableCell>{(page - 1) * limit + i + 1}</StyledTableCell>
                {columns.map((col, j) => (
                  <StyledDataCell key={j}>
                    {col.valueGetter(row[col.pathIdx] as NodeResult)}
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
    </>
  );
}
