import CircleIcon from "@mui/icons-material/Circle";
import { Box, Paper, TypographyProps, styled } from "@mui/material";
import { Css, EdgeSingular, NodeSingular, Position } from "cytoscape";
import { CSSProperties, ReactNode } from "react";

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
  DEFINED_BY_TYPE,
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
  PROJECT_LABEL,
  PROTEIN_LABEL,
  REGISTERED_TYPE,
  SAMPLED_FROM_TYPE,
  SAMPLE_PREP_METHOD_LABEL,
  SUBJECT_ETHNICITY_LABEL,
  SUBJECT_GRANULARITY_LABEL,
  SUBJECT_LABEL,
  SUBJECT_RACE_LABEL,
  SUBJECT_SEX_LABEL,
  SUBSTANCE_LABEL,
  TESTED_FOR_TYPE,
} from "@/lib/neo4j/constants";

import {
  ADMIN_NODE_CLASS,
  ADMIN_NODE_COLOR,
  BIOSAMPLE_NODE_CLASS,
  BIOSAMPLE_NODE_COLOR,
  BIOSAMPLE_RELATED_NODE_CLASS,
  BIOSAMPLE_RELATED_NODE_COLOR,
  CFDE_DARK_BLUE,
  CONTAINER_NODE_CLASS,
  CONTAINER_NODE_COLOR,
  DO_LINK,
  EDAM_LINK,
  ENTITY_STYLES_MAP,
  FILE_NODE_CLASS,
  FILE_NODE_COLOR,
  FILE_RELATED_NODE_CLASS,
  FILE_RELATED_NODE_COLOR,
  HPO_LINK,
  NCBI_TAXONOMY_LINK,
  NODE_CLASS_MAP,
  OBI_LINK,
  SUBJECT_NODE_CLASS,
  SUBJECT_NODE_COLOR,
  SUBJECT_RELATED_NODE_CLASS,
  SUBJECT_RELATED_NODE_COLOR,
  TERM_NODE_CLASS,
  TERM_NODE_COLOR,
  UBERON_LINK,
} from "./shared";

import { createArrowDividerElement } from "../utils/shared";

const getRelativePos = (s: Position, t: Position, c: Position) => {
  const numerator = (c.x - s.x) * (t.x - s.x) + (c.y - s.y) * (t.y - s.y);
  const denominator = (t.x - s.x) ** 2 + (t.y - s.y) ** 2;

  return numerator / denominator;
};

const getSegmentIntersectionPoint = (
  s: Position,
  c: Position,
  t: Position
): Position => {
  const m = (t.y - s.y) / (t.x - s.x);
  const b = s.y - m * s.x;
  const mp = -1 * (1 / m);
  const bp = -1 * (mp * c.x) + c.y;
  const x_intersect = (bp - b) / (m - mp);
  const y_intersect = m * x_intersect + b;

  return {
    x: x_intersect,
    y: y_intersect,
  };
};

const getSegmentWeight = (s: Position, c: Position, t: Position) => {
  const intersection_point = getSegmentIntersectionPoint(s, c, t);
  return getRelativePos(
    { x: s.x, y: s.y },
    { x: t.x, y: t.y },
    { x: intersection_point.x, y: intersection_point.y }
  );
};

const getSegmentDistance = (s: Position, c: Position, t: Position) => {
  const intersection_point = getSegmentIntersectionPoint(s, c, t);

  return Math.sqrt(
    (c.x - intersection_point.x) ** 2 + (c.y - intersection_point.y) ** 2
  );
};

const getSegmentPropsWithPoints = (
  source: Position,
  controlPoints: Position[],
  target: Position,
  invertDistances?: boolean[]
) => {
  if (invertDistances === undefined) {
    invertDistances = Array(controlPoints.length).fill(false);
  }

  const weights: number[] = [];
  const distances: number[] = [];

  controlPoints.forEach((cp, i) => {
    weights.push(getSegmentWeight(source, cp, target));
    distances.push(
      getSegmentDistance(source, cp, target) * (invertDistances[i] ? -1 : 1)
    );
  });

  return {
    "segment-weights": weights,
    "segment-distances": distances,
  };
};

const getEdgePoint = (origin: Position, deg: number, r: number): Position => {
  const degreesToRads = (deg: number) => (deg * Math.PI) / 180.0;
  return {
    x: origin.x + r * Math.sin(degreesToRads(deg)),
    y: origin.y - r * Math.cos(degreesToRads(deg)),
  };
};

export const ChartContainer = styled(Paper)({
  width: "100%",
  height: "100%",
  position: "relative",
  overflow: "hidden",
});

export const WidgetContainer = styled(Box)({
  flexGrow: 1,
  display: "flex",
  position: "absolute",
  zIndex: 1,
  padding: "inherit",
});

export const DEFAULT_TOOLTIP_BOX_STYLE_PROPS: CSSProperties = {
  width: "360px",
  height: "auto",
  padding: "7px 6px",
  backgroundColor: "white",
  border: "1px solid",
  borderRadius: "4px",
  color: "#000",
};

export const DEFAULT_TOOLTIP_CONTENT_PROPS: TypographyProps = {
  variant: "body2",
  noWrap: true,
};

// Default node properties
export const NODE_FONT_FAMILY = "arial";
export const NODE_BORDER_WIDTH = 2;
const NODE_DIAMETER = 30;

// Default edge properties
const EDGE_WIDTH = 1;
const ARROW_SCALE = 0.5;

// Other Properties
export const FONT_SIZE = "4px";
export const MAX_NODE_LINES = 3;
export const MAX_NODE_LABEL_WIDTH = 24;
const HIGH_Z_INDEX = 999;
const MIN_ZOOMED_FONT_SIZE = 8;
const SOLID_OPACITY = 1;
const TRANSPARENT_OPACITY = 0.33;

// Schema-specific Properties
const PATH_COLOR = "#c634eb";

export const EULER_LAYOUT = {
  name: "euler",
  randomize: true,
  animate: "end",
  animationDuration: 1000,
  animationEasing: "ease-out",
  gravity: -1.2,
  maxIterations: 2000,
  maxSimulationTime: 8000,
};

const DEFAULT_NODE_SELECTOR_STYLES: any[] = [
  {
    selector: "node",
    style: {
      label: "data(label)",
      height: NODE_DIAMETER,
      width: NODE_DIAMETER,
      shape: "ellipse",
      "border-color": CFDE_DARK_BLUE,
      "border-width": 0,
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
      "border-width": NODE_BORDER_WIDTH,
    },
  },
  {
    selector: "node:active",
    style: {
      "overlay-shape": "ellipse",
    },
  },
];

const DEFAULT_EDGE_SELECTOR_STYLES: any[] = [
  {
    selector: "edge",
    style: {
      label: "data(label)",
      "arrow-scale": ARROW_SCALE,
      "curve-style": "bezier",
      "target-arrow-shape": "triangle",
      "text-rotation": "autorotate",
      width: EDGE_WIDTH,
      "font-size": FONT_SIZE,
      "min-zoomed-font-size": MIN_ZOOMED_FONT_SIZE,
      "text-background-color": "#f2f2f2",
      "text-background-opacity": SOLID_OPACITY,
      // so the transition is selected when its label/name is selected
      "text-events": "yes",
    },
  },
  {
    selector: "edge:selected",
    style: {
      "target-arrow-color": CFDE_DARK_BLUE,
      "line-color": CFDE_DARK_BLUE,
      "z-index": HIGH_Z_INDEX,
    },
  },
];

