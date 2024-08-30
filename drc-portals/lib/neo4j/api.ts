const GRAPH_API_PREFIX = "/data/c2m2/graph/api";

export const fetchAllNodeRels = (nodeId: string) =>
  fetch(`${GRAPH_API_PREFIX}/all-rels/${nodeId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

export const fetchExpandNode = (
  nodeId: string,
  label: string,
  direction: string,
  type: string,
  limit: number
) =>
  fetch(
    `${GRAPH_API_PREFIX}/expand/${nodeId}?node_label=${label}&direction=${direction}&rel_type=${type}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const fetchSynonyms = (query: string) =>
  fetch(`${GRAPH_API_PREFIX}/synonyms?q=${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
