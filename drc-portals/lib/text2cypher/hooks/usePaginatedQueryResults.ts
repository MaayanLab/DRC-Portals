import { useCallback, useState } from "react";

import type { QueryResultRow } from "@/lib/text2cypher/neo4j/query-results";

export interface PaginatedQueryResultPage {
  rows: QueryResultRow[] | null;
  error: string | null;
  cypher: string;
  params: Record<string, unknown>;
  limit: number;
  offset: number;
  totalRowCount: number;
  requestKey: string;
}

export interface PaginatedQueryResultsPaginationConfig {
  requestKey: string;
  limit: number;
  offset: number;
  totalRowCount: number;
  onPaginate: (input: { limit: number; offset: number }) => Promise<{
    rows: QueryResultRow[] | null;
    error: string | null;
    limit: number;
    offset: number;
    totalRowCount: number;
  }>;
}

const createEmptyPage = (defaultLimit: number): PaginatedQueryResultPage => ({
  rows: null,
  error: null,
  cypher: "",
  params: {},
  limit: defaultLimit,
  offset: 0,
  totalRowCount: 0,
  requestKey: "",
});

export const usePaginatedQueryResults = (defaultLimit: number = 10) => {
  const [pageState, setPageState] = useState<PaginatedQueryResultPage>(() =>
    createEmptyPage(defaultLimit),
  );

  const resetPageState = useCallback(() => {
    setPageState(createEmptyPage(defaultLimit));
  }, [defaultLimit]);

  const applyPageState = useCallback((page: PaginatedQueryResultPage) => {
    setPageState(page);
  }, []);

  const getPaginationConfig = useCallback(
    (
      onPaginate: PaginatedQueryResultsPaginationConfig["onPaginate"],
    ): PaginatedQueryResultsPaginationConfig | undefined => {
      if (!pageState.requestKey) {
        return undefined;
      }

      return {
        requestKey: pageState.requestKey,
        limit: pageState.limit,
        offset: pageState.offset,
        totalRowCount: pageState.totalRowCount,
        onPaginate,
      };
    },
    [pageState],
  );

  return {
    pageState,
    applyPageState,
    resetPageState,
    getPaginationConfig,
  };
};
