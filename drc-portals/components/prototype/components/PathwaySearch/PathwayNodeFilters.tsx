import { AlertColor } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";

import { fetchPathwayNodeOptions } from "@/lib/neo4j/api";
import { NAME_FILTER_LABELS } from "@/lib/neo4j/constants";

import { NodeFilterBox } from "../../constants/pathway-search";
import { PathwaySearchNode } from "../../interfaces/pathway-search";
import { PropertyConfigs, PropertyValueType } from "../../types/pathway-search";

import AlertSnackbar from "../shared/AlertSnackbar";

import NodeTextSearch from "./NodeTextSearch";

interface PathwayNodeFiltersProps {
  node: PathwaySearchNode;
  onChange: <K extends keyof PropertyConfigs>(value: PropertyValueType<PropertyConfigs[K]>, propName: K) => void;
}

export default function PathwayNodeFilters(cmpProps: PathwayNodeFiltersProps) {
  const { node, onChange } = cmpProps;
  const [filters, setFilters] = useState<ReactNode[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("info");
  const nodeLabel = node.data.dbLabel;

  useEffect(() => {
    const nodeFilters = [];
    if (NAME_FILTER_LABELS.has(nodeLabel)) {
      const propName = "name"
      nodeFilters.push(
        <NodeFilterBox key={`${nodeLabel}-node-name-filter`}>
          <NodeTextSearch
            node={node}
            propName={propName}
            fetchFn={fetchPathwayNodeOptions}
            onChange={onChange<typeof propName>}
          />
        </NodeFilterBox>
      );
    }

    if (nodeFilters.length === 0) {
      setSnackbarOpen(true);
      setSnackbarMsg("Selected node has no available filters.");
      setSnackbarSeverity("warning");
    } else {
      setFilters(nodeFilters);
    }
  }, [node]);

  return (
    <>
      {filters}
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
