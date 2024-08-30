export const fetchAllNodeRels = (nodeId: string) =>
  fetch(`/data/c2m2/graph/api/all-rels/${nodeId}`, {
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
    `/data/c2m2/graph/api/expand/${nodeId}?node_label=${label}&direction=${direction}&rel_type=${type}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
