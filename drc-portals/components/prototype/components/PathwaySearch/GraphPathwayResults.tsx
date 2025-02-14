"use client";

import { Tabs } from "@mui/base/Tabs";
import HubIcon from "@mui/icons-material/Hub";
import TableChartIcon from "@mui/icons-material/TableChart";
import { AlertColor, SelectChangeEvent } from "@mui/material";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { fetchPathwaySearch } from "@/lib/neo4j/api";
import {
  PathwayNode,
  PathwaySearchResult,
  PathwaySearchResultRow,
} from "@/lib/neo4j/types";
import { isRelationshipResult } from "@/lib/neo4j/utils";

import { Tab, TabsList } from "../../constants/advanced-search";
import {
  PATHWAY_SEARCH_DEFAULT_LIMIT,
  PathwayResultTabPanel,
  TableViewContainer,
} from "../../constants/pathway-search";
import { downloadBlob } from "../../utils/shared";

import AlertSnackbar from "../shared/AlertSnackbar";

import TableView from "./PathwayResults/TableView";
import GraphView from "./PathwayResults/GraphView";
import TableViewSkeleton from "./PathwayResults/TableViewSkeleton";

interface GraphPathwayResultsProps {
  tree: PathwayNode;
  onReturnBtnClick: () => void;
}

export default function GraphPathwayResults(
  cmpProps: GraphPathwayResultsProps
) {
  const { tree, onReturnBtnClick } = cmpProps;
  const [paths, setPaths] = useState<PathwaySearchResultRow[]>([]);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(PATHWAY_SEARCH_DEFAULT_LIMIT);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("info");

  const getPathwaySearchResults = async (
    tree: PathwayNode,
    page?: number,
    limit?: number
  ): Promise<{ data: PathwaySearchResult; status: number }> => {
    const query = btoa(JSON.stringify(tree));
    const response = await fetchPathwaySearch(query, page, limit);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed: ${errorText}`);
    }

    return { data: await response.json(), status: response.status };
  };

  const handlePageChange = useCallback(
    async (event: ChangeEvent, newPage: number) => {
      setPage(newPage);
      setLoading(true);
      const { data } = await getPathwaySearchResults(tree, newPage, limit);
      setLoading(false);
      setPaths(data.paths);
      setCount(data.count);
    },
    [tree, limit]
  );

  const handleLimitChange = useCallback(
    async (event: SelectChangeEvent<number>) => {
      try {
        const newLimit = Number(event.target.value);
        setLimit(newLimit);
        setPage(1); // Reset the table to the first page
        setLoading(true);
        const { data } = await getPathwaySearchResults(tree, 1, newLimit);
        setLoading(false);
        setPaths(data.paths);
        setCount(data.count);
      } catch {
        updateSnackbar(
          true,
          "An error occurred updating table limit. Please try again later.",
          "error"
        );
      }
    },
    [tree, page]
  );

  const handleDownloadAllClicked = async () => {
    const { data } = await getPathwaySearchResults(tree);
    const jsonString = JSON.stringify(
      data.paths.map((row) =>
        row.filter((element) => !isRelationshipResult(element))
      )
    );
    downloadBlob(jsonString, "application/json", "c2m2-graph-data.json");
  };

  const updateSnackbar = (open: boolean, msg: string, severity: AlertColor) => {
    setSnackbarMsg(msg);
    setSnackbarOpen(open);
    setSnackbarSeverity(severity);
  };

  useEffect(() => {
    setLoading(true);
    getPathwaySearchResults(tree, page, limit).then(({ data }) => {
      setLoading(false);
      setPaths(data.paths);
      setCount(data.count);
    });
  }, [tree]);

  return (
    <>
      <Tabs defaultValue={0} style={{ width: "100%", height: "100%" }}>
        <TabsList>
          <Tab value={0} disabled={loading}>
            Table View <TableChartIcon sx={{ marginLeft: 1 }} />
          </Tab>
          <Tab value={1} disabled={loading}>
            Network View <HubIcon sx={{ marginLeft: 1 }} />
          </Tab>
        </TabsList>
        <PathwayResultTabPanel value={0}>
          <TableViewContainer>
            {loading ? (
              <TableViewSkeleton
                limit={limit}
                page={page}
                count={count}
                onReturnBtnClick={onReturnBtnClick}
              />
            ) : (
              <TableView
                data={paths}
                limit={limit}
                page={page}
                count={count}
                onReturnBtnClick={onReturnBtnClick}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                onDownloadAll={handleDownloadAllClicked}
              ></TableView>
            )}
          </TableViewContainer>
        </PathwayResultTabPanel>
        <PathwayResultTabPanel value={1}>
          <GraphView
            paths={paths}
            onReturnBtnClick={onReturnBtnClick}
          ></GraphView>
        </PathwayResultTabPanel>
      </Tabs>

      <AlertSnackbar
        open={snackbarOpen}
        message={snackbarMsg}
        autoHideDuration={5000}
        severity={snackbarSeverity}
        vertical={"bottom"}
        horizontal={"center"}
        handleClose={() => setSnackbarOpen(false)}
      />
    </>
  );
}
