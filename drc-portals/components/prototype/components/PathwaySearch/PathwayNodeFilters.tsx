import { ReactNode, useEffect, useState } from "react";

import {
  BIOSAMPLE_RELATED_LABELS,
  FILE_RELATED_LABELS,
  ID_NAMESPACE_LABEL,
  SUBJECT_RELATED_LABELS,
  TERM_LABELS,
} from "@/lib/neo4j/constants";
import { PathwayNode } from "@/lib/neo4j/types";

import { NodeFilterBox } from "../../constants/pathway-search";

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
  node: PathwayNode;
  onChange: (value: string) => void;
}

export default function PathwayNodeFilters(cmpProps: PathwayNodeFiltersProps) {
  const { node, onChange } = cmpProps;
  const [filter, setFilter] = useState<ReactNode>(null); // TODO: Need the ability to handle more than just a single filter

  useEffect(() => {
    if (NODE_SEARCH_LABELS.has(node.label)) {
      setFilter(
        <NodeFilterBox key={`${node.label}-node-text-filter`}>
          <NodeTextSearch
            label={node.label}
            value={node.props?.name}
            onChange={(value: string) => onChange(value)}
          />
        </NodeFilterBox>
      );
    } else if (NODE_SELECT_LABELS.has(node.label)) {
      setFilter(
        <NodeFilterBox key={`${node.label}-node-select-filter`}>
          <NodeFilterSelect
            label={node.label}
            value={node.props?.name}
            onChange={(value: string) => onChange(value)}
          />
        </NodeFilterBox>
      );
    }
  }, [node]);

  return filter;
}
