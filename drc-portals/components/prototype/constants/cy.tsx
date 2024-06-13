import {
  Paper,
  Tooltip,
  TooltipProps,
  styled,
  tooltipClasses,
} from "@mui/material";
import { Css, Position } from "cytoscape";
import { forwardRef } from "react";

import { CytoscapeNodeData } from "../interfaces/cy";
import { CytoscapeReference } from "../types/cy";
import {
  getEdgePoint,
  getSegmentPropsWithPoints,
  unlockD3ForceNodes,
} from "../utils/cy";

import {
  ADMIN_NODE_COLOR,
  BIOSAMPLE_RELATED_NODE_COLOR,
  CONTAINER_NODE_COLOR,
  CORE_NODE_COLOR,
  ENTITY_STYLES_MAP,
  FILE_RELATED_NODE_COLOR,
  NODE_CLASS_MAP,
  SUBJECT_RELATED_NODE_COLOR,
  TERM_NODE_COLOR,
} from "./shared";
import {
  ANALYSIS_TYPE_LABEL,
  ANATOMY_LABEL,
  ASSAY_TYPE_LABEL,
  ASSOCIATED_WITH_TYPE,
  BIOSAMPLE_LABEL,
  COLLECTION_LABEL,
  COMPOUND_LABEL,
  CONTAINS_TYPE,
  DATA_TYPE_LABEL,
  DCC_LABEL,
  DESCRIBES_TYPE,
  DISEASE_LABEL,
  FILE_FORMAT_LABEL,
  FILE_LABEL,
  GENERATED_BY_ANALYSIS_TYPE_TYPE,
  GENERATED_BY_ASSAY_TYPE_TYPE,
  GENE_LABEL,
  HAS_SOURCE_TYPE,
  ID_NAMESPACE_LABEL,
  IS_DATA_TYPE_TYPE,
  IS_ETHNICITY_TYPE,
  IS_FILE_FORMAT_TYPE,
  IS_GRANULARITY_TYPE,
  IS_PARENT_OF_TYPE,
  IS_RACE_TYPE,
  IS_SEX_TYPE,
  IS_SUPERSET_OF_TYPE,
  NCBI_TAXONOMY_LABEL,
  PHENOTYPE_LABEL,
  PREPPED_VIA_TYPE,
  PRODUCED_TYPE,
  PROJECT_LABEL,
  PROPERTY_MAP,
  PROTEIN_LABEL,
  SAMPLED_FROM_TYPE,
  SAMPLE_PREP_METHOD_LABEL,
  STRING_PROPERTIES,
  SUBJECT_ETHNICITY_LABEL,
  SUBJECT_GRANULARITY_LABEL,
  SUBJECT_LABEL,
  SUBJECT_RACE_LABEL,
  SUBJECT_SEX_LABEL,
  SUBSTANCE_LABEL,
  TESTED_FOR_TYPE,
} from "./neo4j";

export const ChartContainer = styled(Paper)({
  width: "100%",
  height: "100%",
});

// See the MUI docs for a detailed example: https://mui.com/material-ui/react-tooltip/#customization
export const ChartTooltip = styled(
  forwardRef<HTMLDivElement, TooltipProps>(({ className, ...props }, ref) => (
    <Tooltip ref={ref} {...props} classes={{ popper: className }} />
  ))
)(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "transparent",
  },
}));

// Default node properties
export const NODE_FONT_FAMILY = "arial";
export const NODE_DIAMETER = 30;
export const NODE_BORDER_WIDTH = 2;

// Default edge properties
export const ARROW_SCALE = 0.5;
export const EDGE_COLOR = "#797979";
export const EDGE_WIDTH = 1;

// Other Properties
export const FONT_SIZE = "4px";
export const MAX_NODE_LINES = 3;
export const MAX_NODE_LABEL_WIDTH = 24;
export const MIN_ZOOMED_FONT_SIZE = 8;

// Schema-specific Properties
export const PATH_COLOR = "#c634eb";

export const D3_FORCE_LAYOUT = {
  name: "d3-force",
  animate: true,
  infinite: true,
  fixedAfterDragging: true,
  linkId: (d: CytoscapeNodeData) => {
    return d.id;
  },
  linkDistance: 80,
  manyBodyStrength: -300,
};

export const DEFAULT_STYLESHEET: any[] = [
  {
    selector: "node",
    style: {
      height: NODE_DIAMETER,
      width: NODE_DIAMETER,
      shape: "ellipse",
    },
  },
  {
    selector: "node[label]",
    style: {
      label: "data(label)",
      "font-family": NODE_FONT_FAMILY,
      "font-size": FONT_SIZE,
      "min-zoomed-font-size": MIN_ZOOMED_FONT_SIZE,
      "text-halign": "center",
      "text-valign": "center",
      "text-max-width": `${MAX_NODE_LABEL_WIDTH}px`,
      "text-wrap": "wrap",
    },
  },
  {
    selector: "node:selected",
    style: {
      "border-color": "#336699",
      "border-width": NODE_BORDER_WIDTH,
    },
  },
  {
    selector: "node:active",
    style: {
      "overlay-shape": "ellipse",
    },
  },
  {
    selector: "edge",
    style: {
      "arrow-scale": ARROW_SCALE,
      "curve-style": "bezier",
      "target-arrow-shape": "triangle",
      "text-rotation": "autorotate",
      width: EDGE_WIDTH,
    },
  },
  {
    selector: "edge[label]",
    style: {
      label: "data(label)",
      "font-size": FONT_SIZE,
      "min-zoomed-font-size": MIN_ZOOMED_FONT_SIZE,
      "text-background-color": "#f2f2f2",
      "text-background-opacity": 1,
      // so the transition is selected when its label/name is selected
      "text-events": "yes",
    },
  },
  {
    selector: ".minus-90-loop-edge",
    style: {
      "loop-direction": "-90deg",
    },
  },
  {
    selector: ".minus-30-loop-edge",
    style: {
      "loop-direction": "-30deg",
    },
  },
  {
    selector: ".30-loop-edge",
    style: {
      "loop-direction": "30deg",
    },
  },
  {
    selector: ".90-loop-edge",
    style: {
      "loop-direction": "90deg",
    },
  },
  {
    selector: ".dimmed",
    style: {
      opacity: 0.1,
    },
  },
  {
    selector: ".hovered",
    style: {
      opacity: 1,
    },
  },
  {
    selector: ".horizontal-text",
    style: {
      "text-rotation": "0deg",
    },
  },
  {
    selector: ".no-arrows",
    style: {
      "source-arrow-shape": "none",
      "target-arrow-shape": "none",
    },
  },
  {
    selector: "node.dashed",
    style: {
      "border-style": "dashed",
    },
  },
  {
    selector: "edge.dashed",
    style: {
      "line-style": "dashed",
    },
  },
  ...Array.from(ENTITY_STYLES_MAP.entries()).map(([className, style]) => {
    return {
      selector: `.${className}`,
      style: style as Css.Node,
    };
  }),
];

// Neo4j Schema Represented as a Cytoscape Chart:
const TERM_NODE_Y_SPACING = 65;
const SCHEMA_EDGE_SPACING = 15;
const SCHEMA_FONT_SIZE = "10";
const SCHEMA_NODE_DIAMETER = 50;
const SCHEMA_NODE_RADIUS = SCHEMA_NODE_DIAMETER / 2;

