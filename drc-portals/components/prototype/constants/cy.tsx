import {
  Paper,
  Tooltip,
  TooltipProps,
  styled,
  tooltipClasses,
} from "@mui/material";
import { Css, Stylesheet } from "cytoscape";

import { ColaLayoutOptions } from "../interfaces/cy";

import { ENTITY_STYLES_MAP, NODE_CLASS_MAP } from "./shared";
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
  PROTEIN_LABEL,
  REFERENCES_TYPE,
  SAMPLED_FROM_TYPE,
  SAMPLE_PREP_METHOD_LABEL,
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
export const ChartTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "transparent",
  },
}));

// Default node properties
export const NODE_FONT_SIZE = "14px";
export const NODE_FONT_FAMILY = "arial";
export const NODE_DIAMETER = 125;

// Default edge properties
export const EDGE_COLOR = "#797979";

// Other Properties
export const MAX_NODE_LINES = 3;
export const MAX_NODE_LABEL_WIDTH = 100;
export const MIN_ZOOMED_FONT_SIZE = 8;

export const DEFAULT_LAYOUT: ColaLayoutOptions = {
  name: "cola",
  infinite: true,
  fit: false,
  animate: true,
  maxSimulationTime: 40000,
  edgeLength: 350,
  nodeSpacing: () => 1,
};

