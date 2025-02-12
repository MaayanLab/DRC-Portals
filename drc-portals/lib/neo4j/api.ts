const GRAPH_API_PREFIX = "/data/c2m2/graph/api";

export const fetchAllNodeRels = (
  nodeId: string,
  hubLabel: string,
  fetchProps?: RequestInit
) =>
  fetch(
    `${GRAPH_API_PREFIX}/rels/all?node_id=${nodeId}&hub_label=${hubLabel}`,
    {
      ...fetchProps,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const fetchExpandNode = (
  nodeId: string,
  hubLabel: string,
  spokeLabel: string,
  direction: string,
  type: string,
  limit: number,
  fetchProps?: RequestInit
) =>
  fetch(
    `${GRAPH_API_PREFIX}/expand?node_id=${nodeId}&hub_label=${hubLabel}&spoke_label=${spokeLabel}&direction=${direction}&rel_type=${type}&limit=${limit}`,
    {
      ...fetchProps,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const fetchSynonyms = (query: string, fetchProps?: RequestInit) =>
  fetch(`${GRAPH_API_PREFIX}/synonyms?q=${query}`, {
    ...fetchProps,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

export const fetchCVTerms = (query: string, fetchProps?: RequestInit) =>
  fetch(`${GRAPH_API_PREFIX}/terms?q=${query}`, {
    ...fetchProps,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

export const fetchTermsByLabel = (label: string, fetchProps?: RequestInit) =>
  fetch(`${GRAPH_API_PREFIX}/terms/${label}`, {
    ...fetchProps,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

// TODO: Need to consolidate this and the above two APIs, it's a little ridiculous the way it is now...
export const fetchTermsByLabelAndName = (
  label: string,
  name: string,
  fetchProps?: RequestInit
) =>
  fetch(`${GRAPH_API_PREFIX}/terms/${label}/${name}`, {
    ...fetchProps,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

export const fetchSearch = (
  query: string,
  coreLabels: string[],
  dccAbbrevs: string[],
  subjectGenders: string[],
  subjectRaces: string[],
  fetchProps?: RequestInit
) =>
  fetch(
    `${GRAPH_API_PREFIX}/search?q=${query}&as_core_labels=${coreLabels.join(
      ","
    )}&as_dccs=${dccAbbrevs.join(",")}&as_subg=${subjectGenders.join(
      ","
    )}&as_subr=${subjectRaces.join(",")}`,
    {
      ...fetchProps,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const fetchPathSearch = (
  query: string,
  cypherParams: string,
  fetchProps?: RequestInit
) =>
  fetch(
    `${GRAPH_API_PREFIX}/search/path?q=${query}&cy_params=${cypherParams}`,
    {
      ...fetchProps,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const fetchPathwaySearch = (
  query: string,
  page?: number,
  limit?: number,
  fetchProps?: RequestInit
) =>
  fetch(`${GRAPH_API_PREFIX}/search/pathway`, {
    ...fetchProps,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tree: query, page, limit }),
  });

export const fetchPathwaySearchConnections = (
  tree: string,
  targetNodeIds: string[],
  fetchProps?: RequestInit
) =>
  fetch(`${GRAPH_API_PREFIX}/search/pathway/connections`, {
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
  fetchProps?: RequestInit
) =>
  fetch(`${GRAPH_API_PREFIX}/search/pathway/terms`, {
    ...fetchProps,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filter, nodeId, tree }),
  });