const FILE_POS = { x: 0, y: 0 };
const ID_NAMESPACE_POS = { x: FILE_POS.x, y: -160 };
const DCC_POS = { x: -450, y: 250 };
const COLLECTION_POS = { x: 300, y: DCC_POS.y };
const PROJECT_POS = { x: -1 * COLLECTION_POS.x, y: DCC_POS.y };
const ANALYSIS_TYPE_POS = { x: 215, y: -60 };
const ASSAY_TYPE_POS = { x: -1 * ANALYSIS_TYPE_POS.x, y: ANALYSIS_TYPE_POS.y };
const FILE_FORMAT_POS = { x: 135, y: -120 };
const DATA_TYPE_POS = { x: -1 * FILE_FORMAT_POS.x, y: FILE_FORMAT_POS.y };
const BIOSAMPLE_POS = { x: 230, y: 500 };
const SUBJECT_POS = { x: -1 * BIOSAMPLE_POS.x, y: BIOSAMPLE_POS.y };
const SUBJECT_ETHNICITY_POS = { x: 1.8 * SUBJECT_POS.x, y: 620 };
const SUBJECT_SEX_POS = { x: 1.4 * SUBJECT_POS.x, y: SUBJECT_ETHNICITY_POS.y };
const SUBJECT_RACE_POS = { x: SUBJECT_POS.x, y: SUBJECT_ETHNICITY_POS.y };
const SUBJECT_GRANULARITY_POS = {
  x: 0.6 * SUBJECT_POS.x,
  y: SUBJECT_ETHNICITY_POS.y,
};
const SAMPLE_PREP_METHOD_POS = {
  x: COLLECTION_POS.x,
  y: SUBJECT_ETHNICITY_POS.y,
};
const COMPOUND_POS = { x: 0, y: TERM_NODE_Y_SPACING * 0.8 };
const SUBSTANCE_POS = { x: COMPOUND_POS.x + 180, y: COMPOUND_POS.y };
const PROTEIN_POS = { x: COMPOUND_POS.x, y: TERM_NODE_Y_SPACING * 1.7 };
const NCBI_TAXONOMY_POS = { x: COMPOUND_POS.x, y: TERM_NODE_Y_SPACING * 2.9 };
const GENE_POS = { x: COMPOUND_POS.x, y: TERM_NODE_Y_SPACING * 4.1 };
const PHENOTYPE_POS = { x: COMPOUND_POS.x, y: TERM_NODE_Y_SPACING * 5.3 };
const DISEASE_POS = { x: COMPOUND_POS.x, y: TERM_NODE_Y_SPACING * 6.2 };
const ANATOMY_POS = { x: COMPOUND_POS.x, y: TERM_NODE_Y_SPACING * 7.1 };
const ALL_TERMS_NODE_POS = { x: -1 * DCC_POS.x, y: DCC_POS.y };