export const DEFAULT_STYLESHEET: Stylesheet[] = [
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
      color: "#fff",
      "font-family": NODE_FONT_FAMILY,
      "font-size": NODE_FONT_SIZE,
      "min-zoomed-font-size": MIN_ZOOMED_FONT_SIZE,
      "text-halign": "center",
      "text-valign": "center",
      "text-max-width": `${MAX_NODE_LABEL_WIDTH}px`,
      "text-outline-color": "#000",
      "text-outline-opacity": 1,
      "text-outline-width": 0.5,
      "text-wrap": "wrap",
    },
  },
  {
    selector: "node:selected",
    style: {
      "border-color": "#336699",
      "border-width": 5,
    },
  },
  {
    selector: "node:active",
    style: {
      // @ts-ignore
      "overlay-shape": "ellipse", // Seems like the @types module hasn't been updated to reflect the current docs, see: https://js.cytoscape.org/#style/overlay
    },
  },
  {
    selector: "edge",
    style: {
      "curve-style": "bezier",
      "target-arrow-shape": "triangle",
      "text-rotation": "autorotate",
    },
  },
  {
    selector: "edge[label]",
    style: {
      label: "data(label)",
      "font-size": "10",
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
  ...Array.from(ENTITY_STYLES_MAP.entries()).map(([className, style]) => {
    return {
      selector: `.${className}`,
      style: style as Css.Node,
    };
  }),
];

// Neo4j Schema Represented as a Cytoscape Chart:

const CONTAINER_X = 265;
const CONTAINER_Y = -260;
const CORE_X = 385;
const CORE_Y = 100;
const CORE_CHILD_X = 535;
const SIBLING_Y_OFFSET = 60;
const FIRST_ROW_TERMS_X = 180;
const FIRST_ROW_TERMS_Y = 165;
const SECOND_ROW_TERMS_X = 90;
const SECOND_ROW_TERMS_Y = 250;
const THIRD_ROW_TERMS_Y = 350;
const FOURTH_ROW_TERMS_Y = 510;
const FIFTH_ROW_TERMS_Y = 675;

const SCHEMA_FONT_SIZE = "10";

export const SCHEMA_ELEMENTS = [
  {
    classes: [NODE_CLASS_MAP.get(ID_NAMESPACE_LABEL) || ""],
    position: { x: 0, y: -25 },
    data: { id: "1", label: ID_NAMESPACE_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(DCC_LABEL) || ""],
    position: { x: -340, y: -380 },
    data: { id: "2", label: DCC_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(PROJECT_LABEL) || ""],
    position: { x: -1 * CONTAINER_X, y: CONTAINER_Y },
    data: { id: "3", label: PROJECT_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(COLLECTION_LABEL) || ""],
    position: { x: CONTAINER_X, y: CONTAINER_Y },
    data: { id: "4", label: COLLECTION_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(ASSAY_TYPE_LABEL) || ""],
    position: { x: -1 * CORE_CHILD_X, y: CORE_Y - SIBLING_Y_OFFSET * 3 },
    data: { id: "5", label: ASSAY_TYPE_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(DATA_TYPE_LABEL) || ""],
    position: { x: -1 * CORE_CHILD_X, y: CORE_Y - SIBLING_Y_OFFSET },
    data: { id: "6", label: DATA_TYPE_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(FILE_FORMAT_LABEL) || ""],
    position: { x: -1 * CORE_CHILD_X, y: CORE_Y + SIBLING_Y_OFFSET },
    data: { id: "7", label: FILE_FORMAT_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(ANALYSIS_TYPE_LABEL) || ""],
    position: { x: -1 * CORE_CHILD_X, y: CORE_Y + SIBLING_Y_OFFSET * 3 },
    data: { id: "8", label: ANALYSIS_TYPE_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(FILE_LABEL) || ""],
    position: { x: -1 * CORE_X, y: CORE_Y },
    data: { id: "9", label: FILE_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBJECT_LABEL) || ""],
    position: { x: CORE_X, y: CORE_Y },
    data: { id: "10", label: SUBJECT_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBJECT_SEX_LABEL) || ""],
    position: { x: CORE_CHILD_X, y: CORE_Y - SIBLING_Y_OFFSET * 3 },
    data: { id: "11", label: SUBJECT_SEX_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBJECT_ETHNICITY_LABEL) || ""],
    position: { x: CORE_CHILD_X, y: CORE_Y - SIBLING_Y_OFFSET },
    data: { id: "12", label: SUBJECT_ETHNICITY_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBJECT_RACE_LABEL) || ""],
    position: { x: CORE_CHILD_X, y: CORE_Y + SIBLING_Y_OFFSET },
    data: { id: "13", label: SUBJECT_RACE_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBJECT_GRANULARITY_LABEL) || ""],
    position: { x: CORE_CHILD_X, y: CORE_Y + SIBLING_Y_OFFSET * 3 },
    data: { id: "14", label: SUBJECT_GRANULARITY_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(BIOSAMPLE_LABEL) || ""],
    position: { x: 0, y: 150 },
    data: { id: "15", label: BIOSAMPLE_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(ANATOMY_LABEL) || ""],
    position: { x: -1 * FIRST_ROW_TERMS_X, y: FIRST_ROW_TERMS_Y },
    data: { id: "16", label: ANATOMY_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(PHENOTYPE_LABEL) || ""],
    position: { x: FIRST_ROW_TERMS_X, y: FIRST_ROW_TERMS_Y },
    data: { id: "17", label: PHENOTYPE_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(SAMPLE_PREP_METHOD_LABEL) || ""],
    position: { x: -1 * SECOND_ROW_TERMS_X, y: SECOND_ROW_TERMS_Y },
    data: { id: "18", label: SAMPLE_PREP_METHOD_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(DISEASE_LABEL) || ""],
    position: { x: SECOND_ROW_TERMS_X, y: SECOND_ROW_TERMS_Y },
    data: { id: "19", label: DISEASE_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(COMPOUND_LABEL) || ""],
    position: { x: 0, y: THIRD_ROW_TERMS_Y },
    data: { id: "20", label: COMPOUND_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(GENE_LABEL) || ""],
    position: { x: -192, y: FOURTH_ROW_TERMS_Y },
    data: { id: "21", label: GENE_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(SUBSTANCE_LABEL) || ""],
    position: { x: 0, y: FOURTH_ROW_TERMS_Y },
    data: { id: "22", label: SUBSTANCE_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(PROTEIN_LABEL) || ""],
    position: { x: -237, y: 590 },
    data: { id: "23", label: PROTEIN_LABEL },
  },
  {
    classes: [NODE_CLASS_MAP.get(NCBI_TAXONOMY_LABEL) || ""],
    position: { x: 0, y: FIFTH_ROW_TERMS_Y },
    data: { id: "24", label: NCBI_TAXONOMY_LABEL },
  },
  {
    data: {
      id: "100",
      source: "9",
      target: "7",
      label: IS_FILE_FORMAT_TYPE,
    },
  },
  {
    data: {
      id: "101",
      source: "9",
      target: "5",
      label: GENERATED_BY_ASSAY_TYPE_TYPE,
    },
  },
  {
    data: {
      id: "102",
      source: "10",
      target: "14",
      label: IS_GRANULARITY_TYPE,
    },
  },
  {
    data: {
      id: "103",
      source: "10",
      target: "12",
      label: IS_ETHNICITY_TYPE,
    },
  },
  {
    data: {
      id: "104",
      source: "22",
      target: "24",
      label: ASSOCIATED_WITH_TYPE,
    },
  },
  {
    data: {
      id: "105",
      source: "22",
      target: "20",
      label: ASSOCIATED_WITH_TYPE,
    },
  },
  {
    data: {
      id: "106",
      source: "10",
      target: "24",
      label: ASSOCIATED_WITH_TYPE,
    },
  },
  {
    data: {
      id: "107",
      source: "10",
      target: "20",
      label: ASSOCIATED_WITH_TYPE,
    },
  },
  {
    classes: ["minus-30-loop-edge"],
    data: {
      id: "109",
      source: "4",
      target: "4",
      label: CONTAINS_TYPE,
    },
  },
  {
    data: {
      id: "110",
      source: "1",
      target: "4",
      label: CONTAINS_TYPE,
    },
  },
  {
    data: {
      id: "111",
      source: "4",
      target: "9",
      label: CONTAINS_TYPE,
    },
  },
  {
    data: {
      id: "112",
      source: "1",
      target: "9",
      label: CONTAINS_TYPE,
    },
  },
  {
    data: {
      id: "113",
      source: "1",
      target: "15",
      label: CONTAINS_TYPE,
    },
  },
  {
    data: {
      id: "114",
      source: "3",
      target: "10",
      label: CONTAINS_TYPE,
    },
  },
  {
    data: {
      id: "115",
      source: "1",
      target: "3",
      label: CONTAINS_TYPE,
    },
  },
  {
    classes: ["30-loop-edge"],
    data: {
      id: "116",
      source: "3",
      target: "3",
      label: CONTAINS_TYPE,
    },
  },
  {
    data: {
      id: "117",
      source: "3",
      target: "15",
      label: CONTAINS_TYPE,
    },
  },
  {
    data: {
      id: "118",
      source: "3",
      target: "9",
      label: CONTAINS_TYPE,
    },
  },
  {
    data: {
      id: "119",
      source: "4",
      target: "15",
      label: CONTAINS_TYPE,
    },
  },
  {
    data: {
      id: "120",
      source: "4",
      target: "10",
      label: CONTAINS_TYPE,
    },
  },
  {
    data: {
      id: "121",
      source: "1",
      target: "10",
      label: CONTAINS_TYPE,
    },
  },
  {
    data: {
      id: "122",
      source: "3",
      target: "4",
      label: CONTAINS_TYPE,
    },
  },
  {
    data: {
      id: "123",
      source: "4",
      target: "3",
      label: CONTAINS_TYPE,
    },
  },
  {
    data: {
      id: "124",
      source: "10",
      target: "13",
      label: IS_RACE_TYPE,
    },
  },
  {
    classes: ["90-loop-edge"],
    data: {
      id: "125",
      source: "4",
      target: "4",
      label: IS_SUPERSET_OF_TYPE,
    },
  },
  {
    data: {
      id: "126",
      source: "9",
      target: "8",
      label: GENERATED_BY_ANALYSIS_TYPE_TYPE,
    },
  },
  {
    data: {
      id: "127",
      source: "2",
      target: "3",
      label: PRODUCED_TYPE,
    },
  },
  {
    data: {
      id: "128",
      source: "9",
      target: "15",
      label: DESCRIBES_TYPE,
    },
  },
  {
    data: {
      id: "129",
      source: "9",
      target: "10",
      label: DESCRIBES_TYPE,
    },
  },
  {
    data: {
      id: "130",
      source: "15",
      target: "18",
      label: PREPPED_VIA_TYPE,
    },
  },
  {
    classes: ["minus-90-loop-edge"],
    data: {
      id: "131",
      source: "3",
      target: "3",
      label: IS_PARENT_OF_TYPE,
    },
  },
  {
    data: {
      id: "132",
      source: "9",
      target: "6",
      label: IS_DATA_TYPE_TYPE,
    },
  },
  {
    data: {
      id: "133",
      source: "15",
      target: "17",
      label: TESTED_FOR_TYPE,
    },
  },
  {
    data: {
      id: "134",
      source: "10",
      target: "19",
      label: TESTED_FOR_TYPE,
    },
  },
  {
    data: {
      id: "135",
      source: "15",
      target: "19",
      label: TESTED_FOR_TYPE,
    },
  },
  {
    data: {
      id: "136",
      source: "10",
      target: "17",
      label: TESTED_FOR_TYPE,
    },
  },
  {
    data: {
      id: "137",
      source: "23",
      target: "24",
      label: HAS_SOURCE_TYPE,
    },
  },
  {
    data: {
      id: "138",
      source: "21",
      target: "24",
      label: HAS_SOURCE_TYPE,
    },
  },
  {
    data: {
      id: "139",
      source: "10",
      target: "11",
      label: IS_SEX_TYPE,
    },
  },
  {
    data: {
      id: "140",
      source: "9",
      target: "20",
      label: REFERENCES_TYPE,
    },
  },
  {
    data: {
      id: "141",
      source: "9",
      target: "24",
      label: REFERENCES_TYPE,
    },
  },
  {
    data: {
      id: "142",
      source: "9",
      target: "23",
      label: REFERENCES_TYPE,
    },
  },
  {
    data: {
      id: "143",
      source: "9",
      target: "22",
      label: REFERENCES_TYPE,
    },
  },
  {
    data: {
      id: "144",
      source: "9",
      target: "21",
      label: REFERENCES_TYPE,
    },
  },
  {
    data: {
      id: "145",
      source: "9",
      target: "16",
      label: REFERENCES_TYPE,
    },
  },
  {
    data: {
      id: "146",
      source: "15",
      target: "10",
      label: SAMPLED_FROM_TYPE,
    },
  },
  {
    data: {
      id: "147",
      source: "15",
      target: "16",
      label: SAMPLED_FROM_TYPE,
    },
  },
];

export const SCHEMA_STYLESHEET: Stylesheet[] = [
  ...DEFAULT_STYLESHEET,
  {
    selector: "node",
    style: {
      label: "data(label)",
      height: 50,
      width: 50,
    },
  },
  {
    selector: "node[label]",
    style: {
      label: "data(label)",
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
    selector: "edge[label]",
    style: {
      label: "data(label)",
      "font-size": SCHEMA_FONT_SIZE,
    },
  },
];

export const SCHEMA_LAYOUT = {
  name: "preset",
};
