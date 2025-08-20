"use client";

import { Tabs } from "@mui/base/Tabs";
import HubIcon from "@mui/icons-material/Hub";
import TableChartIcon from "@mui/icons-material/TableChart";
import { AlertColor, Box } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

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
import { ColumnData } from "../../interfaces/pathway-search";
import { Order } from "../../types/pathway-search";
import { getColumnDataFromTree } from "../../utils/pathway-search";
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
  const [page, setPage] = useState<number>(1);
  const [lowerPageBound, setLowerPageBound] = useState<number>(Math.max(page - 5, 1));
  const [upperPageBound, setUpperPageBound] = useState<number>(1);
  const [limit, setLimit] = useState<number>(PATHWAY_SEARCH_DEFAULT_LIMIT);
  const [order, setOrder] = useState<Order>();
  const [orderBy, setOrderBy] = useState<number>();
  const [columns, setColumns] = useState<ColumnData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("info");

  const getPathwaySearchResults = async (
    tree: PathwayNode,
    page?: number,
    limit?: number,
    orderByKey?: string,
    orderByProp?: string,
    order?: Order
  ): Promise<{ data: PathwaySearchResult; status: number }> => {
    const query = btoa(JSON.stringify(tree));
    const response = await fetchPathwaySearch(
      query,
      page,
      limit,
      orderByKey,
      orderByProp,
      order
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed: ${errorText}`);
    }

    return { data: await response.json(), status: response.status };
  };

  const handlePageChange = useCallback(
    async (newPage: number) => {
      setLoading(true);
      const { data } =
        orderBy !== undefined && order !== undefined
          ? await getPathwaySearchResults(
            tree,
            newPage,
            limit,
            columns[orderBy].key,
            columns[orderBy].displayProp,
            order
          )
          : await getPathwaySearchResults(tree, newPage, limit);
      setLoading(false);
      setPaths(data.paths);
      setPage(newPage);
      setLowerPageBound(data.lowerPageBound);
      setUpperPageBound(data.upperPageBound);
    },
    [tree, limit, columns, orderBy, order]
  );

  const handleLimitChange = useCallback(
    async (newLimit: number) => {
      try {
        setLimit(newLimit);
        setLoading(true);

        const newPage = 1; // Reset the table to the first page
        const columnData = orderBy === undefined ? undefined : columns[orderBy];
        const { data } = await getPathwaySearchResults(
          tree,
          newPage,
          newLimit,
          columnData?.key,
          columnData?.displayProp,
          order
        );

        setPaths(data.paths);
        setPage(newPage);
        setLowerPageBound(data.lowerPageBound);
        setUpperPageBound(data.upperPageBound);
      } catch {
        updateSnackbar(
          true,
          "An error occurred updating table limit. Please try again later.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [tree, columns, orderBy, order]
  );

  const handleOrderByChange = useCallback(
    async (column: number | undefined, order: Order) => {
      try {
        setOrder(order);
        setOrderBy(column);
        setLoading(true);

        const columnData = column === undefined ? undefined : columns[column];
        const { data } = await getPathwaySearchResults(
          tree,
          page,
          limit,
          columnData?.key,
          columnData?.displayProp,
          order
        );

        setPaths(data.paths);
      } catch (e) {
        updateSnackbar(
          true,
          "An error occurred updating table order. Please try again later.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [tree, limit, page, columns]
  );

  const handleColumnChange = useCallback(
    async (changedColumn: number, changes: Partial<ColumnData>) => {
      try {
        const newColumns = columns.map((col, idx) =>
          idx === changedColumn ? { ...col, ...changes } : { ...col }
        );
        setColumns(newColumns);
        setLoading(true);

        const columnData =
          orderBy === undefined ? undefined : newColumns[orderBy];
        const { data } = await getPathwaySearchResults(
          tree,
          page,
          limit,
          columnData?.key,
          columnData?.displayProp,
          order
        );
        setPaths(data.paths);
      } catch (e) {
        updateSnackbar(
          true,
          "An error occurred updating table order. Please try again later.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [tree, limit, page, columns, orderBy, order]
  );

  const handleDownloadAllClicked = useCallback(async () => {
    try {
      const columnData = orderBy === undefined ? undefined : columns[orderBy];
      const { data } = await getPathwaySearchResults(
        tree,
        undefined,
        undefined,
        columnData?.key,
        columnData?.displayProp,
        order
      );
      const jsonString = JSON.stringify(
        data.paths.map((row) =>
          row.filter((element) => !isRelationshipResult(element))
        )
      );
      downloadBlob(jsonString, "application/json", "c2m2-graph-data.json");
    } catch (e) {
      updateSnackbar(
        true,
        "An error occurred downloading table data. Please try again later.",
        "error"
      );
    }
  }, [tree, columns, orderBy, order]);

  const updateSnackbar = (open: boolean, msg: string, severity: AlertColor) => {
    setSnackbarMsg(msg);
    setSnackbarOpen(open);
    setSnackbarSeverity(severity);
  };

  useEffect(() => {
    setLoading(true);
    setColumns(getColumnDataFromTree(tree));
    Promise.all([
      getPathwaySearchResults(tree, page, limit),
    ]).then(([searchResult]) => {
      setLoading(false);
      setPaths(searchResult.data.paths);
      setLowerPageBound(searchResult.data.lowerPageBound);
      setUpperPageBound(searchResult.data.upperPageBound);
    });
  }, [tree]);

  return (
    <Box sx={{ position: "relative", height: "inherit" }}>
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
                lowerPageBound={lowerPageBound}
                upperPageBound={upperPageBound}
                onReturnBtnClick={onReturnBtnClick}
              />
            ) : (
              <TableView
                data={paths}
                limit={limit}
                page={page}
                lowerPageBound={lowerPageBound}
                upperPageBound={upperPageBound}
                order={order}
                orderBy={orderBy}
                columns={columns}
                onReturnBtnClick={onReturnBtnClick}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                onOrderByChange={handleOrderByChange}
                onColumnChange={handleColumnChange}
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
    </Box>
  );
}