const ID_NAMESPACE_CONTAINS_PROJECT_SOURCE_DEG = -90;
const ID_NAMESPACE_CONTAINS_PROJECT_TARGET_DEG = 0;
const ID_NAMESPACE_CONTAINS_PROJECT_SOURCE_POS = getEdgePoint(
  ID_NAMESPACE_POS,
  ID_NAMESPACE_CONTAINS_PROJECT_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const ID_NAMESPACE_CONTAINS_PROJECT_TARGET_POS = getEdgePoint(
  PROJECT_POS,
  ID_NAMESPACE_CONTAINS_PROJECT_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const ID_NAMESPACE_CONTAINS_COLLECTION_SOURCE_DEG = 90;
const ID_NAMESPACE_CONTAINS_COLLECTION_TARGET_DEG = 0;
const ID_NAMESPACE_CONTAINS_COLLECTION_SOURCE_POS = getEdgePoint(
  ID_NAMESPACE_POS,
  ID_NAMESPACE_CONTAINS_COLLECTION_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const ID_NAMESPACE_CONTAINS_COLLECTION_TARGET_POS = getEdgePoint(
  COLLECTION_POS,
  ID_NAMESPACE_CONTAINS_COLLECTION_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const ID_NAMESPACE_CONTAINS_SUBJECT_SOURCE_DEG = 0;
const ID_NAMESPACE_CONTAINS_SUBJECT_TARGET_DEG = -90;
const ID_NAMESPACE_CONTAINS_SUBJECT_SOURCE_POS = getEdgePoint(
  ID_NAMESPACE_POS,
  ID_NAMESPACE_CONTAINS_SUBJECT_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const ID_NAMESPACE_CONTAINS_SUBJECT_TARGET_POS = getEdgePoint(
  SUBJECT_POS,
  ID_NAMESPACE_CONTAINS_SUBJECT_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const ID_NAMESPACE_CONTAINS_BIOSAMPLE_SOURCE_DEG = 0;
const ID_NAMESPACE_CONTAINS_BIOSAMPLE_TARGET_DEG = 90;
const ID_NAMESPACE_CONTAINS_BIOSAMPLE_SOURCE_POS = getEdgePoint(
  ID_NAMESPACE_POS,
  ID_NAMESPACE_CONTAINS_BIOSAMPLE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const ID_NAMESPACE_CONTAINS_BIOSAMPLE_TARGET_POS = getEdgePoint(
  BIOSAMPLE_POS,
  ID_NAMESPACE_CONTAINS_BIOSAMPLE_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const PROJECT_CONTAINS_FILE_SOURCE_DEG = 10;
const PROJECT_CONTAINS_FILE_TARGET_DEG = -90;
const PROJECT_CONTAINS_FILE_SOURCE_POS = getEdgePoint(
  PROJECT_POS,
  PROJECT_CONTAINS_FILE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const PROJECT_CONTAINS_FILE_TARGET_POS = getEdgePoint(
  FILE_POS,
  PROJECT_CONTAINS_FILE_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const PROJECT_CONTAINS_SUBJECT_SOURCE_DEG = 180;
const PROJECT_CONTAINS_SUBJECT_TARGET_DEG = -100;
const PROJECT_CONTAINS_SUBJECT_SOURCE_POS = getEdgePoint(
  PROJECT_POS,
  PROJECT_CONTAINS_SUBJECT_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const PROJECT_CONTAINS_SUBJECT_TARGET_POS = getEdgePoint(
  SUBJECT_POS,
  PROJECT_CONTAINS_SUBJECT_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const PROJECT_CONTAINS_BIOSAMPLE_SOURCE_DEG = -100;
const PROJECT_CONTAINS_BIOSAMPLE_TARGET_DEG = 180;
const PROJECT_CONTAINS_BIOSAMPLE_SOURCE_POS = getEdgePoint(
  PROJECT_POS,
  PROJECT_CONTAINS_BIOSAMPLE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const PROJECT_CONTAINS_BIOSAMPLE_TARGET_POS = getEdgePoint(
  BIOSAMPLE_POS,
  PROJECT_CONTAINS_BIOSAMPLE_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const COLLECTION_CONTAINS_FILE_SOURCE_DEG = -10;
const COLLECTION_CONTAINS_FILE_TARGET_DEG = 90;
const COLLECTION_CONTAINS_FILE_SOURCE_POS = getEdgePoint(
  COLLECTION_POS,
  COLLECTION_CONTAINS_FILE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const COLLECTION_CONTAINS_FILE_TARGET_POS = getEdgePoint(
  FILE_POS,
  COLLECTION_CONTAINS_FILE_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const COLLECTION_CONTAINS_SUBJECT_SOURCE_DEG = 90;
const COLLECTION_CONTAINS_SUBJECT_TARGET_DEG = 180;
const COLLECTION_CONTAINS_SUBJECT_SOURCE_POS = getEdgePoint(
  COLLECTION_POS,
  COLLECTION_CONTAINS_SUBJECT_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const COLLECTION_CONTAINS_SUBJECT_TARGET_POS = getEdgePoint(
  SUBJECT_POS,
  COLLECTION_CONTAINS_SUBJECT_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const COLLECTION_CONTAINS_BIOSAMPLE_SOURCE_DEG = 180;
const COLLECTION_CONTAINS_BIOSAMPLE_TARGET_DEG = 100;
const COLLECTION_CONTAINS_BIOSAMPLE_SOURCE_POS = getEdgePoint(
  COLLECTION_POS,
  COLLECTION_CONTAINS_BIOSAMPLE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const COLLECTION_CONTAINS_BIOSAMPLE_TARGET_POS = getEdgePoint(
  BIOSAMPLE_POS,
  COLLECTION_CONTAINS_BIOSAMPLE_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const FILE_DESCRIBES_SUBJECT_SOURCE_DEG = -100;
const FILE_DESCRIBES_SUBJECT_TARGET_DEG = 0;
const FILE_DESCRIBES_SUBJECT_SOURCE_POS = getEdgePoint(
  FILE_POS,
  FILE_DESCRIBES_SUBJECT_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const FILE_DESCRIBES_SUBJECT_TARGET_POS = getEdgePoint(
  SUBJECT_POS,
  FILE_DESCRIBES_SUBJECT_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const FILE_DESCRIBES_BIOSAMPLE_SOURCE_DEG = 100;
const FILE_DESCRIBES_BIOSAMPLE_TARGET_DEG = 0;
const FILE_DESCRIBES_BIOSAMPLE_SOURCE_POS = getEdgePoint(
  FILE_POS,
  FILE_DESCRIBES_BIOSAMPLE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const FILE_DESCRIBES_BIOSAMPLE_TARGET_POS = getEdgePoint(
  BIOSAMPLE_POS,
  FILE_DESCRIBES_BIOSAMPLE_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const BIOSAMPLE_TESTED_FOR_PHENOTYPE_SOURCE_DEG = -90;
const BIOSAMPLE_TESTED_FOR_PHENOTYPE_TARGET_DEG = 90;
const BIOSAMPLE_TESTED_FOR_PHENOTYPE_SOURCE_POS = getEdgePoint(
  BIOSAMPLE_POS,
  BIOSAMPLE_TESTED_FOR_PHENOTYPE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const BIOSAMPLE_TESTED_FOR_PHENOTYPE_TARGET_POS = getEdgePoint(
  PHENOTYPE_POS,
  BIOSAMPLE_TESTED_FOR_PHENOTYPE_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const BIOSAMPLE_TESTED_FOR_DISEASE_SOURCE_DEG = -90;
const BIOSAMPLE_TESTED_FOR_DISEASE_TARGET_DEG = 90;
const BIOSAMPLE_TESTED_FOR_DISEASE_SOURCE_POS = getEdgePoint(
  BIOSAMPLE_POS,
  BIOSAMPLE_TESTED_FOR_DISEASE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const BIOSAMPLE_TESTED_FOR_DISEASE_TARGET_POS = getEdgePoint(
  DISEASE_POS,
  BIOSAMPLE_TESTED_FOR_DISEASE_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const BIOSAMPLE_SAMPLED_FROM_ANATOMY_SOURCE_DEG = -90;
const BIOSAMPLE_SAMPLED_FROM_ANATOMY_TARGET_DEG = 90;
const BIOSAMPLE_SAMPLED_FROM_ANATOMY_SOURCE_POS = getEdgePoint(
  BIOSAMPLE_POS,
  BIOSAMPLE_SAMPLED_FROM_ANATOMY_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const BIOSAMPLE_SAMPLED_FROM_ANATOMY_TARGET_POS = getEdgePoint(
  ANATOMY_POS,
  BIOSAMPLE_SAMPLED_FROM_ANATOMY_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const SUBJECT_TESTED_FOR_PHENOTYPE_SOURCE_DEG = 90;
const SUBJECT_TESTED_FOR_PHENOTYPE_TARGET_DEG = -90;
const SUBJECT_TESTED_FOR_PHENOTYPE_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_TESTED_FOR_PHENOTYPE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const SUBJECT_TESTED_FOR_PHENOTYPE_TARGET_POS = getEdgePoint(
  PHENOTYPE_POS,
  SUBJECT_TESTED_FOR_PHENOTYPE_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const SUBJECT_TESTED_FOR_DISEASE_SOURCE_DEG = 90;
const SUBJECT_TESTED_FOR_DISEASE_TARGET_DEG = -90;
const SUBJECT_TESTED_FOR_DISEASE_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_TESTED_FOR_DISEASE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const SUBJECT_TESTED_FOR_DISEASE_TARGET_POS = getEdgePoint(
  DISEASE_POS,
  SUBJECT_TESTED_FOR_DISEASE_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const SUBJECT_ASSOCIATED_WITH_TAXONOMY_SOURCE_DEG = 90;
const SUBJECT_ASSOCIATED_WITH_TAXONOMY_TARGET_DEG = -90;
const SUBJECT_ASSOCIATED_WITH_TAXONOMY_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_ASSOCIATED_WITH_TAXONOMY_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const SUBJECT_ASSOCIATED_WITH_TAXONOMY_TARGET_POS = getEdgePoint(
  NCBI_TAXONOMY_POS,
  SUBJECT_ASSOCIATED_WITH_TAXONOMY_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const SUBJECT_ASSOCIATED_WITH_COMPOUND_SOURCE_DEG = 90;
const SUBJECT_ASSOCIATED_WITH_COMPOUND_TARGET_DEG = -90;
const SUBJECT_ASSOCIATED_WITH_COMPOUND_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_ASSOCIATED_WITH_COMPOUND_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const SUBJECT_ASSOCIATED_WITH_COMPOUND_TARGET_POS = getEdgePoint(
  COMPOUND_POS,
  SUBJECT_ASSOCIATED_WITH_COMPOUND_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_SOURCE_DEG = -90;
const BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_TARGET_DEG = 180;
const BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_SOURCE_POS = getEdgePoint(
  BIOSAMPLE_POS,
  BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_TARGET_POS = getEdgePoint(
  SUBSTANCE_POS,
  BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const BIOSAMPLE_ASSOCIATED_WITH_GENE_SOURCE_DEG = -90;
const BIOSAMPLE_ASSOCIATED_WITH_GENE_TARGET_DEG = 90;
const BIOSAMPLE_ASSOCIATED_WITH_GENE_SOURCE_POS = getEdgePoint(
  BIOSAMPLE_POS,
  BIOSAMPLE_ASSOCIATED_WITH_GENE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const BIOSAMPLE_ASSOCIATED_WITH_GENE_TARGET_POS = getEdgePoint(
  GENE_POS,
  BIOSAMPLE_ASSOCIATED_WITH_GENE_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const getNodeProps = (label: string) => {
  return (PROPERTY_MAP.get(label) as string[]).reduce((o, prop) => {
    let type: string;

    // TODO: Add additional property types as they become available
    if (STRING_PROPERTIES.has(prop)) {
      type = "string";
    } else {
      type = "unknown";
    }

    return { ...o, [prop]: type };
  }, {});
};

export const SCHEMA_NODES = [
  {
    classes: [NODE_CLASS_MAP.get(ID_NAMESPACE_LABEL) || ""],
    position: ID_NAMESPACE_POS,
    data: {
      id: "1",
      label: ID_NAMESPACE_LABEL,
      neo4j: {
        labels: [ID_NAMESPACE_LABEL],
        properties: getNodeProps(ID_NAMESPACE_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(DCC_LABEL) || ""],
    position: DCC_POS,
    data: {
      id: "2",
      label: DCC_LABEL,
      neo4j: {
        labels: [DCC_LABEL],
        properties: getNodeProps(DCC_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(PROJECT_LABEL) || ""],
    position: PROJECT_POS,
    data: {
      id: "3",
      label: PROJECT_LABEL,
      neo4j: {
        labels: [PROJECT_LABEL],
        properties: getNodeProps(PROJECT_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(COLLECTION_LABEL) || ""],
    position: COLLECTION_POS,
    data: {
      id: "4",
      label: COLLECTION_LABEL,
      neo4j: {
        labels: [COLLECTION_LABEL],
        properties: getNodeProps(COLLECTION_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(ASSAY_TYPE_LABEL) || ""],
    position: ASSAY_TYPE_POS,
    data: {
      id: "5",
      label: ASSAY_TYPE_LABEL,
      neo4j: {
        labels: [ASSAY_TYPE_LABEL],
        properties: getNodeProps(ASSAY_TYPE_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(DATA_TYPE_LABEL) || ""],
    position: DATA_TYPE_POS,
    data: {
      id: "6",
      label: DATA_TYPE_LABEL,
      neo4j: {
        labels: [DATA_TYPE_LABEL],
        properties: getNodeProps(DATA_TYPE_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(FILE_FORMAT_LABEL) || ""],
    position: FILE_FORMAT_POS,
    data: {
      id: "7",
      label: FILE_FORMAT_LABEL,
      neo4j: {
        labels: [FILE_FORMAT_LABEL],
        properties: getNodeProps(FILE_FORMAT_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(ANALYSIS_TYPE_LABEL) || ""],
    position: ANALYSIS_TYPE_POS,
    data: {
      id: "8",
      label: ANALYSIS_TYPE_LABEL,
      neo4j: {
        labels: [ANALYSIS_TYPE_LABEL],
        properties: getNodeProps(ANALYSIS_TYPE_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(FILE_LABEL) || ""],
    position: FILE_POS,
    data: {
      id: "9",
      label: FILE_LABEL,
      neo4j: {
        labels: [FILE_LABEL],
        properties: getNodeProps(FILE_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBJECT_LABEL) || ""],
    position: SUBJECT_POS,
    data: {
      id: "10",
      label: SUBJECT_LABEL,
      neo4j: {
        labels: [SUBJECT_LABEL],
        properties: getNodeProps(SUBJECT_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBJECT_SEX_LABEL) || ""],
    position: SUBJECT_SEX_POS,
    data: {
      id: "11",
      label: SUBJECT_SEX_LABEL,
      neo4j: {
        labels: [SUBJECT_SEX_LABEL],
        properties: getNodeProps(SUBJECT_SEX_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBJECT_ETHNICITY_LABEL) || ""],
    position: SUBJECT_ETHNICITY_POS,
    data: {
      id: "12",
      label: SUBJECT_ETHNICITY_LABEL,
      neo4j: {
        labels: [SUBJECT_ETHNICITY_LABEL],
        properties: getNodeProps(SUBJECT_ETHNICITY_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBJECT_RACE_LABEL) || ""],
    position: SUBJECT_RACE_POS,
    data: {
      id: "13",
      label: SUBJECT_RACE_LABEL,
      neo4j: {
        labels: [SUBJECT_RACE_LABEL],
        properties: getNodeProps(SUBJECT_RACE_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBJECT_GRANULARITY_LABEL) || ""],
    position: SUBJECT_GRANULARITY_POS,
    data: {
      id: "14",
      label: SUBJECT_GRANULARITY_LABEL,
      neo4j: {
        labels: [SUBJECT_GRANULARITY_LABEL],
        properties: getNodeProps(SUBJECT_GRANULARITY_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(BIOSAMPLE_LABEL) || ""],
    position: BIOSAMPLE_POS,
    data: {
      id: "15",
      label: BIOSAMPLE_LABEL,
      neo4j: {
        labels: [BIOSAMPLE_LABEL],
        properties: getNodeProps(BIOSAMPLE_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(SAMPLE_PREP_METHOD_LABEL) || ""],
    position: SAMPLE_PREP_METHOD_POS,
    data: {
      id: "18",
      label: SAMPLE_PREP_METHOD_LABEL,
      neo4j: {
        labels: [SAMPLE_PREP_METHOD_LABEL],
        properties: getNodeProps(SAMPLE_PREP_METHOD_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBSTANCE_LABEL) || ""],
    position: SUBSTANCE_POS,
    data: {
      id: "22",
      label: SUBSTANCE_LABEL,
      neo4j: {
        labels: [SUBSTANCE_LABEL],
        properties: getNodeProps(SUBSTANCE_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(COMPOUND_LABEL) || ""],
    position: COMPOUND_POS,
    data: {
      id: "20",
      label: COMPOUND_LABEL,
      neo4j: {
        labels: [COMPOUND_LABEL],
        properties: getNodeProps(COMPOUND_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(PROTEIN_LABEL) || ""],
    position: PROTEIN_POS,
    data: {
      id: "23",
      label: PROTEIN_LABEL,
      neo4j: {
        labels: [PROTEIN_LABEL],
        properties: getNodeProps(PROTEIN_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(NCBI_TAXONOMY_LABEL) || ""],
    position: NCBI_TAXONOMY_POS,
    data: {
      id: "24",
      label: NCBI_TAXONOMY_LABEL,
      neo4j: {
        labels: [NCBI_TAXONOMY_LABEL],
        properties: getNodeProps(NCBI_TAXONOMY_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(GENE_LABEL) || ""],
    position: GENE_POS,
    data: {
      id: "21",
      label: GENE_LABEL,
      neo4j: {
        labels: [GENE_LABEL],
        properties: getNodeProps(GENE_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(PHENOTYPE_LABEL) || ""],
    position: PHENOTYPE_POS,
    data: {
      id: "17",
      label: PHENOTYPE_LABEL,
      neo4j: {
        labels: [PHENOTYPE_LABEL],
        properties: getNodeProps(PHENOTYPE_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(DISEASE_LABEL) || ""],
    position: DISEASE_POS,
    data: {
      id: "19",
      label: DISEASE_LABEL,
      neo4j: {
        labels: [DISEASE_LABEL],
        properties: getNodeProps(DISEASE_LABEL),
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(ANATOMY_LABEL) || ""],
    position: ANATOMY_POS,
    data: {
      id: "16",
      label: ANATOMY_LABEL,
      neo4j: {
        labels: [ANATOMY_LABEL],
        properties: getNodeProps(ANATOMY_LABEL),
      },
    },
  },
  {
    classes: ["all-terms-node", "dashed"],
    position: ALL_TERMS_NODE_POS,
    data: {
      id: "25",
      label: "All Term Nodes",
    },
  },
];

export const INITIAL_NODE_POSITIONS: Map<string, Position> = new Map<
  string,
  Position
>(
  SCHEMA_NODES.map((el) => [el.data.id, { x: el.position.x, y: el.position.y }])
);

export const SCHEMA_EDGES = [
  {
    classes: ["file-related-relationship"],
    data: {
      id: "100",
      source: "9",
      target: "7",
      label: IS_FILE_FORMAT_TYPE,
    },
  },
  {
    classes: ["file-related-relationship"],
    data: {
      id: "101",
      source: "9",
      target: "5",
      label: GENERATED_BY_ASSAY_TYPE_TYPE,
    },
  },
  {
    classes: ["subject-related-relationship"],
    data: {
      id: "102",
      source: "10",
      target: "14",
      label: IS_GRANULARITY_TYPE,
    },
  },
  {
    classes: ["subject-related-relationship"],
    data: {
      id: "103",
      source: "10",
      target: "12",
      label: IS_ETHNICITY_TYPE,
    },
  },
  {
    classes: [
      "substance-associated-with-taxonomy",
      "term-relationship",
      "no-arrows",
    ],
    data: {
      id: "104",
      source: "22",
      target: "24",
      label: ASSOCIATED_WITH_TYPE,
    },
  },
  {
    classes: [
      "biosample-associated-with-substance",
      "term-relationship",
      "no-arrows",
    ],
    data: {
      id: "149",
      source: "15",
      target: "22",
      label: ASSOCIATED_WITH_TYPE,
    },
  },
  {
    classes: [
      "biosample-associated-with-gene",
      "term-relationship",
      "no-arrows",
    ],
    data: {
      id: "150",
      source: "15",
      target: "21",
      label: ASSOCIATED_WITH_TYPE,
    },
  },
  {
    classes: ["term-relationship", "no-arrows"],
    data: {
      id: "105",
      source: "22",
      target: "20",
      label: ASSOCIATED_WITH_TYPE,
    },
  },
  {
    classes: [
      "subject-associated-with-taxonomy",
      "term-relationship",
      "no-arrows",
    ],
    data: {
      id: "106",
      source: "10",
      target: "24",
      label: ASSOCIATED_WITH_TYPE,
    },
  },
  {
    classes: [
      "subject-associated-with-compound",
      "term-relationship",
      "no-arrows",
    ],
    data: {
      id: "107",
      source: "10",
      target: "20",
      label: ASSOCIATED_WITH_TYPE,
    },
  },
  {
    classes: ["id-namespace-contains-collection", "admin-relationship"],
    data: {
      id: "110",
      source: "1",
      target: "4",
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["collection-contains-file", "container-relationship"],
    data: {
      id: "111",
      source: "4",
      target: "9",
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["admin-relationship", "horizontal-text"],
    data: {
      id: "112",
      source: "1",
      target: "9",
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["id-namespace-contains-biosample", "admin-relationship"],
    data: {
      id: "113",
      source: "1",
      target: "15",
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["project-contains-subject", "container-relationship"],
    data: {
      id: "114",
      source: "3",
      target: "10",
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["id-namespace-contains-project", "admin-relationship"],
    data: {
      id: "115",
      source: "1",
      target: "3",
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["project-contains-biosample", "container-relationship"],
    data: {
      id: "117",
      source: "3",
      target: "15",
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["project-contains-file", "container-relationship"],
    data: {
      id: "118",
      source: "3",
      target: "9",
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["collection-contains-biosample", "container-relationship"],
    data: {
      id: "119",
      source: "4",
      target: "15",
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["collection-contains-subject", "container-relationship"],
    data: {
      id: "120",
      source: "4",
      target: "10",
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["id-namespace-contains-subject", "admin-relationship"],
    data: {
      id: "121",
      source: "1",
      target: "10",
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["subject-related-relationship"],
    data: {
      id: "124",
      source: "10",
      target: "13",
      label: IS_RACE_TYPE,
    },
  },
  {
    classes: ["collection-is-superset-of-collection", "container-relationship"],
    data: {
      id: "125",
      source: "4",
      target: "4",
      label: IS_SUPERSET_OF_TYPE,
    },
  },
  {
    classes: ["file-related-relationship"],
    data: {
      id: "126",
      source: "9",
      target: "8",
      label: GENERATED_BY_ANALYSIS_TYPE_TYPE,
    },
  },
  {
    classes: ["admin-relationship"],
    data: {
      id: "127",
      source: "2",
      target: "3",
      label: PRODUCED_TYPE,
    },
  },
  {
    classes: ["core-relationship", "file-describes-biosample"],
    data: {
      id: "128",
      source: "9",
      target: "15",
      label: DESCRIBES_TYPE,
    },
  },
  {
    classes: ["core-relationship", "file-describes-subject"],
    data: {
      id: "129",
      source: "9",
      target: "10",
      label: DESCRIBES_TYPE,
    },
  },
  {
    classes: [
      "biosample-prepped-via-sample-prep-method",
      "biosample-related-relationship",
      "horizontal-text",
    ],
    data: {
      id: "130",
      source: "15",
      target: "18",
      label: PREPPED_VIA_TYPE,
    },
  },
  {
    classes: ["project-is-parent-of-project", "container-relationship"],
    data: {
      id: "131",
      source: "3",
      target: "3",
      label: IS_PARENT_OF_TYPE,
    },
  },
  {
    classes: ["file-related-relationship"],
    data: {
      id: "132",
      source: "9",
      target: "6",
      label: IS_DATA_TYPE_TYPE,
    },
  },
  {
    classes: ["biosample-tested-for-phenotype", "term-relationship"],
    data: {
      id: "133",
      source: "15",
      target: "17",
      label: TESTED_FOR_TYPE,
    },
  },
  {
    classes: ["subject-tested-for-disease", "term-relationship"],
    data: {
      id: "134",
      source: "10",
      target: "19",
      label: TESTED_FOR_TYPE,
    },
  },
  {
    classes: ["biosample-tested-for-disease", "term-relationship"],
    data: {
      id: "135",
      source: "15",
      target: "19",
      label: TESTED_FOR_TYPE,
    },
  },
  {
    classes: ["subject-tested-for-phenotype", "term-relationship"],
    data: {
      id: "136",
      source: "10",
      target: "17",
      label: TESTED_FOR_TYPE,
    },
  },
  {
    classes: ["term-relationship", "horizontal-text"],
    data: {
      id: "137",
      source: "23",
      target: "24",
      label: HAS_SOURCE_TYPE,
    },
  },
  {
    classes: ["term-relationship", "horizontal-text"],
    data: {
      id: "138",
      source: "21",
      target: "24",
      label: HAS_SOURCE_TYPE,
    },
  },
  {
    classes: ["subject-related-relationship"],
    data: {
      id: "139",
      source: "10",
      target: "11",
      label: IS_SEX_TYPE,
    },
  },
  {
    classes: ["core-relationship"],
    data: {
      id: "146",
      source: "15",
      target: "10",
      label: SAMPLED_FROM_TYPE,
    },
  },
  {
    classes: ["biosample-sampled-from-anatomy", "term-relationship"],
    data: {
      id: "147",
      source: "15",
      target: "16",
      label: SAMPLED_FROM_TYPE,
    },
  },
  {
    classes: ["term-relationship", "no-arrows", "horizontal-text"],
    data: {
      id: "148",
      source: "21",
      target: "17",
      label: ASSOCIATED_WITH_TYPE,
    },
  },
  {
    classes: ["term-relationship", "dashed"],
    data: {
      id: "151",
      source: "4",
      target: "25",
      label: CONTAINS_TYPE,
    },
  },
];

export const SCHEMA_ELEMENTS = [...SCHEMA_NODES, ...SCHEMA_EDGES];

export const SCHEMA_STYLESHEET: any[] = [
  ...DEFAULT_STYLESHEET,
  {
    selector: "node",
    style: {
      label: "data(label)",
      height: SCHEMA_NODE_DIAMETER,
      width: SCHEMA_NODE_DIAMETER,
    },
  },
  {
    selector: "node[label]",
    style: {
      label: "data(label)",
      "text-wrap": "none",
      "font-size": SCHEMA_FONT_SIZE,
    },
  },
  {
    selector: "node:selected",
    style: {
      "border-width": 2.5,
    },
  },
  {
    selector: "node.all-terms-node",
    style: {
      "background-color": "#f2f2f2",
      "border-width": 1,
      "border-color": TERM_NODE_COLOR,
    },
  },
  {
    selector: "edge[label]",
    style: {
      label: "data(label)",
      "font-size": SCHEMA_FONT_SIZE,
    },
  },
  {
    selector: "edge.admin-relationship",
    style: {
      "line-color": ADMIN_NODE_COLOR,
      "target-arrow-color": ADMIN_NODE_COLOR,
    },
  },
  {
    selector: "edge.container-relationship",
    style: {
      color: CONTAINER_NODE_COLOR,
      "line-color": CONTAINER_NODE_COLOR,
      "target-arrow-color": CONTAINER_NODE_COLOR,
    },
  },
  {
    selector: "edge.core-relationship",
    style: {
      color: CORE_NODE_COLOR,
      "line-color": CORE_NODE_COLOR,
      "target-arrow-color": CORE_NODE_COLOR,
    },
  },
  {
    selector: "edge.term-relationship",
    style: {
      color: TERM_NODE_COLOR,
      "line-color": TERM_NODE_COLOR,
      "target-arrow-color": TERM_NODE_COLOR,
    },
  },
  {
    selector: "edge.file-related-relationship",
    style: {
      color: FILE_RELATED_NODE_COLOR,
      "line-color": FILE_RELATED_NODE_COLOR,
      "target-arrow-color": FILE_RELATED_NODE_COLOR,
    },
  },
  {
    selector: "edge.subject-related-relationship",
    style: {
      color: SUBJECT_RELATED_NODE_COLOR,
      "line-color": SUBJECT_RELATED_NODE_COLOR,
      "target-arrow-color": SUBJECT_RELATED_NODE_COLOR,
    },
  },
  {
    selector: "edge.biosample-related-relationship",
    style: {
      color: BIOSAMPLE_RELATED_NODE_COLOR,
      "line-color": BIOSAMPLE_RELATED_NODE_COLOR,
      "target-arrow-color": BIOSAMPLE_RELATED_NODE_COLOR,
    },
  },
  {
    selector: "edge.id-namespace-contains-project",
    style: {
      label: "",
      "source-label": "data(label)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${ID_NAMESPACE_CONTAINS_PROJECT_SOURCE_DEG}deg`,
      "target-endpoint": `${ID_NAMESPACE_CONTAINS_PROJECT_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        ID_NAMESPACE_CONTAINS_PROJECT_SOURCE_POS,
        [
          {
            x: ID_NAMESPACE_CONTAINS_PROJECT_TARGET_POS.x,
            y: ID_NAMESPACE_CONTAINS_PROJECT_SOURCE_POS.y,
          },
        ],
        ID_NAMESPACE_CONTAINS_PROJECT_TARGET_POS
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: "edge.id-namespace-contains-collection",
    style: {
      label: "",
      "source-label": "data(label)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${ID_NAMESPACE_CONTAINS_COLLECTION_SOURCE_DEG}deg`,
      "target-endpoint": `${ID_NAMESPACE_CONTAINS_COLLECTION_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        ID_NAMESPACE_CONTAINS_COLLECTION_SOURCE_POS,
        [
          {
            x: ID_NAMESPACE_CONTAINS_COLLECTION_TARGET_POS.x,
            y: ID_NAMESPACE_CONTAINS_COLLECTION_SOURCE_POS.y,
          },
        ],
        ID_NAMESPACE_CONTAINS_COLLECTION_TARGET_POS,
        [true]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: "edge.id-namespace-contains-subject",
    style: {
      label: "",
      "source-label": "data(label)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${ID_NAMESPACE_CONTAINS_SUBJECT_SOURCE_DEG}deg`,
      "target-endpoint": `${ID_NAMESPACE_CONTAINS_SUBJECT_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        ID_NAMESPACE_CONTAINS_SUBJECT_SOURCE_POS,
        [
          {
            x: ID_NAMESPACE_CONTAINS_SUBJECT_SOURCE_POS.x,
            y: ID_NAMESPACE_CONTAINS_SUBJECT_SOURCE_POS.y - SCHEMA_EDGE_SPACING,
          },
          {
            x: ID_NAMESPACE_CONTAINS_SUBJECT_TARGET_POS.x - SCHEMA_EDGE_SPACING,
            y: ID_NAMESPACE_CONTAINS_SUBJECT_SOURCE_POS.y - SCHEMA_EDGE_SPACING,
          },
          {
            x: ID_NAMESPACE_CONTAINS_SUBJECT_TARGET_POS.x - SCHEMA_EDGE_SPACING,
            y: ID_NAMESPACE_CONTAINS_SUBJECT_TARGET_POS.y,
          },
        ],
        ID_NAMESPACE_CONTAINS_SUBJECT_TARGET_POS
      ),
      "segment-radii": [20, 20, 20],
    },
  },
  {
    selector: "edge.id-namespace-contains-biosample",
    style: {
      label: "",
      "source-label": "data(label)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${ID_NAMESPACE_CONTAINS_BIOSAMPLE_SOURCE_DEG}deg`,
      "target-endpoint": `${ID_NAMESPACE_CONTAINS_BIOSAMPLE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        ID_NAMESPACE_CONTAINS_BIOSAMPLE_SOURCE_POS,
        [
          {
            x: ID_NAMESPACE_CONTAINS_BIOSAMPLE_SOURCE_POS.x,
            y:
              ID_NAMESPACE_CONTAINS_BIOSAMPLE_SOURCE_POS.y -
              SCHEMA_EDGE_SPACING,
          },
          {
            x:
              ID_NAMESPACE_CONTAINS_BIOSAMPLE_TARGET_POS.x +
              SCHEMA_EDGE_SPACING,
            y:
              ID_NAMESPACE_CONTAINS_BIOSAMPLE_SOURCE_POS.y -
              SCHEMA_EDGE_SPACING,
          },
          {
            x:
              ID_NAMESPACE_CONTAINS_BIOSAMPLE_TARGET_POS.x +
              SCHEMA_EDGE_SPACING,
            y: ID_NAMESPACE_CONTAINS_BIOSAMPLE_TARGET_POS.y,
          },
        ],
        ID_NAMESPACE_CONTAINS_BIOSAMPLE_TARGET_POS,
        [true, true, true]
      ),
      "segment-radii": [20, 20, 20],
    },
  },
  {
    selector: "edge.project-is-parent-of-project",
    style: {
      "loop-direction": "-45deg",
      "loop-sweep": "-45deg",
    },
  },
  {
    selector: "edge.project-contains-file",
    style: {
      label: "",
      "source-label": "data(label)",
      "source-text-offset": 62.5,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${PROJECT_CONTAINS_FILE_SOURCE_DEG}deg`,
      "target-endpoint": `${PROJECT_CONTAINS_FILE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        PROJECT_CONTAINS_FILE_SOURCE_POS,
        [
          {
            x: PROJECT_CONTAINS_FILE_SOURCE_POS.x,
            y: PROJECT_CONTAINS_FILE_TARGET_POS.y,
          },
        ],
        PROJECT_CONTAINS_FILE_TARGET_POS,
        [true]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: "edge.project-contains-subject",
    style: {
      label: "",
      "source-label": "data(label)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${PROJECT_CONTAINS_SUBJECT_SOURCE_DEG}deg`,
      "target-endpoint": `${PROJECT_CONTAINS_SUBJECT_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        PROJECT_CONTAINS_SUBJECT_SOURCE_POS,
        [
          {
            x: PROJECT_CONTAINS_SUBJECT_SOURCE_POS.x,
            y: PROJECT_CONTAINS_SUBJECT_TARGET_POS.y,
          },
        ],
        PROJECT_CONTAINS_SUBJECT_TARGET_POS
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: "edge.project-contains-biosample",
    style: {
      label: "",
      "source-label": "data(label)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${PROJECT_CONTAINS_BIOSAMPLE_SOURCE_DEG}deg`,
      "target-endpoint": `${PROJECT_CONTAINS_BIOSAMPLE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        PROJECT_CONTAINS_BIOSAMPLE_SOURCE_POS,
        [
          {
            x: PROJECT_CONTAINS_BIOSAMPLE_SOURCE_POS.x - SCHEMA_EDGE_SPACING,
            y: PROJECT_CONTAINS_BIOSAMPLE_SOURCE_POS.y,
          },
          {
            x: PROJECT_CONTAINS_BIOSAMPLE_SOURCE_POS.x - SCHEMA_EDGE_SPACING,
            y:
              PROJECT_CONTAINS_BIOSAMPLE_TARGET_POS.y +
              SCHEMA_EDGE_SPACING +
              10,
          },
          {
            x: PROJECT_CONTAINS_BIOSAMPLE_TARGET_POS.x,
            y:
              PROJECT_CONTAINS_BIOSAMPLE_TARGET_POS.y +
              SCHEMA_EDGE_SPACING +
              10,
          },
        ],
        PROJECT_CONTAINS_BIOSAMPLE_TARGET_POS
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: "edge.collection-is-superset-of-collection",
    style: {
      "loop-direction": "45deg",
      "loop-sweep": "-45deg",
    },
  },
  {
    selector: "edge.collection-contains-file",
    style: {
      label: "",
      "source-label": "data(label)",
      "source-text-offset": 62.5,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${COLLECTION_CONTAINS_FILE_SOURCE_DEG}deg`,
      "target-endpoint": `${COLLECTION_CONTAINS_FILE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        COLLECTION_CONTAINS_FILE_SOURCE_POS,
        [
          {
            x: COLLECTION_CONTAINS_FILE_SOURCE_POS.x,
            y: COLLECTION_CONTAINS_FILE_TARGET_POS.y,
          },
        ],
        COLLECTION_CONTAINS_FILE_TARGET_POS
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: "edge.collection-contains-subject",
    style: {
      label: "",
      "source-label": "data(label)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${COLLECTION_CONTAINS_SUBJECT_SOURCE_DEG}deg`,
      "target-endpoint": `${COLLECTION_CONTAINS_SUBJECT_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        COLLECTION_CONTAINS_SUBJECT_SOURCE_POS,
        [
          {
            x: COLLECTION_CONTAINS_SUBJECT_SOURCE_POS.x + SCHEMA_EDGE_SPACING,
            y: COLLECTION_CONTAINS_SUBJECT_SOURCE_POS.y,
          },
          {
            x: COLLECTION_CONTAINS_SUBJECT_SOURCE_POS.x + SCHEMA_EDGE_SPACING,
            y: COLLECTION_CONTAINS_SUBJECT_TARGET_POS.y + SCHEMA_EDGE_SPACING,
          },
          {
            x: COLLECTION_CONTAINS_SUBJECT_TARGET_POS.x,
            y: COLLECTION_CONTAINS_SUBJECT_TARGET_POS.y + SCHEMA_EDGE_SPACING,
          },
        ],
        COLLECTION_CONTAINS_SUBJECT_TARGET_POS,
        [true, true, true]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: "edge.collection-contains-biosample",
    style: {
      label: "",
      "source-label": "data(label)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${COLLECTION_CONTAINS_BIOSAMPLE_SOURCE_DEG}deg`,
      "target-endpoint": `${COLLECTION_CONTAINS_BIOSAMPLE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        COLLECTION_CONTAINS_BIOSAMPLE_SOURCE_POS,
        [
          {
            x: COLLECTION_CONTAINS_BIOSAMPLE_SOURCE_POS.x,
            y: COLLECTION_CONTAINS_BIOSAMPLE_TARGET_POS.y,
          },
        ],
        COLLECTION_CONTAINS_BIOSAMPLE_TARGET_POS,
        [true]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: "edge.file-describes-subject",
    style: {
      label: "",
      "source-label": "data(label)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${FILE_DESCRIBES_SUBJECT_SOURCE_DEG}deg`,
      "target-endpoint": `${FILE_DESCRIBES_SUBJECT_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        FILE_DESCRIBES_SUBJECT_SOURCE_POS,
        [
          {
            x: FILE_DESCRIBES_SUBJECT_TARGET_POS.x,
            y: FILE_DESCRIBES_SUBJECT_SOURCE_POS.y,
          },
        ],
        FILE_DESCRIBES_SUBJECT_TARGET_POS
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: "edge.file-describes-biosample",
    style: {
      label: "",
      "source-label": "data(label)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${FILE_DESCRIBES_BIOSAMPLE_SOURCE_DEG}deg`,
      "target-endpoint": `${FILE_DESCRIBES_BIOSAMPLE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        FILE_DESCRIBES_BIOSAMPLE_SOURCE_POS,
        [
          {
            x: FILE_DESCRIBES_BIOSAMPLE_TARGET_POS.x,
            y: FILE_DESCRIBES_BIOSAMPLE_SOURCE_POS.y,
          },
        ],
        FILE_DESCRIBES_BIOSAMPLE_TARGET_POS,
        [true]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: "edge.biosample-tested-for-phenotype",
    style: {
      label: "",
      "target-label": "data(label)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${BIOSAMPLE_TESTED_FOR_PHENOTYPE_SOURCE_DEG}deg`,
      "target-endpoint": `${BIOSAMPLE_TESTED_FOR_PHENOTYPE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        BIOSAMPLE_TESTED_FOR_PHENOTYPE_SOURCE_POS,
        [
          {
            x: SUBSTANCE_POS.x,
            y: BIOSAMPLE_TESTED_FOR_PHENOTYPE_SOURCE_POS.y,
          },
          {
            x: SUBSTANCE_POS.x,
            y: BIOSAMPLE_TESTED_FOR_PHENOTYPE_TARGET_POS.y,
          },
        ],
        BIOSAMPLE_TESTED_FOR_PHENOTYPE_TARGET_POS,
        [true, false]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: "edge.biosample-tested-for-disease",
    style: {
      label: "",
      "target-label": "data(label)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${BIOSAMPLE_TESTED_FOR_DISEASE_SOURCE_DEG}deg`,
      "target-endpoint": `${BIOSAMPLE_TESTED_FOR_DISEASE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        BIOSAMPLE_TESTED_FOR_DISEASE_SOURCE_POS,
        [
          { x: SUBSTANCE_POS.x, y: BIOSAMPLE_TESTED_FOR_DISEASE_SOURCE_POS.y },
          { x: SUBSTANCE_POS.x, y: BIOSAMPLE_TESTED_FOR_DISEASE_TARGET_POS.y },
        ],
        BIOSAMPLE_TESTED_FOR_DISEASE_TARGET_POS,
        [true, false]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: "edge.biosample-sampled-from-anatomy",
    style: {
      label: "",
      "target-label": "data(label)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${BIOSAMPLE_SAMPLED_FROM_ANATOMY_SOURCE_DEG}deg`,
      "target-endpoint": `${BIOSAMPLE_SAMPLED_FROM_ANATOMY_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        BIOSAMPLE_SAMPLED_FROM_ANATOMY_SOURCE_POS,
        [
          {
            x: SUBSTANCE_POS.x,
            y: BIOSAMPLE_SAMPLED_FROM_ANATOMY_SOURCE_POS.y,
          },
          {
            x: SUBSTANCE_POS.x,
            y: BIOSAMPLE_SAMPLED_FROM_ANATOMY_TARGET_POS.y,
          },
        ],
        BIOSAMPLE_SAMPLED_FROM_ANATOMY_TARGET_POS,
        [true, false]
      ),
    },
  },
  {
    selector: "edge.biosample-prepped-via-sample-prep-method",
    style: {},
  },
  {
    selector: "edge.subject-tested-for-phenotype",
    style: {
      label: "",
      "target-label": "data(label)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${SUBJECT_TESTED_FOR_PHENOTYPE_SOURCE_DEG}deg`,
      "target-endpoint": `${SUBJECT_TESTED_FOR_PHENOTYPE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        SUBJECT_TESTED_FOR_PHENOTYPE_SOURCE_POS,
        [
          {
            x: -1 * SUBSTANCE_POS.x,
            y: SUBJECT_TESTED_FOR_PHENOTYPE_SOURCE_POS.y,
          },
          {
            x: -1 * SUBSTANCE_POS.x,
            y: SUBJECT_TESTED_FOR_PHENOTYPE_TARGET_POS.y,
          },
        ],
        SUBJECT_TESTED_FOR_PHENOTYPE_TARGET_POS,
        [false, true]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: "edge.subject-tested-for-disease",
    style: {
      label: "",
      "target-label": "data(label)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${SUBJECT_TESTED_FOR_DISEASE_SOURCE_DEG}deg`,
      "target-endpoint": `${SUBJECT_TESTED_FOR_DISEASE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        SUBJECT_TESTED_FOR_DISEASE_SOURCE_POS,
        [
          {
            x: -1 * SUBSTANCE_POS.x,
            y: SUBJECT_TESTED_FOR_DISEASE_SOURCE_POS.y,
          },
          {
            x: -1 * SUBSTANCE_POS.x,
            y: SUBJECT_TESTED_FOR_DISEASE_TARGET_POS.y,
          },
        ],
        SUBJECT_TESTED_FOR_DISEASE_TARGET_POS,
        [false, true]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: "edge.subject-associated-with-taxonomy",
    style: {
      label: "",
      "target-label": "data(label)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${SUBJECT_ASSOCIATED_WITH_TAXONOMY_SOURCE_DEG}deg`,
      "target-endpoint": `${SUBJECT_ASSOCIATED_WITH_TAXONOMY_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        SUBJECT_ASSOCIATED_WITH_TAXONOMY_SOURCE_POS,
        [
          {
            x: -1 * SUBSTANCE_POS.x,
            y: SUBJECT_ASSOCIATED_WITH_TAXONOMY_SOURCE_POS.y,
          },
          {
            x: -1 * SUBSTANCE_POS.x,
            y: SUBJECT_ASSOCIATED_WITH_TAXONOMY_TARGET_POS.y,
          },
        ],
        SUBJECT_ASSOCIATED_WITH_TAXONOMY_TARGET_POS,
        [false, true]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: "edge.subject-associated-with-compound",
    style: {
      label: "",
      "target-label": "data(label)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${SUBJECT_ASSOCIATED_WITH_COMPOUND_SOURCE_DEG}deg`,
      "target-endpoint": `${SUBJECT_ASSOCIATED_WITH_COMPOUND_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        SUBJECT_ASSOCIATED_WITH_COMPOUND_SOURCE_POS,
        [
          {
            x: -1 * SUBSTANCE_POS.x,
            y: SUBJECT_ASSOCIATED_WITH_COMPOUND_SOURCE_POS.y,
          },
          {
            x: -1 * SUBSTANCE_POS.x,
            y: SUBJECT_ASSOCIATED_WITH_COMPOUND_TARGET_POS.y,
          },
        ],
        SUBJECT_ASSOCIATED_WITH_COMPOUND_TARGET_POS,
        [false, true]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: "edge.substance-associated-with-taxonomy",
    style: {},
  },
  {
    selector: "edge.biosample-associated-with-substance",
    style: {
      label: "",
      "target-label": "data(label)",
      "target-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_SOURCE_DEG}deg`,
      "target-endpoint": `${BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_SOURCE_POS,
        [
          {
            x: SUBSTANCE_POS.x,
            y: BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_SOURCE_POS.y,
          },
        ],
        BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_TARGET_POS,
        [true]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: "edge.biosample-associated-with-gene",
    style: {
      label: "",
      "target-label": "data(label)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${BIOSAMPLE_ASSOCIATED_WITH_GENE_SOURCE_DEG}deg`,
      "target-endpoint": `${BIOSAMPLE_ASSOCIATED_WITH_GENE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        BIOSAMPLE_ASSOCIATED_WITH_GENE_SOURCE_POS,
        [
          {
            x: SUBSTANCE_POS.x,
            y: BIOSAMPLE_ASSOCIATED_WITH_GENE_SOURCE_POS.y,
          },
          {
            x: SUBSTANCE_POS.x,
            y: BIOSAMPLE_ASSOCIATED_WITH_GENE_TARGET_POS.y,
          },
        ],
        BIOSAMPLE_ASSOCIATED_WITH_GENE_TARGET_POS,
        [true, false]
      ),
    },
  },
  {
    selector: "node.path-element",
    style: {
      "border-color": PATH_COLOR,
      "border-width": NODE_BORDER_WIDTH,
      opacity: 1,
    },
  },
  {
    selector: "edge.path-element",
    style: {
      "line-color": PATH_COLOR,
      "target-arrow-color": PATH_COLOR,
      opacity: 1,
    },
  },
];

export const SCHEMA_LAYOUT = {
  name: "preset",
};

export const D3_FORCE_TOOLS = [
  (cyRef: CytoscapeReference) =>
    unlockD3ForceNodes(
      "search-chart-toolbar-unlock-btn",
      "Unlock All Nodes",
      cyRef
    ),
];
