const GRAPH_API_PREFIX = "/data/c2m2/graph/api";

export const fetchAllNodeRels = (nodeId: string, hubLabel: string) =>
  fetch(
    `${GRAPH_API_PREFIX}/rels/all?node_id=${nodeId}&hub_label=${hubLabel}`,
    {
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
  limit: number
) =>
  fetch(
    `${GRAPH_API_PREFIX}/expand?node_id=${nodeId}&hub_label=${hubLabel}&spoke_label=${spokeLabel}&direction=${direction}&rel_type=${type}&limit=${limit}`,
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

export const fetchSearch = (
  query: string,
  coreLabels: string[],
  dccAbbrevs: string[],
  subjectGenders: string[],
  subjectRaces: string[]
) =>
  fetch(
    `${GRAPH_API_PREFIX}/search?q=${query}&as_core_labels=${coreLabels.join(
      ","
    )}&as_dccs=${dccAbbrevs.join(",")}&as_subg=${subjectGenders.join(
      ","
    )}&as_subr=${subjectRaces.join(",")}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const fetchPathSearch = (query: string, cypherParams: string) =>
  fetch(
    `${GRAPH_API_PREFIX}/search/path?q=${query}&cy_params=${cypherParams}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
