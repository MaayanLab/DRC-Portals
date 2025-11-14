import { Order } from "@/components/prototype/types/pathway-search";

const GRAPH_API_PREFIX = "/data/c2m2/graph/api";

export const fetchNodeByIdAndLabels = (
  id: string,
  labels: string,
  fetchProps?: RequestInit
) =>
  fetch(`${GRAPH_API_PREFIX}/${id}?labels=${labels}`, {
    ...fetchProps,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

export const fetchCVTerms = (
  query: string,
  skip: number,
  fetchProps?: RequestInit
) =>
  fetch(`${GRAPH_API_PREFIX}/terms?q=${query}&skip=${skip}`, {
    ...fetchProps,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

export const fetchPathwaySearch = (
  query: string,
  page?: number,
  limit?: number,
  orderByKey?: string,
  orderByProp?: string,
  order?: Order,
  fetchProps?: RequestInit
) =>
  fetch(`${GRAPH_API_PREFIX}/pathway`, {
    ...fetchProps,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tree: query,
      page,
      limit,
      orderByKey,
      orderByProp,
      order,
    }),
  });

export const fetchPathwaySearchCount = (
  query: string,
  fetchProps?: RequestInit
) =>
  fetch(`${GRAPH_API_PREFIX}/pathway/count`, {
    ...fetchProps,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tree: query }),
  });

export const fetchPathwaySearchConnections = (
  tree: string,
  targetNodeIds: string[],
  fetchProps?: RequestInit
) =>
  fetch(`${GRAPH_API_PREFIX}/pathway/connections`, {
    ...fetchProps,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tree, targetNodeIds }),
  });

export const fetchPathwayNodeOptions = (
  filter: string | null,
  nodeId: string,
  tree: string,
  skip?: number,
  limit?: number,
  fetchProps?: RequestInit
) =>
  fetch(`${GRAPH_API_PREFIX}/pathway/terms`, {
    ...fetchProps,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filter, nodeId, tree, skip, limit }),
  });