const STYLESHEET_CLASSES = [
  // Element agnostic classes
  {
    selector: ".transparent",
    style: {
      opacity: TRANSPARENT_OPACITY,
    },
  },
  {
    selector: ".solid",
    style: {
      opacity: SOLID_OPACITY,
    },
  },
  {
    selector: ".hovered",
    style: {
      opacity: SOLID_OPACITY,
      "z-index": HIGH_Z_INDEX,
    },
  },
  // Node specific classes
  {
    selector: "node.dashed",
    style: {
      "border-style": "dashed",
    },
  },
  // Edge specific classes
  {
    selector: "edge.minus-90-loop",
    style: {
      "loop-direction": "-90deg",
    },
  },
  {
    selector: "edge.minus-30-loop",
    style: {
      "loop-direction": "-30deg",
    },
  },
  {
    selector: "edge.30-loop",
    style: {
      "loop-direction": "30deg",
    },
  },
  {
    selector: "edge.90-loop",
    style: {
      "loop-direction": "90deg",
    },
  },
  {
    selector: "edge.horizontal-text",
    style: {
      "text-rotation": "0deg",
    },
  },
  {
    selector: "edge.no-arrows",
    style: {
      "source-arrow-shape": "none",
      "target-arrow-shape": "none",
    },
  },
  {
    selector: "edge.dashed",
    style: {
      "line-style": "dashed",
    },
  },
  {
    selector: "edge.source-arrow-only",
    style: {
      "source-arrow-shape": "triangle",
      "target-arrow-shape": "none",
    },
  },
  // C2M2 entity classes
  ...Array.from(ENTITY_STYLES_MAP.entries()).map(([className, style]) => {
    return {
      selector: `.${className}`,
      style: style as Css.Node,
    };
  }),
];

export const DEFAULT_STYLESHEET: any[] = [
  ...DEFAULT_NODE_SELECTOR_STYLES,
  ...DEFAULT_EDGE_SELECTOR_STYLES,
  ...STYLESHEET_CLASSES,
];

export const PATHWAY_SEARCH_STYLESHEET: any[] = [
  ...DEFAULT_NODE_SELECTOR_STYLES,
  {
    selector: "node",
    style: {
      label: (element: NodeSingular) =>
        `${element.data("displayLabel")}${
          element.data("count") === undefined
            ? ""
            : ` (${element.data("count")})`
        }`,
      opacity: TRANSPARENT_OPACITY,
    },
  },
  {
    selector: "node:active",
    style: {
      "overlay-opacity": 0,
    },
  },
  ...DEFAULT_EDGE_SELECTOR_STYLES,
  {
    selector: "edge",
    style: {
      label: (element: EdgeSingular) =>
        `${element.data("displayLabel")}${
          element.data("count") === undefined
            ? ""
            : ` (${element.data("count")})`
        }`,
      opacity: TRANSPARENT_OPACITY,
    },
  },
  ...STYLESHEET_CLASSES, // Classes must be last so they are not overwritten by selector styles!
  {
    selector: ".path-element",
    style: {
      opacity: SOLID_OPACITY,
      "z-index": HIGH_Z_INDEX,
    },
  },
  {
    selector: "node.prune-candidate",
    style: {
      "border-width": NODE_BORDER_WIDTH,
      "border-color": "red",
    },
  },
  {
    selector: "edge.prune-candidate",
    style: {
      "target-arrow-color": "red",
      "source-arrow-color": "red",
      "line-color": "red",
    },
  },
];

// Neo4j Schema Represented as a Cytoscape Chart:
const TERM_NODE_X_SPACING = 180;
const TERM_NODE_Y_SPACING = 66;
const SCHEMA_EDGE_SPACING = 15;
const SCHEMA_FONT_SIZE = "10";
const SCHEMA_NODE_DIAMETER = 50;
const SCHEMA_NODE_RADIUS = SCHEMA_NODE_DIAMETER / 2;

const ID_NAMESPACE_NODE_ID = "id-namespace-label";
const DCC_NODE_ID = "dcc-label";
const PROJECT_NODE_ID = "project-label";
const COLLECTION_NODE_ID = "collection-label";
const FILE_NODE_ID = "file-label";
const ASSAY_TYPE_NODE_ID = "assay-type-label";
const DATA_TYPE_NODE_ID = "data-type-label";
const FILE_FORMAT_NODE_ID = "file-format-label";
const ANALYSIS_TYPE_NODE_ID = "analysis-type-label";
const SUBJECT_NODE_ID = "subject-label";
const SUBJECT_SEX_NODE_ID = "subject-sex-label";
const SUBJECT_ETHNICITY_NODE_ID = "subject-ethnicity-label";
const SUBJECT_RACE_NODE_ID = "subject-race-label";
const SUBJECT_GRANULARITY_NODE_ID = "subject-granularity-label";
const BIOSAMPLE_NODE_ID = "biosample-label";
const SAMPLE_PREP_METHOD_NODE_ID = "sample-prep-method-label";
const SUBSTANCE_NODE_ID = "substance-label";
const COMPOUND_NODE_ID = "compound-label";
const PROTEIN_NODE_ID = "protein-label";
const NCBI_TAXONOMY_NODE_ID = "ncbi-taxonomy-label";
const GENE_NODE_ID = "gene-label";
const PHENOTYPE_NODE_ID = "phenotype-label";
const DISEASE_NODE_ID = "disease-label";
const ANATOMY_NODE_ID = "anatomy-label";
const ALL_TERM_NODES_NODE_ID = "all-term-nodes";
const ARTIFICIAL_COLLECTION_NODE_ID = "artificial-collection-node";

const DCC_REGISTERED_ID_NAMESPACE_EDGE_ID = "dcc-registered-id-namespace";
const DCC_PRODUCED_PROJECT_EDGE_ID = "dcc-produced-project";
const ID_NAMESPACE_CONTAINS_PROJECT_EDGE_ID = "id-namespace-contains-project";
const ID_NAMESPACE_CONTAINS_COLLECTION_EDGE_ID =
  "id-namespace-contains-collection";
const ID_NAMESPACE_CONTAINS_FILE_EDGE_ID = "id-namespace-contains-file";
const ID_NAMESPACE_CONTAINS_BIOSAMPLE_EDGE_ID =
  "id-namespace-contains-biosample";
const ID_NAMESPACE_CONTAINS_SUBJECT_EDGE_ID = "id-namespace-contains-subject";
const PROJECT_IS_PARENT_OF_PROJECT_EDGE_ID = "project-is-parent-of-project";
const PROJECT_CONTAINS_FILE_EDGE_ID = "project-contains-file";
const PROJECT_CONTAINS_SUBJECT_EDGE_ID = "project-contains-subject";
const PROJECT_CONTAINS_BIOSAMPLE_EDGE_ID = "project-contains-biosample";
const COLLECTION_IS_SUPERSET_OF_COLLECTION_EDGE_ID =
  "collection-is-superset-of-collection";
const COLLECTION_CONTAINS_FILE_EDGE_ID = "collection-contains-file";
const COLLECTION_CONTAINS_BIOSAMPLE_EDGE_ID = "collection-contains-biosample";
const COLLECTION_CONTAINS_SUBJECT_EDGE_ID = "collection-contains-subject";
const COLLECTION_CONTAINS_TERMS_EDGE_ID = "collection-contains-terms";
const COLLECTION_DEFINED_BY_PROJECT_EDGE_ID = "collection-defined-by-project";
const FILE_IS_FILE_FORMAT_EDGE_ID = "file-is-file-format";
const FILE_GENERATED_BY_ASSAY_TYPE_EDGE_ID = "file-generated-by-assay-type";
const FILE_GENERATED_BY_ANALYSIS_TYPE_EDGE_ID =
  "file-generated-by-analysis-type";
const FILE_IS_DATA_TYPE_EDGE_ID = "file-is-data-type";
const FILE_DESCRIBES_SUBJECT_EDGE_ID = "file-describes-subject";
const FILE_DESCRIBES_BIOSAMPLE_EDGE_ID = "file-describes-biosample";
const SUBJECT_IS_GRANULARITY_EDGE_ID = "subject-is-granularity";
const SUBJECT_IS_ETHNICITY_EDGE_ID = "subject-is-ethnicity";
const SUBJECT_IS_RACE_EDGE_ID = "subject-is-race";
const SUBJECT_IS_SEX_EDGE_ID = "subject-is-sex";
const SUBJECT_ASSOCIATED_WITH_TAXONOMY_EDGE_ID =
  "subject-associated-with-taxonomy";
const SUBJECT_ASSOCIATED_WITH_SUBSTANCE_EDGE_ID =
  "subject-associated-with-substance";
