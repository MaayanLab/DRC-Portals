import { Box } from "@mui/material";

import {
  ANATOMY_LABEL,
  ASSAY_TYPE_LABEL,
  BIOSAMPLE_LABEL,
  COLLECTION_LABEL,
  COMPOUND_LABEL,
  DCC_LABEL,
  DISEASE_LABEL,
  FILE_LABEL,
  NCBI_TAXONOMY_LABEL,
  PROJECT_LABEL,
  SUBJECT_LABEL,
  SUBJECT_RACE_LABEL,
  SUBJECT_SEX_LABEL,
} from "@/lib/neo4j/constants";
import { PathwayNode } from "@/lib/neo4j/types";

import NodeFilterSelect from "./NodeFilterSelect";

const NODE_LABEL_MAP: ReadonlyMap<string, string[]> = new Map([
  [FILE_LABEL, [ASSAY_TYPE_LABEL]],
  [
    SUBJECT_LABEL,
    [
      DISEASE_LABEL,
      NCBI_TAXONOMY_LABEL,
      COMPOUND_LABEL,
      SUBJECT_RACE_LABEL,
      SUBJECT_SEX_LABEL,
    ],
  ],
  [
    BIOSAMPLE_LABEL,
    [ANATOMY_LABEL, COMPOUND_LABEL, DISEASE_LABEL, NCBI_TAXONOMY_LABEL],
  ],
  [PROJECT_LABEL, [DCC_LABEL]],
  [COLLECTION_LABEL, [DCC_LABEL]],
]);

// TODO: I think yet another justification for showing filter nodes directly on the canvas is we can show only those nodes which are
// actually connected to the candidate node. Currently, we would have to do this filtering under the hood to avoid showing irrelevant
// filters, and even then that information would only be visible when a specific node is chosen...
//
// I suppose the major tradeoff is that we would have to run a potentially expensive query every single time the user added/updated a
// filter or added a new node to the path. Need to experiment with this and see how slow it is, and how we can visually indicate loading
// while updating the tree.
//
// Also, with this visualization we (probably) wouldn't need a special UI for filters: they would be incorporated into the already visible
// path.
//
// Also, with the current visualization it's not possible to have multiple terms pointing at a single node. Actually, in the prototype of
// the full tree visualization it's not possible either, so we would need more logic to allow a certain path to be added multiple times...
interface PathwayNodeFiltersProps {
  node: PathwayNode;
  onChange: (label: string, value: string) => void;
}

export default function PathwayNodeFilters(cmpProps: PathwayNodeFiltersProps) {
  const { node, onChange } = cmpProps;
  const filterLabels = NODE_LABEL_MAP.get(node.label);
  const nodeChildValueMap = new Map<string, string | undefined>(
    node.children.map((child) => [child.label, child.props?.name])
  );

  return (
    <>
      {/* TODO: Could have a loading indicator here while we fetch the possible filters for the node...meaning the possible connected nodes
    and the options for each dropdown if applicable*/}
      {filterLabels !== undefined && filterLabels.length > 0 ? (
        <Box sx={{ display: "flex" }}>
          {filterLabels.map((label) => (
            <Box key={`${node.label}-node-${label}-filter`}>
              <NodeFilterSelect
                label={label}
                value={nodeChildValueMap.get(label)}
                onChange={(value: string) => onChange(label, value)}
              />
            </Box>
          ))}
        </Box>
      ) : null}
    </>
  );
}
