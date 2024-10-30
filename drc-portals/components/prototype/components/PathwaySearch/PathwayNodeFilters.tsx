import { ReactNode, useEffect, useState } from "react";

import {
  BIOSAMPLE_RELATED_LABELS,
  FILE_RELATED_LABELS,
  ID_NAMESPACE_LABEL,
  SUBJECT_RELATED_LABELS,
  TERM_LABELS,
} from "@/lib/neo4j/constants";

import { NodeFilterBox } from "../../constants/pathway-search";
import { PathwaySearchNode } from "../../interfaces/pathway-search";

import NodeFilterSelect from "./NodeFilterSelect";
import NodeTextSearch from "./NodeTextSearch";

const NODE_SELECT_LABELS: ReadonlySet<string> = new Set([
  ...FILE_RELATED_LABELS,
  ...SUBJECT_RELATED_LABELS,
  ...BIOSAMPLE_RELATED_LABELS,
  ID_NAMESPACE_LABEL,
]);

const NODE_SEARCH_LABELS: ReadonlySet<string> = new Set([...TERM_LABELS]);

interface PathwayNodeFiltersProps {
  node: PathwaySearchNode;
  onChange: (value: string) => void;
}

export default function PathwayNodeFilters(cmpProps: PathwayNodeFiltersProps) {
  const { node, onChange } = cmpProps;
  const [filter, setFilter] = useState<ReactNode>(null); // TODO: Need the ability to handle more than just a single filter
  const nodeLabel = node.data.dbLabel;
  // TODO: This implementation assumes we are ONLY filtering on node name. In the future we will need to calculate the presented
  // filters based on a combination of the node label and a list of known properties for that node. Keeping things simple for now.
  const nodeName =
    node.data.displayLabel === node.data.dbLabel
      ? undefined
      : node.data.displayLabel;

  useEffect(() => {
    if (NODE_SEARCH_LABELS.has(nodeLabel)) {
      setFilter(
        <NodeFilterBox key={`${nodeLabel}-node-text-filter`}>
          <NodeTextSearch
            label={nodeLabel}
            value={nodeName}
            onChange={(value: string) => onChange(value)}
          />
        </NodeFilterBox>
      );
    } else if (NODE_SELECT_LABELS.has(nodeLabel)) {
      setFilter(
        <NodeFilterBox key={`${nodeLabel}-node-select-filter`}>
          <NodeFilterSelect
            label={nodeLabel}
            value={nodeName}
            onChange={(value: string) => onChange(value)}
          />
        </NodeFilterBox>
      );
    }
  }, [node]);

  return filter;
}