const SUBJECT_TESTED_FOR_PHENOTYPE_EDGE_ID = "subject-tested-for-phenotype";
const SUBJECT_TESTED_FOR_DISEASE_EDGE_ID = "subject-tested-for-disease";
const BIOSAMPLE_TESTED_FOR_PHENOTYPE_EDGE_ID = "biosample-tested-for-phenotype";
const BIOSAMPLE_TESTED_FOR_DISEASE_EDGE_ID = "biosample-tested-for-disease";
const BIOSAMPLE_SAMPLED_FROM_ANATOMY_EDGE_ID = "biosample-sampled-from-anatomy";
const BIOSAMPLE_PREPPED_VIA_SAMPLE_PREP_METHOD_EDGE_ID =
  "biosample-prepped-via-sample-prep-method";
const SUBSTANCE_ASSOCIATED_WITH_TAXONOMY_EDGE_ID =
  "substance-associated-with-taxonomy";
const BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_EDGE_ID =
  "biosample-associated-with-substance";
const BIOSAMPLE_ASSOCIATED_WITH_GENE_EDGE_ID = "biosample-associated-with-gene";
const BIOSAMPLE_SAMPLED_FROM_SUBJECT_EDGE_ID = "biosample-sampled-from-subject";
const SUBSTANCE_ASSOCIATED_WITH_COMPOUND_EDGE_ID =
  "substance-associated-with-compound";
const PROTEIN_HAS_SOURCE_TAXONOMY_EDGE_ID = "protein-has-source-taxonomy";
const GENE_HAS_SOURCE_TAXONOMY_EDGE_ID = "gene-has-source-taxonomy";
const GENE_ASSOCIATED_WITH_PHENOTYPE_EDGE_ID = "gene-associated-with-phenotype";

const FILE_POS = { x: 0, y: 0 };
const ID_NAMESPACE_POS = { x: FILE_POS.x, y: -120 };
const DCC_POS = { x: 0, y: -220 };
const COLLECTION_POS = { x: 300, y: 250 };
const PROJECT_POS = { x: -1 * COLLECTION_POS.x, y: COLLECTION_POS.y };
const ANALYSIS_TYPE_POS = { x: 215, y: -38 };
const ASSAY_TYPE_POS = { x: -1 * ANALYSIS_TYPE_POS.x, y: ANALYSIS_TYPE_POS.y };
const FILE_FORMAT_POS = { x: 150, y: -70 };
const DATA_TYPE_POS = { x: -1 * FILE_FORMAT_POS.x, y: FILE_FORMAT_POS.y };
const BIOSAMPLE_POS = { x: 230, y: 500 };
const SUBJECT_POS = { x: -1 * BIOSAMPLE_POS.x, y: BIOSAMPLE_POS.y };
const SUBJECT_ETHNICITY_POS = { x: SUBJECT_POS.x - 175, y: 580 };
const SUBJECT_SEX_POS = {
  x: SUBJECT_POS.x - 100,
  y: SUBJECT_ETHNICITY_POS.y + 32,
};
const SUBJECT_RACE_POS = { x: SUBJECT_POS.x + 100, y: SUBJECT_SEX_POS.y };
const SUBJECT_GRANULARITY_POS = {
  x: SUBJECT_POS.x + 175,
  y: SUBJECT_ETHNICITY_POS.y,
};
const SAMPLE_PREP_METHOD_POS = {
  x: COLLECTION_POS.x,
  y: SUBJECT_SEX_POS.y,
};

const DISEASE_POS = { x: 0, y: COLLECTION_POS.y };
const NCBI_TAXONOMY_POS = { x: 0, y: DISEASE_POS.y - TERM_NODE_Y_SPACING * 3 };
const PROTEIN_POS = { x: DISEASE_POS.x + 180, y: NCBI_TAXONOMY_POS.y };
const GENE_POS = {
  x: DISEASE_POS.x,
  y: DISEASE_POS.y - TERM_NODE_Y_SPACING * 2,
};
const PHENOTYPE_POS = {
  x: DISEASE_POS.x,
  y: DISEASE_POS.y - TERM_NODE_Y_SPACING,
};
const COMPOUND_POS = {
  x: DISEASE_POS.x,
  y: DISEASE_POS.y + TERM_NODE_Y_SPACING,
};
const SUBSTANCE_POS = {
  x: DISEASE_POS.x,
  y: DISEASE_POS.y + TERM_NODE_Y_SPACING * 2,
};
const ANATOMY_POS = {
  x: NCBI_TAXONOMY_POS.x,
  y: DISEASE_POS.y + TERM_NODE_Y_SPACING * 3,
};
const ALL_TERMS_NODE_POS = { x: 450, y: 250 };
const ARTIFICIAL_COLLECTION_NODE_POS = {
  x: -1 * ALL_TERMS_NODE_POS.x,
  y: ALL_TERMS_NODE_POS.y,
};

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

const ID_NAMESPACE_CONTAINS_SUBJECT_SOURCE_DEG = -10;
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

const ID_NAMESPACE_CONTAINS_BIOSAMPLE_SOURCE_DEG = 10;
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

