import { AlertColor } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";

import {
  BIOSAMPLE_RELATED_LABELS,
  DCC_LABEL,
  FILE_RELATED_LABELS,
  ID_NAMESPACE_LABEL,
  SUBJECT_RELATED_LABELS,
  TERM_LABELS,
} from "@/lib/neo4j/constants";

import { NodeFilterBox } from "../../constants/pathway-search";
import { PathwaySearchNode } from "../../interfaces/pathway-search";

import AlertSnackbar from "../shared/AlertSnackbar";

import NodeTextSearch from "./NodeTextSearch";

const NODE_SEARCH_LABELS: ReadonlySet<string> = new Set([
  ...FILE_RELATED_LABELS,
  ...SUBJECT_RELATED_LABELS,
  ...BIOSAMPLE_RELATED_LABELS,
  ...TERM_LABELS,
  ID_NAMESPACE_LABEL,
  DCC_LABEL,
]);

interface PathwayNodeFiltersProps {
  node: PathwaySearchNode;
  onChange: (value: string) => void;
}

export default function PathwayNodeFilters(cmpProps: PathwayNodeFiltersProps) {
  const { node, onChange } = cmpProps;
  const [filter, setFilter] = useState<ReactNode>(null); // TODO: Need the ability to handle more than just a single filter
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("info");
  const nodeLabel = node.data.dbLabel;
  // TODO: This implementation assumes we are ONLY filtering on node name. In the future we will need to calculate the presented
  // filters based on a combination of the node label and a list of known properties for that node. Keeping things simple for now.

  useEffect(() => {
    if (NODE_SEARCH_LABELS.has(nodeLabel)) {
      setFilter(
        <NodeFilterBox key={`${nodeLabel}-node-text-filter`}>
          <NodeTextSearch
            node={node}
            onChange={(value: string) => onChange(value)}
          />
        </NodeFilterBox>
      );
    } else {
      setSnackbarOpen(true);
      setSnackbarMsg("Selected node has no available filters.");
      setSnackbarSeverity("warning");
    }
  }, [node]);

  return (
    <>
      {filter}
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
