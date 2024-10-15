import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, debounce } from "@mui/material";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  ANATOMY_LABEL,
  BIOSAMPLE_LABEL,
  BIOSAMPLE_RELATED_LABELS,
  COLLECTION_LABEL,
  COMPOUND_LABEL,
  DISEASE_LABEL,
  FILE_LABEL,
  FILE_RELATED_LABELS,
  ID_NAMESPACE_LABEL,
  NCBI_TAXONOMY_LABEL,
  PROJECT_LABEL,
  SUBJECT_LABEL,
  SUBJECT_RELATED_LABELS,
} from "@/lib/neo4j/constants";
import { PathwayNode } from "@/lib/neo4j/types";

import {
  NodeFilterBox,
  NodeFilterButton,
  NodeFilterCarousel,
} from "../../constants/pathway-search";

import NodeFilterSelect from "./NodeFilterSelect";
import NodeTextSearch from "./NodeTextSearch";

const NODE_SELECT_LABEL_MAP: ReadonlyMap<string, string[]> = new Map([
  [FILE_LABEL, [...FILE_RELATED_LABELS, ID_NAMESPACE_LABEL]],
  [SUBJECT_LABEL, [...SUBJECT_RELATED_LABELS, ID_NAMESPACE_LABEL]],
  [BIOSAMPLE_LABEL, [...BIOSAMPLE_RELATED_LABELS, ID_NAMESPACE_LABEL]],
  [PROJECT_LABEL, [ID_NAMESPACE_LABEL]],
  [COLLECTION_LABEL, [ID_NAMESPACE_LABEL]],
]);

const NODE_SEARCH_LABEL_MAP: ReadonlyMap<string, string[]> = new Map([
  [SUBJECT_LABEL, [DISEASE_LABEL, NCBI_TAXONOMY_LABEL, COMPOUND_LABEL]],
  [BIOSAMPLE_LABEL, [ANATOMY_LABEL, COMPOUND_LABEL, DISEASE_LABEL]],
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
  const [carouselScrollLeft, setCarouselScrollLeft] = useState<number>(0);
  const [maxCarouselScrollLeft, setMaxCarouselScrollLeft] = useState<number>(0);
  const carouselRef = useRef<HTMLElement>(null);
  const nodeChildValueMap = new Map<string, string | undefined>(
    node.children.map((child) => [child.label, child.props?.name])
  );
  const filters = [
    ...(NODE_SEARCH_LABEL_MAP.get(node.label) || []).map((label) => (
      <NodeFilterBox key={`${node.label}-node-${label}-filter`}>
        <NodeTextSearch
          label={label}
          value={nodeChildValueMap.get(label)}
          onChange={(value: string) => onChange(label, value)}
        />
      </NodeFilterBox>
    )),
    ...(NODE_SELECT_LABEL_MAP.get(node.label) || []).map((label) => (
      <NodeFilterBox key={`${node.label}-node-${label}-filter`}>
        <NodeFilterSelect
          label={label}
          value={nodeChildValueMap.get(label)}
          onChange={(value: string) => onChange(label, value)}
        />
      </NodeFilterBox>
    )),
  ];

  const prevHandler = () => {
    const carousel = carouselRef.current;
    if (carousel != null) {
      carousel.scrollLeft = Math.max(
        0,
        carousel.scrollLeft - carousel.offsetWidth
      );
    }
  };

  const nextHandler = () => {
    const carousel = carouselRef.current;
    if (carousel !== null) {
      carousel.scrollLeft = Math.min(
        maxCarouselScrollLeft, // Maximum scrollLeft value for the ref
        carousel.scrollLeft + carousel.offsetWidth
      );
    }
  };

  const handleScroll = useMemo(
    () =>
      debounce(() => {
        const carousel = carouselRef.current;
        if (carousel !== null) {
          setCarouselScrollLeft(carousel.scrollLeft);
        }
      }, 100),
    [carouselRef]
  );

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel !== null) {
      setMaxCarouselScrollLeft(carousel.scrollWidth - carousel.clientWidth); // Maximum scrollLeft value for the ref
    }
  }, [carouselRef]);

  return filters !== undefined && filters.length > 0 ? (
    <>
      <Box sx={{ alignContent: "center", paddingTop: "8px" }}>
        <NodeFilterButton
          onClick={prevHandler}
          disabled={carouselScrollLeft === 0}
        >
          <ChevronLeftIcon />
        </NodeFilterButton>
      </Box>
      <NodeFilterCarousel ref={carouselRef} onScroll={handleScroll}>
        {filters}
      </NodeFilterCarousel>
      <Box sx={{ alignContent: "center", paddingTop: "8px" }}>
        <NodeFilterButton
          onClick={nextHandler}
          disabled={carouselScrollLeft >= maxCarouselScrollLeft}
        >
          <ChevronRightIcon />
        </NodeFilterButton>
      </Box>
    </>
  ) : null;
}