const FILE_IS_DATA_TYPE_SOURCE_DEG = -10;
const FILE_IS_DATA_TYPE_TARGET_DEG = 90;
const FILE_IS_DATA_TYPE_SOURCE_POS = getEdgePoint(
  FILE_POS,
  FILE_IS_DATA_TYPE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const FILE_IS_DATA_TYPE_TARGET_POS = getEdgePoint(
  DATA_TYPE_POS,
  FILE_IS_DATA_TYPE_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const FILE_GENERATED_BY_ASSAY_TYPE_SOURCE_DEG = -20;
const FILE_GENERATED_BY_ASSAY_TYPE_TARGET_DEG = 90;
const FILE_GENERATED_BY_ASSAY_TYPE_SOURCE_POS = getEdgePoint(
  FILE_POS,
  FILE_GENERATED_BY_ASSAY_TYPE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const FILE_GENERATED_BY_ASSAY_TYPE_TARGET_POS = getEdgePoint(
  ASSAY_TYPE_POS,
  FILE_GENERATED_BY_ASSAY_TYPE_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const FILE_IS_FORMAT_SOURCE_DEG = 10;
const FILE_IS_FORMAT_TARGET_DEG = -90;
const FILE_IS_FORMAT_SOURCE_POS = getEdgePoint(
  FILE_POS,
  FILE_IS_FORMAT_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const FILE_IS_FORMAT_TARGET_POS = getEdgePoint(
  FILE_FORMAT_POS,
  FILE_IS_FORMAT_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const FILE_GENERATED_BY_ANALYSIS_TYPE_SOURCE_DEG = 20;
const FILE_GENERATED_BY_ANALYSIS_TYPE_TARGET_DEG = -90;
const FILE_GENERATED_BY_ANALYSIS_TYPE_SOURCE_POS = getEdgePoint(
  FILE_POS,
  FILE_GENERATED_BY_ANALYSIS_TYPE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const FILE_GENERATED_BY_ANALYSIS_TYPE_TARGET_POS = getEdgePoint(
  ANALYSIS_TYPE_POS,
  FILE_GENERATED_BY_ANALYSIS_TYPE_TARGET_DEG,
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

const SUBJECT_IS_ETHNICITY_SOURCE_DEG = -160;
const SUBJECT_IS_ETHNICITY_TARGET_DEG = 90;
const SUBJECT_IS_ETHNICITY_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_IS_ETHNICITY_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const SUBJECT_IS_ETHNICITY_TARGET_POS = getEdgePoint(
  SUBJECT_ETHNICITY_POS,
  SUBJECT_IS_ETHNICITY_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const SUBJECT_IS_SEX_SOURCE_DEG = -170;
const SUBJECT_IS_SEX_TARGET_DEG = 90;
const SUBJECT_IS_SEX_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_IS_SEX_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const SUBJECT_IS_SEX_TARGET_POS = getEdgePoint(
  SUBJECT_SEX_POS,
  SUBJECT_IS_SEX_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const SUBJECT_IS_RACE_SOURCE_DEG = 170;
const SUBJECT_IS_RACE_TARGET_DEG = -90;
const SUBJECT_IS_RACE_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_IS_RACE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const SUBJECT_IS_RACE_TARGET_POS = getEdgePoint(
  SUBJECT_RACE_POS,
  SUBJECT_IS_RACE_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const SUBJECT_IS_GRANULARITY_SOURCE_DEG = 160;
const SUBJECT_IS_GRANULARITY_TARGET_DEG = -90;
const SUBJECT_IS_GRANULARITY_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_IS_GRANULARITY_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const SUBJECT_IS_GRANULARITY_TARGET_POS = getEdgePoint(
  SUBJECT_GRANULARITY_POS,
  SUBJECT_IS_GRANULARITY_TARGET_DEG,
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

const SUBJECT_ASSOCIATED_WITH_SUBSTANCE_SOURCE_DEG = 90;
const SUBJECT_ASSOCIATED_WITH_SUBSTANCE_TARGET_DEG = -90;
const SUBJECT_ASSOCIATED_WITH_SUBSTANCE_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_ASSOCIATED_WITH_SUBSTANCE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS
);
const SUBJECT_ASSOCIATED_WITH_SUBSTANCE_TARGET_POS = getEdgePoint(
  SUBSTANCE_POS,
  SUBJECT_ASSOCIATED_WITH_SUBSTANCE_TARGET_DEG,
  SCHEMA_NODE_RADIUS
);

const BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_SOURCE_DEG = -90;
const BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_TARGET_DEG = 90;
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

const SUBSTANCE_ASSOCIATED_WITH_TAXONOMY_SOURCE_DEG = 225;
const SUBSTANCE_ASSOCIATED_WITH_TAXONOMY_TARGET_DEG = 90;

const SCHEMA_NODES = [
  {
    classes: [NODE_CLASS_MAP.get(ID_NAMESPACE_LABEL) || ""],
    position: ID_NAMESPACE_POS,
    locked: true,
    data: {
      id: ID_NAMESPACE_NODE_ID,
      label: ID_NAMESPACE_LABEL,
      neo4j: {
        labels: [ID_NAMESPACE_LABEL],
        properties: {
          description:
            "A list of identifier namespaces registered by the DCC submitting a C2M2 instance.",
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(DCC_LABEL) || ""],
    position: DCC_POS,
    locked: true,
    data: {
      id: DCC_NODE_ID,
      label: DCC_LABEL,
      neo4j: {
        labels: [DCC_LABEL],
        properties: {
          description:
            "A Common Fund program or data coordinating center (DCC, identified by the project relationship) that produced a C2M2 instance.",
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(PROJECT_LABEL) || ""],
    position: PROJECT_POS,
    locked: true,
    data: {
      id: PROJECT_NODE_ID,
      label: PROJECT_LABEL,
      neo4j: {
        labels: [PROJECT_LABEL],
        properties: {
          description:
            "A node in the C2M2 project hierarchy subdividing all resources described by a DCC's C2M2 metadata.",
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(COLLECTION_LABEL) || ""],
    position: COLLECTION_POS,
    locked: true,
    data: {
      id: COLLECTION_NODE_ID,
      label: COLLECTION_LABEL,
      neo4j: {
        labels: [COLLECTION_LABEL],
        properties: {
          description: "A grouping of C2M2 files, biosamples and/or subjects.",
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(ASSAY_TYPE_LABEL) || ""],
    position: ASSAY_TYPE_POS,
    locked: true,
    data: {
      id: ASSAY_TYPE_NODE_ID,
      label: ASSAY_TYPE_LABEL,
      neo4j: {
        labels: [ASSAY_TYPE_LABEL],
        properties: {
          description:
            "An OBI CV term describing the type of experiment that generated the results summarized by this file.",
          ontology: OBI_LINK,
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(DATA_TYPE_LABEL) || ""],
    position: DATA_TYPE_POS,
    locked: true,
    data: {
      id: DATA_TYPE_NODE_ID,
      label: DATA_TYPE_LABEL,
      neo4j: {
        labels: [DATA_TYPE_LABEL],
        properties: {
          description:
            "An EDAM CV term identifying the type of information stored in this file (e.g. RNA sequence reads).",
          ontology: EDAM_LINK,
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(FILE_FORMAT_LABEL) || ""],
    position: FILE_FORMAT_POS,
    locked: true,
    data: {
      id: FILE_FORMAT_NODE_ID,
      label: FILE_FORMAT_LABEL,
      neo4j: {
        labels: [FILE_FORMAT_LABEL],
        properties: {
          description:
            "An EDAM CV term identifying the digital format of this file (e.g. TSV or FASTQ).",
          ontology: EDAM_LINK,
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(ANALYSIS_TYPE_LABEL) || ""],
    position: ANALYSIS_TYPE_POS,
    locked: true,
    data: {
      id: ANALYSIS_TYPE_NODE_ID,
      label: ANALYSIS_TYPE_LABEL,
      neo4j: {
        labels: [ANALYSIS_TYPE_LABEL],
        properties: {
          description:
            "An OBI CV term describing the type of analytic operation that generated this file.",
          ontology: OBI_LINK,
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(FILE_LABEL) || ""],
    position: FILE_POS,
    locked: true,
    data: {
      id: FILE_NODE_ID,
      label: FILE_LABEL,
      neo4j: {
        labels: [FILE_LABEL],
        properties: {
          description: "A stable digital asset.",
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBJECT_LABEL) || ""],
    position: SUBJECT_POS,
    locked: true,
    data: {
      id: SUBJECT_NODE_ID,
      label: SUBJECT_LABEL,
      neo4j: {
        labels: [SUBJECT_LABEL],
        properties: {
          description:
            "A biological entity from which a C2M2 biosample can be generated.",
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBJECT_SEX_LABEL) || ""],
    position: SUBJECT_SEX_POS,
    locked: true,
    data: {
      id: SUBJECT_SEX_NODE_ID,
      label: SUBJECT_SEX_LABEL,
      neo4j: {
        labels: [SUBJECT_SEX_LABEL],
        properties: {
          description: "A CFDE CV term categorizing the sex of this subject",
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBJECT_ETHNICITY_LABEL) || ""],
    position: SUBJECT_ETHNICITY_POS,
    locked: true,
    data: {
      id: SUBJECT_ETHNICITY_NODE_ID,
      label: SUBJECT_ETHNICITY_LABEL,
      neo4j: {
        labels: [SUBJECT_ETHNICITY_LABEL],
        properties: {
          description:
            "A CFDE CV term categorizing the ethnicity of this subject",
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBJECT_RACE_LABEL) || ""],
    position: SUBJECT_RACE_POS,
    locked: true,
    data: {
      id: SUBJECT_RACE_NODE_ID,
      label: SUBJECT_RACE_LABEL,
      neo4j: {
        labels: [SUBJECT_RACE_LABEL],
        properties: {
          description: "A CFDE CV term categorizing the race of this subject.",
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBJECT_GRANULARITY_LABEL) || ""],
    position: SUBJECT_GRANULARITY_POS,
    locked: true,
    data: {
      id: SUBJECT_GRANULARITY_NODE_ID,
      label: SUBJECT_GRANULARITY_LABEL,
      neo4j: {
        labels: [SUBJECT_GRANULARITY_LABEL],
        properties: {
          description:
            "A CFDE CV term categorizing this subject by multiplicity.",
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(BIOSAMPLE_LABEL) || ""],
    position: BIOSAMPLE_POS,
    locked: true,
    data: {
      id: BIOSAMPLE_NODE_ID,
      label: BIOSAMPLE_LABEL,
      neo4j: {
        labels: [BIOSAMPLE_LABEL],
        properties: {
          description: "A tissue sample or other physical specimen.",
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(SAMPLE_PREP_METHOD_LABEL) || ""],
    position: SAMPLE_PREP_METHOD_POS,
    locked: true,
    data: {
      id: SAMPLE_PREP_METHOD_NODE_ID,
      label: SAMPLE_PREP_METHOD_LABEL,
      neo4j: {
        labels: [SAMPLE_PREP_METHOD_LABEL],
        properties: {
          description: "The preparation method used to produce a biosample.",
          ontology: OBI_LINK,
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBSTANCE_LABEL) || ""],
    position: SUBSTANCE_POS,
    locked: true,
    data: {
      id: SUBSTANCE_NODE_ID,
      label: SUBSTANCE_LABEL,
      neo4j: {
        labels: [SUBSTANCE_LABEL],
        properties: {
          description:
            "A PubChem 'substance' term (specific formulation of chemical materials) directly referenced by a C2M2 submission.",
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(COMPOUND_LABEL) || ""],
    position: COMPOUND_POS,
    locked: true,
    data: {
      id: COMPOUND_NODE_ID,
      label: COMPOUND_LABEL,
      neo4j: {
        labels: [COMPOUND_LABEL],
        properties: {
          description:
            "A (i) GlyTouCan term or (ii) PubChem 'compound' term (normalized chemical structure) referenced by a C2M2 submission; (ii) will include all PubChem 'compound' terms associated with any PubChem 'substance' terms directly referenced in the submission, in addition to any 'compound' terms directly referenced.",
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(PROTEIN_LABEL) || ""],
    position: PROTEIN_POS,
    locked: true,
    data: {
      id: PROTEIN_NODE_ID,
      label: PROTEIN_LABEL,
      neo4j: {
        labels: [PROTEIN_LABEL],
        properties: {
          description:
            "A UniProtKB protein directly referenced by a C2M2 submission.",
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(NCBI_TAXONOMY_LABEL) || ""],
    position: NCBI_TAXONOMY_POS,
    locked: true,
    data: {
      id: NCBI_TAXONOMY_NODE_ID,
      label: NCBI_TAXONOMY_LABEL,
      neo4j: {
        labels: [NCBI_TAXONOMY_LABEL],
        properties: {
          description:
            "A NCBI Taxonomy Database ID identifying taxa used to describe C2M2 subjects.",
          ontology: NCBI_TAXONOMY_LINK,
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(GENE_LABEL) || ""],
    position: GENE_POS,
    locked: true,
    data: {
      id: GENE_NODE_ID,
      label: GENE_LABEL,
      neo4j: {
        labels: [GENE_LABEL],
        properties: {
          description:
            "An Ensembl gene directly referenced by a C2M2 submission.",
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(PHENOTYPE_LABEL) || ""],
    position: PHENOTYPE_POS,
    locked: true,
    data: {
      id: PHENOTYPE_NODE_ID,
      label: PHENOTYPE_LABEL,
      neo4j: {
        labels: [PHENOTYPE_LABEL],
        properties: {
          description:
            "A Human Phenotype Ontology term used to describe phenotypes recorded in assocation with C2M2 subjects.",
          ontology: HPO_LINK,
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(DISEASE_LABEL) || ""],
    position: DISEASE_POS,
    locked: true,
    data: {
      id: DISEASE_NODE_ID,
      label: DISEASE_LABEL,
      neo4j: {
        labels: [DISEASE_LABEL],
        properties: {
          description:
            "A Disease Ontology term used to describe disease recorded in association with C2M2 subjects or biosamples.",
          ontology: DO_LINK,
        },
      },
    },
  },
  {
    classes: [NODE_CLASS_MAP.get(ANATOMY_LABEL) || ""],
    position: ANATOMY_POS,
    locked: true,
    data: {
      id: ANATOMY_NODE_ID,
      label: ANATOMY_LABEL,
      neo4j: {
        labels: [ANATOMY_LABEL],
        properties: {
          description:
            "An UBERON CV term used to locate the origin of a C2M2 biosample within the physiology of its source or host organism.",
          ontology: UBERON_LINK,
        },
      },
    },
  },
  {
    classes: ["all-terms-node", "dashed"],
    position: ALL_TERMS_NODE_POS,
    locked: true,
    data: {
      id: ALL_TERM_NODES_NODE_ID,
      label: "All Term Nodes",
    },
  },
  {
    classes: ["artificial-collection-node", "dashed"],
    position: ARTIFICIAL_COLLECTION_NODE_POS,
    locked: true,
    data: {
      id: ARTIFICIAL_COLLECTION_NODE_ID,
      label: "Collection",
    },
  },
];

const SCHEMA_EDGES = [
  {
    classes: ["admin-relationship", "horizontal-text"],
    data: {
      id: DCC_REGISTERED_ID_NAMESPACE_EDGE_ID,
      source: DCC_NODE_ID,
      target: ID_NAMESPACE_NODE_ID,
      label: REGISTERED_TYPE,
    },
  },
  {
    classes: ["admin-relationship"],
    data: {
      id: ID_NAMESPACE_CONTAINS_PROJECT_EDGE_ID,
      source: ID_NAMESPACE_NODE_ID,
      target: PROJECT_NODE_ID,
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["admin-relationship"],
    data: {
      id: ID_NAMESPACE_CONTAINS_COLLECTION_EDGE_ID,
      source: ID_NAMESPACE_NODE_ID,
      target: COLLECTION_NODE_ID,
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["admin-relationship", "horizontal-text"],
    data: {
      id: ID_NAMESPACE_CONTAINS_FILE_EDGE_ID,
      source: ID_NAMESPACE_NODE_ID,
      target: FILE_NODE_ID,
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["admin-relationship"],
    data: {
      id: ID_NAMESPACE_CONTAINS_BIOSAMPLE_EDGE_ID,
      source: ID_NAMESPACE_NODE_ID,
      target: BIOSAMPLE_NODE_ID,
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["admin-relationship"],
    data: {
      id: ID_NAMESPACE_CONTAINS_SUBJECT_EDGE_ID,
      source: ID_NAMESPACE_NODE_ID,
      target: SUBJECT_NODE_ID,
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["container-relationship"],
    data: {
      id: PROJECT_IS_PARENT_OF_PROJECT_EDGE_ID,
      source: PROJECT_NODE_ID,
      target: PROJECT_NODE_ID,
      label: IS_PARENT_OF_TYPE,
    },
  },
  {
    classes: ["container-relationship"],
    data: {
      id: PROJECT_CONTAINS_SUBJECT_EDGE_ID,
      source: PROJECT_NODE_ID,
      target: SUBJECT_NODE_ID,
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["container-relationship"],
    data: {
      id: PROJECT_CONTAINS_BIOSAMPLE_EDGE_ID,
      source: PROJECT_NODE_ID,
      target: BIOSAMPLE_NODE_ID,
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["container-relationship"],
    data: {
      id: PROJECT_CONTAINS_FILE_EDGE_ID,
      source: PROJECT_NODE_ID,
      target: FILE_NODE_ID,
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["container-relationship"],
    data: {
      id: COLLECTION_IS_SUPERSET_OF_COLLECTION_EDGE_ID,
      source: COLLECTION_NODE_ID,
      target: COLLECTION_NODE_ID,
      label: IS_SUPERSET_OF_TYPE,
    },
  },
  {
    classes: ["container-relationship"],
    data: {
      id: COLLECTION_CONTAINS_FILE_EDGE_ID,
      source: COLLECTION_NODE_ID,
      target: FILE_NODE_ID,
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["container-relationship"],
    data: {
      id: COLLECTION_CONTAINS_BIOSAMPLE_EDGE_ID,
      source: COLLECTION_NODE_ID,
      target: BIOSAMPLE_NODE_ID,
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["container-relationship"],
    data: {
      id: COLLECTION_CONTAINS_SUBJECT_EDGE_ID,
      source: COLLECTION_NODE_ID,
      target: SUBJECT_NODE_ID,
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["container-relationship", "dashed"],
    data: {
      id: COLLECTION_DEFINED_BY_PROJECT_EDGE_ID,
      source: ARTIFICIAL_COLLECTION_NODE_ID,
      target: PROJECT_NODE_ID,
      label: DEFINED_BY_TYPE,
    },
  },
  {
    classes: ["term-relationship", "dashed"],
    data: {
      id: COLLECTION_CONTAINS_TERMS_EDGE_ID,
      source: COLLECTION_NODE_ID,
      target: ALL_TERM_NODES_NODE_ID,
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["file-related-relationship"],
    data: {
      id: FILE_IS_FILE_FORMAT_EDGE_ID,
      source: FILE_NODE_ID,
      target: FILE_FORMAT_NODE_ID,
      label: IS_FILE_FORMAT_TYPE,
    },
  },
  {
    classes: ["file-related-relationship"],
    data: {
      id: FILE_GENERATED_BY_ASSAY_TYPE_EDGE_ID,
      source: FILE_NODE_ID,
      target: ASSAY_TYPE_NODE_ID,
      label: GENERATED_BY_ASSAY_TYPE_TYPE,
    },
  },
  {
    classes: ["file-related-relationship"],
    data: {
      id: FILE_GENERATED_BY_ANALYSIS_TYPE_EDGE_ID,
      source: FILE_NODE_ID,
      target: ANALYSIS_TYPE_NODE_ID,
      label: GENERATED_BY_ANALYSIS_TYPE_TYPE,
    },
  },
  {
    classes: ["file-related-relationship"],
    data: {
      id: FILE_IS_DATA_TYPE_EDGE_ID,
      source: FILE_NODE_ID,
      target: DATA_TYPE_NODE_ID,
      label: IS_DATA_TYPE_TYPE,
    },
  },
  {
    classes: ["file-relationship"],
    data: {
      id: FILE_DESCRIBES_BIOSAMPLE_EDGE_ID,
      source: FILE_NODE_ID,
      target: BIOSAMPLE_NODE_ID,
      label: DESCRIBES_TYPE,
    },
  },
  {
    classes: ["file-relationship"],
    data: {
      id: FILE_DESCRIBES_SUBJECT_EDGE_ID,
      source: FILE_NODE_ID,
      target: SUBJECT_NODE_ID,
      label: DESCRIBES_TYPE,
    },
  },
  {
    classes: ["subject-related-relationship"],
    data: {
      id: SUBJECT_IS_GRANULARITY_EDGE_ID,
      source: SUBJECT_NODE_ID,
      target: SUBJECT_GRANULARITY_NODE_ID,
      label: IS_GRANULARITY_TYPE,
    },
  },
  {
    classes: ["subject-related-relationship"],
    data: {
      id: SUBJECT_IS_ETHNICITY_EDGE_ID,
      source: SUBJECT_NODE_ID,
      target: SUBJECT_ETHNICITY_NODE_ID,
      label: IS_ETHNICITY_TYPE,
    },
  },
  {
    classes: ["subject-related-relationship"],
    data: {
      id: SUBJECT_IS_RACE_EDGE_ID,
      source: SUBJECT_NODE_ID,
      target: SUBJECT_RACE_NODE_ID,
      label: IS_RACE_TYPE,
    },
  },
  {
    classes: ["subject-related-relationship"],
    data: {
      id: SUBJECT_IS_SEX_EDGE_ID,
      source: SUBJECT_NODE_ID,
      target: SUBJECT_SEX_NODE_ID,
      label: IS_SEX_TYPE,
    },
  },
  {
    classes: ["term-relationship", "no-arrows"],
    data: {
      id: SUBJECT_ASSOCIATED_WITH_TAXONOMY_EDGE_ID,
      source: SUBJECT_NODE_ID,
      target: NCBI_TAXONOMY_NODE_ID,
      label: ASSOCIATED_WITH_TYPE,
    },
  },
  {
    classes: ["term-relationship"],
    data: {
      id: SUBJECT_TESTED_FOR_DISEASE_EDGE_ID,
      source: SUBJECT_NODE_ID,
      target: DISEASE_NODE_ID,
      label: TESTED_FOR_TYPE,
    },
  },
  {
    classes: ["term-relationship"],
    data: {
      id: SUBJECT_TESTED_FOR_PHENOTYPE_EDGE_ID,
      source: SUBJECT_NODE_ID,
      target: PHENOTYPE_NODE_ID,
      label: TESTED_FOR_TYPE,
    },
  },
  {
    classes: ["term-relationship", "no-arrows"],
    data: {
      id: BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_EDGE_ID,
      source: BIOSAMPLE_NODE_ID,
      target: SUBSTANCE_NODE_ID,
      label: ASSOCIATED_WITH_TYPE,
    },
  },
  {
    classes: ["term-relationship", "no-arrows"],
    data: {
      id: SUBJECT_ASSOCIATED_WITH_SUBSTANCE_EDGE_ID,
      source: SUBJECT_NODE_ID,
      target: SUBSTANCE_NODE_ID,
      label: ASSOCIATED_WITH_TYPE,
    },
  },
  {
    classes: ["term-relationship", "no-arrows"],
    data: {
      id: BIOSAMPLE_ASSOCIATED_WITH_GENE_EDGE_ID,
      source: BIOSAMPLE_NODE_ID,
      target: GENE_NODE_ID,
      label: ASSOCIATED_WITH_TYPE,
    },
  },
  {
    classes: ["biosample-related-relationship", "horizontal-text"],
    data: {
      id: BIOSAMPLE_PREPPED_VIA_SAMPLE_PREP_METHOD_EDGE_ID,
      source: BIOSAMPLE_NODE_ID,
      target: SAMPLE_PREP_METHOD_NODE_ID,
      label: PREPPED_VIA_TYPE,
    },
  },
  {
    classes: ["term-relationship"],
    data: {
      id: BIOSAMPLE_TESTED_FOR_PHENOTYPE_EDGE_ID,
      source: BIOSAMPLE_NODE_ID,
      target: PHENOTYPE_NODE_ID,
      label: TESTED_FOR_TYPE,
    },
  },
  {
    classes: ["term-relationship"],
    data: {
      id: BIOSAMPLE_TESTED_FOR_DISEASE_EDGE_ID,
      source: BIOSAMPLE_NODE_ID,
      target: DISEASE_NODE_ID,
      label: TESTED_FOR_TYPE,
    },
  },
  {
    classes: ["biosample-relationship"],
    data: {
      id: BIOSAMPLE_SAMPLED_FROM_SUBJECT_EDGE_ID,
      source: BIOSAMPLE_NODE_ID,
      target: SUBJECT_NODE_ID,
      label: SAMPLED_FROM_TYPE,
    },
  },
  {
    classes: ["term-relationship"],
    data: {
      id: BIOSAMPLE_SAMPLED_FROM_ANATOMY_EDGE_ID,
      source: BIOSAMPLE_NODE_ID,
      target: ANATOMY_NODE_ID,
      label: SAMPLED_FROM_TYPE,
    },
  },
  {
    classes: ["term-relationship", "no-arrows", "horizontal-text"],
    data: {
      id: SUBSTANCE_ASSOCIATED_WITH_COMPOUND_EDGE_ID,
      source: SUBSTANCE_NODE_ID,
      target: COMPOUND_NODE_ID,
      label: ASSOCIATED_WITH_TYPE,
    },
  },
  {
    classes: ["term-relationship", "horizontal-text"],
    data: {
      id: PROTEIN_HAS_SOURCE_TAXONOMY_EDGE_ID,
      source: PROTEIN_NODE_ID,
      target: NCBI_TAXONOMY_NODE_ID,
      label: HAS_SOURCE_TYPE,
    },
  },
  {
    classes: ["term-relationship", "horizontal-text"],
    data: {
      id: GENE_HAS_SOURCE_TAXONOMY_EDGE_ID,
      source: GENE_NODE_ID,
      target: NCBI_TAXONOMY_NODE_ID,
      label: HAS_SOURCE_TYPE,
    },
  },
  {
    classes: ["term-relationship", "no-arrows", "horizontal-text"],
    data: {
      id: GENE_ASSOCIATED_WITH_PHENOTYPE_EDGE_ID,
      source: GENE_NODE_ID,
      target: PHENOTYPE_NODE_ID,
      label: ASSOCIATED_WITH_TYPE,
    },
  },
];

const SCHEMA_ADMIN_NODE_ITEM = "Admin Node";
const SCHEMA_CONTAINER_NODE_ITEM = "Container Node";
const SCHEMA_FILE_NODE_ITEM = "File Node";
const SCHEMA_BIOSAMPLE_NODE_ITEM = "Biosample Node";
const SCHEMA_SUBJECT_NODE_ITEM = "Subject Node";
const SCHEMA_TERM_NODE_ITEM = "Term Node";
export const SCHEMA_RELATIONSHIP_ITEM = "Relationship";

export const STYLE_CLASS_TO_LEGEND_KEY_MAP = new Map<string, string>([
  [ADMIN_NODE_CLASS, SCHEMA_ADMIN_NODE_ITEM],
  [CONTAINER_NODE_CLASS, SCHEMA_CONTAINER_NODE_ITEM],
  [FILE_NODE_CLASS, SCHEMA_FILE_NODE_ITEM],
  [SUBJECT_NODE_CLASS, SCHEMA_SUBJECT_NODE_ITEM],
  [BIOSAMPLE_NODE_CLASS, SCHEMA_BIOSAMPLE_NODE_ITEM],
  [TERM_NODE_CLASS, SCHEMA_TERM_NODE_ITEM],
]);

export const SCHEMA_LEGEND = new Map<string, ReactNode>(
  new Map([
    [
      SCHEMA_ADMIN_NODE_ITEM,
      <CircleIcon sx={{ color: ADMIN_NODE_COLOR }} fontSize="small" />,
    ],
    [
      SCHEMA_CONTAINER_NODE_ITEM,
      <CircleIcon sx={{ color: CONTAINER_NODE_COLOR }} fontSize="small" />,
    ],
    [
      SCHEMA_FILE_NODE_ITEM,
      <CircleIcon sx={{ color: FILE_NODE_COLOR }} fontSize="small" />,
    ],
    [
      SCHEMA_SUBJECT_NODE_ITEM,
      <CircleIcon sx={{ color: SUBJECT_NODE_COLOR }} fontSize="small" />,
    ],
    [
      SCHEMA_BIOSAMPLE_NODE_ITEM,
      <CircleIcon sx={{ color: BIOSAMPLE_NODE_COLOR }} fontSize="small" />,
    ],
    [
      SCHEMA_TERM_NODE_ITEM,
      <CircleIcon sx={{ color: TERM_NODE_COLOR }} fontSize="small" />,
    ],
    [SCHEMA_RELATIONSHIP_ITEM, createArrowDividerElement(false)],
  ])
);

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
    selector: "node.artificial-collection-node",
    style: {
      "background-color": "#f2f2f2",
      "border-width": 1,
      "border-color": CONTAINER_NODE_COLOR,
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
    selector: "edge.file-relationship",
    style: {
      color: FILE_NODE_COLOR,
      "line-color": FILE_NODE_COLOR,
      "target-arrow-color": FILE_NODE_COLOR,
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
    selector: "edge.subject-relationship",
    style: {
      color: SUBJECT_NODE_COLOR,
      "line-color": SUBJECT_NODE_COLOR,
      "target-arrow-color": SUBJECT_NODE_COLOR,
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
    selector: "edge.biosample-relationship",
    style: {
      color: BIOSAMPLE_NODE_COLOR,
      "line-color": BIOSAMPLE_NODE_COLOR,
      "target-arrow-color": BIOSAMPLE_NODE_COLOR,
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
    selector: "edge.term-relationship",
    style: {
      color: TERM_NODE_COLOR,
      "line-color": TERM_NODE_COLOR,
      "target-arrow-color": TERM_NODE_COLOR,
    },
  },
  {
    selector: `edge#${DCC_PRODUCED_PROJECT_EDGE_ID}`,
    style: {},
  },
  {
    selector: `edge#${DCC_REGISTERED_ID_NAMESPACE_EDGE_ID}`,
    style: {},
  },
  {
    selector: `edge#${ID_NAMESPACE_CONTAINS_PROJECT_EDGE_ID}`,
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
    selector: `edge#${ID_NAMESPACE_CONTAINS_COLLECTION_EDGE_ID}`,
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
    selector: `edge#${ID_NAMESPACE_CONTAINS_FILE_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(label)",
      "source-text-offset": 10,
    },
  },
  {
    selector: `edge#${ID_NAMESPACE_CONTAINS_BIOSAMPLE_EDGE_ID}`,
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
    selector: `edge#${ID_NAMESPACE_CONTAINS_SUBJECT_EDGE_ID}`,
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
    selector: `edge#${PROJECT_IS_PARENT_OF_PROJECT_EDGE_ID}`,
    style: {
      "loop-direction": "-45deg",
      "loop-sweep": "-45deg",
    },
  },
  {
    selector: `edge#${PROJECT_CONTAINS_FILE_EDGE_ID}`,
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
    selector: `edge#${PROJECT_CONTAINS_SUBJECT_EDGE_ID}`,
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
    selector: `edge#${PROJECT_CONTAINS_BIOSAMPLE_EDGE_ID}`,
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
    selector: `edge#${COLLECTION_IS_SUPERSET_OF_COLLECTION_EDGE_ID}`,
    style: {
      "loop-direction": "45deg",
      "loop-sweep": "-45deg",
    },
  },
  {
    selector: `edge#${COLLECTION_CONTAINS_FILE_EDGE_ID}`,
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
    selector: `edge#${COLLECTION_CONTAINS_BIOSAMPLE_EDGE_ID}`,
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
    selector: `edge#${COLLECTION_CONTAINS_SUBJECT_EDGE_ID}`,
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
    selector: `edge#${COLLECTION_CONTAINS_TERMS_EDGE_ID}`,
    style: {
      label: "data(label)",
    },
  },
  {
    selector: `edge#${COLLECTION_DEFINED_BY_PROJECT_EDGE_ID}`,
    style: {
      label: "data(label)",
    },
  },
  {
    selector: `edge#${FILE_IS_FILE_FORMAT_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(label)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${FILE_IS_FORMAT_SOURCE_DEG}deg`,
      "target-endpoint": `${FILE_IS_FORMAT_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        FILE_IS_FORMAT_SOURCE_POS,
        [
          {
            x: FILE_IS_FORMAT_SOURCE_POS.x,
            y: FILE_IS_FORMAT_TARGET_POS.y,
          },
        ],
        FILE_IS_FORMAT_TARGET_POS,
        [true]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: `edge#${FILE_GENERATED_BY_ASSAY_TYPE_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(label)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${FILE_GENERATED_BY_ASSAY_TYPE_SOURCE_DEG}deg`,
      "target-endpoint": `${FILE_GENERATED_BY_ASSAY_TYPE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        FILE_GENERATED_BY_ASSAY_TYPE_SOURCE_POS,
        [
          {
            x: FILE_GENERATED_BY_ASSAY_TYPE_SOURCE_POS.x,
            y: FILE_GENERATED_BY_ASSAY_TYPE_TARGET_POS.y,
          },
        ],
        FILE_GENERATED_BY_ASSAY_TYPE_TARGET_POS
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: `edge#${FILE_GENERATED_BY_ANALYSIS_TYPE_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(label)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${FILE_GENERATED_BY_ANALYSIS_TYPE_SOURCE_DEG}deg`,
      "target-endpoint": `${FILE_GENERATED_BY_ANALYSIS_TYPE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        FILE_GENERATED_BY_ANALYSIS_TYPE_SOURCE_POS,
        [
          {
            x: FILE_GENERATED_BY_ANALYSIS_TYPE_SOURCE_POS.x,
            y: FILE_GENERATED_BY_ANALYSIS_TYPE_TARGET_POS.y,
          },
        ],
        FILE_GENERATED_BY_ANALYSIS_TYPE_TARGET_POS,
        [true]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: `edge#${FILE_IS_DATA_TYPE_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(label)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${FILE_IS_DATA_TYPE_SOURCE_DEG}deg`,
      "target-endpoint": `${FILE_IS_DATA_TYPE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        FILE_IS_DATA_TYPE_SOURCE_POS,
        [
          {
            x: FILE_IS_DATA_TYPE_SOURCE_POS.x,
            y: FILE_IS_DATA_TYPE_TARGET_POS.y,
          },
        ],
        FILE_IS_DATA_TYPE_TARGET_POS
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: `edge#${FILE_DESCRIBES_SUBJECT_EDGE_ID}`,
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
    selector: `edge#${FILE_DESCRIBES_BIOSAMPLE_EDGE_ID}`,
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
    selector: `edge#${SUBJECT_IS_GRANULARITY_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(label)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${SUBJECT_IS_GRANULARITY_SOURCE_DEG}deg`,
      "target-endpoint": `${SUBJECT_IS_GRANULARITY_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        SUBJECT_IS_GRANULARITY_SOURCE_POS,
        [
          {
            x: SUBJECT_IS_GRANULARITY_SOURCE_POS.x,
            y: SUBJECT_IS_GRANULARITY_TARGET_POS.y,
          },
        ],
        SUBJECT_IS_GRANULARITY_TARGET_POS
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: `edge#${SUBJECT_IS_ETHNICITY_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(label)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${SUBJECT_IS_ETHNICITY_SOURCE_DEG}deg`,
      "target-endpoint": `${SUBJECT_IS_ETHNICITY_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        SUBJECT_IS_ETHNICITY_SOURCE_POS,
        [
          {
            x: SUBJECT_IS_ETHNICITY_SOURCE_POS.x,
            y: SUBJECT_IS_ETHNICITY_TARGET_POS.y,
          },
        ],
        SUBJECT_IS_ETHNICITY_TARGET_POS,
        [true]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: `edge#${SUBJECT_IS_RACE_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(label)",
      "target-text-offset": 35,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${SUBJECT_IS_RACE_SOURCE_DEG}deg`,
      "target-endpoint": `${SUBJECT_IS_RACE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        SUBJECT_IS_RACE_SOURCE_POS,
        [
          {
            x: SUBJECT_IS_RACE_SOURCE_POS.x,
            y: SUBJECT_IS_RACE_TARGET_POS.y,
          },
        ],
        SUBJECT_IS_RACE_TARGET_POS
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: `edge#${SUBJECT_IS_SEX_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(label)",
      "target-text-offset": 35,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${SUBJECT_IS_SEX_SOURCE_DEG}deg`,
      "target-endpoint": `${SUBJECT_IS_SEX_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        SUBJECT_IS_SEX_SOURCE_POS,
        [
          {
            x: SUBJECT_IS_SEX_SOURCE_POS.x,
            y: SUBJECT_IS_SEX_TARGET_POS.y,
          },
        ],
        SUBJECT_IS_SEX_TARGET_POS,
        [true]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: `edge#${SUBJECT_ASSOCIATED_WITH_TAXONOMY_EDGE_ID}`,
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
            x: -1 * TERM_NODE_X_SPACING,
            y: SUBJECT_ASSOCIATED_WITH_TAXONOMY_SOURCE_POS.y,
          },
          {
            x: -1 * TERM_NODE_X_SPACING,
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
    selector: `edge#${SUBJECT_ASSOCIATED_WITH_SUBSTANCE_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(label)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": "endpoints",
      "source-endpoint": `${SUBJECT_ASSOCIATED_WITH_SUBSTANCE_SOURCE_DEG}deg`,
      "target-endpoint": `${SUBJECT_ASSOCIATED_WITH_SUBSTANCE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        SUBJECT_ASSOCIATED_WITH_SUBSTANCE_SOURCE_POS,
        [
          {
            x: -1 * TERM_NODE_X_SPACING,
            y: SUBJECT_ASSOCIATED_WITH_SUBSTANCE_SOURCE_POS.y,
          },
          {
            x: -1 * TERM_NODE_X_SPACING,
            y: SUBJECT_ASSOCIATED_WITH_SUBSTANCE_TARGET_POS.y,
          },
        ],
        SUBJECT_ASSOCIATED_WITH_SUBSTANCE_TARGET_POS,
        [false, true]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: `edge#${SUBJECT_TESTED_FOR_PHENOTYPE_EDGE_ID}`,
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
            x: -1 * TERM_NODE_X_SPACING,
            y: SUBJECT_TESTED_FOR_PHENOTYPE_SOURCE_POS.y,
          },
          {
            x: -1 * TERM_NODE_X_SPACING,
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
    selector: `edge#${SUBJECT_TESTED_FOR_DISEASE_EDGE_ID}`,
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
            x: -1 * TERM_NODE_X_SPACING,
            y: SUBJECT_TESTED_FOR_DISEASE_SOURCE_POS.y,
          },
          {
            x: -1 * TERM_NODE_X_SPACING,
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
    selector: `edge#${BIOSAMPLE_TESTED_FOR_PHENOTYPE_EDGE_ID}`,
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
            x: TERM_NODE_X_SPACING,
            y: BIOSAMPLE_TESTED_FOR_PHENOTYPE_SOURCE_POS.y,
          },
          {
            x: TERM_NODE_X_SPACING,
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
    selector: `edge#${BIOSAMPLE_TESTED_FOR_DISEASE_EDGE_ID}`,
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
          {
            x: TERM_NODE_X_SPACING,
            y: BIOSAMPLE_TESTED_FOR_DISEASE_SOURCE_POS.y,
          },
          {
            x: TERM_NODE_X_SPACING,
            y: BIOSAMPLE_TESTED_FOR_DISEASE_TARGET_POS.y,
          },
        ],
        BIOSAMPLE_TESTED_FOR_DISEASE_TARGET_POS,
        [true, false]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: `edge#${BIOSAMPLE_SAMPLED_FROM_ANATOMY_EDGE_ID}`,
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
            x: TERM_NODE_X_SPACING,
            y: BIOSAMPLE_SAMPLED_FROM_ANATOMY_SOURCE_POS.y,
          },
          {
            x: TERM_NODE_X_SPACING,
            y: BIOSAMPLE_SAMPLED_FROM_ANATOMY_TARGET_POS.y,
          },
        ],
        BIOSAMPLE_SAMPLED_FROM_ANATOMY_TARGET_POS,
        [true, false]
      ),
    },
  },
  {
    selector: `edge#${BIOSAMPLE_PREPPED_VIA_SAMPLE_PREP_METHOD_EDGE_ID}`,
    style: {},
  },
  {
    selector: `edge#${SUBSTANCE_ASSOCIATED_WITH_TAXONOMY_EDGE_ID}`,
    style: {
      "source-endpoint": `${SUBSTANCE_ASSOCIATED_WITH_TAXONOMY_SOURCE_DEG}deg`,
      "target-endpoint": `${SUBSTANCE_ASSOCIATED_WITH_TAXONOMY_TARGET_DEG}deg`,
    },
  },
  {
    selector: `edge#${BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_EDGE_ID}`,
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
            x: TERM_NODE_X_SPACING,
            y: BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_SOURCE_POS.y,
          },
          {
            x: TERM_NODE_X_SPACING,
            y: BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_TARGET_POS.y,
          },
        ],
        BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_TARGET_POS,
        [true, false]
      ),
      "segment-radii": 20,
    },
  },
  {
    selector: `edge#${BIOSAMPLE_ASSOCIATED_WITH_GENE_EDGE_ID}`,
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
            x: TERM_NODE_X_SPACING,
            y: BIOSAMPLE_ASSOCIATED_WITH_GENE_SOURCE_POS.y,
          },
          {
            x: TERM_NODE_X_SPACING,
            y: BIOSAMPLE_ASSOCIATED_WITH_GENE_TARGET_POS.y,
          },
        ],
        BIOSAMPLE_ASSOCIATED_WITH_GENE_TARGET_POS,
        [true, false]
      ),
    },
  },
  {
    selector: `edge#${BIOSAMPLE_SAMPLED_FROM_SUBJECT_EDGE_ID}`,
    style: {},
  },
  {
    selector: `edge#${SUBSTANCE_ASSOCIATED_WITH_COMPOUND_EDGE_ID}`,
    style: {},
  },
  {
    selector: `edge#${PROTEIN_HAS_SOURCE_TAXONOMY_EDGE_ID}`,
    style: {},
  },
  {
    selector: `edge#${GENE_HAS_SOURCE_TAXONOMY_EDGE_ID}`,
    style: {},
  },
  {
    selector: `edge#${GENE_ASSOCIATED_WITH_PHENOTYPE_EDGE_ID}`,
    style: {},
  },
  {
    selector: "node.path-element",
    style: {
      "border-color": PATH_COLOR,
      "border-width": NODE_BORDER_WIDTH,
      opacity: SOLID_OPACITY,
    },
  },
  {
    selector: "edge.path-element",
    style: {
      "line-color": PATH_COLOR,
      "target-arrow-color": PATH_COLOR,
      opacity: SOLID_OPACITY,
    },
  },
];

export const SCHEMA_LAYOUT = {
  name: "preset",
};
