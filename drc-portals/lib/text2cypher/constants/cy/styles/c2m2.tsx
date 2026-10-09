import { Css } from "cytoscape";

import c2m2Schema from "@/lib/text2cypher/neo4j/schemas/c2m2";
import type {
  SchemaNodeClassMap,
  SchemaDisplayPropertyMap,
  SchemaCytoscapeStylesheet,
  SchemaEntityStyleMap,
} from "@/lib/text2cypher/schema/types";

// Entity class style names
export const ADMIN_NODE_CLASS = "admin-node";
export const CONTAINER_NODE_CLASS = "container-node";
export const FILE_NODE_CLASS = "file-node";
export const FILE_RELATED_NODE_CLASS = "file-related-node";
export const BIOSAMPLE_NODE_CLASS = "biosample-node";
export const BIOSAMPLE_RELATED_NODE_CLASS = "biosample-related-node";
export const SUBJECT_NODE_CLASS = "subject-node";
export const SUBJECT_RELATED_NODE_CLASS = "subject-related-node";
export const TERM_NODE_CLASS = "term-node";

// Entity labels
export const ADMIN_NODE_LABEL = "Admin Node";
export const CONTAINER_NODE_LABEL = "Container Node";
export const FILE_NODE_LABEL = "File Node";
export const FILE_RELATED_NODE_LABEL = "File Related Node";
export const BIOSAMPLE_NODE_LABEL = "Biosample Node";
export const BIOSAMPLE_RELATED_NODE_LABEL = "Biosample Related Node";
export const SUBJECT_NODE_LABEL = "Subject Node";
export const SUBJECT_RELATED_NODE_LABEL = "Subject Related Node";
export const TERM_NODE_LABEL = "Term Node";

// Entity styles
export const ADMIN_NODE_COLOR = "#c78100";
export const CONTAINER_NODE_COLOR = "#4c8eda";
export const FILE_NODE_COLOR = "#f16565";
export const SUBJECT_NODE_COLOR = "#da6c93";
export const BIOSAMPLE_NODE_COLOR = "#a47ecd";
export const TERM_NODE_COLOR = "#569480";
export const FILE_RELATED_NODE_COLOR = "#209cbc";
export const SUBJECT_RELATED_NODE_COLOR = "#b28b5c";
export const BIOSAMPLE_RELATED_NODE_COLOR = "#4aa553";

// Entity text styles
export const ADMIN_TEXT_COLOR = "#000";
export const CONTAINER_TEXT_COLOR = "#000";
export const FILE_TEXT_COLOR = "#000";
export const SUBJECT_TEXT_COLOR = "#000";
export const BIOSAMPLE_TEXT_COLOR = "#000";
export const TERM_TEXT_COLOR = "#000";
export const FILE_RELATED_TEXT_COLOR = TERM_TEXT_COLOR;
export const SUBJECT_RELATED_TEXT_COLOR = TERM_TEXT_COLOR;
export const BIOSAMPLE_RELATED_TEXT_COLOR = TERM_TEXT_COLOR;

// Map of node label to appropriate color
const NODE_CLASS_MAP: SchemaNodeClassMap = new Map([
  ...c2m2Schema.ADMINS.map((label): [string, string] => [
    label,
    ADMIN_NODE_CLASS,
  ]),
  ...c2m2Schema.CONTAINERS.map((label): [string, string] => [
    label,
    CONTAINER_NODE_CLASS,
  ]),
  [c2m2Schema.FILE, FILE_NODE_CLASS],
  ...c2m2Schema.FILE_RELATEDS.map((label): [string, string] => [
    label,
    FILE_RELATED_NODE_CLASS,
  ]),
  [c2m2Schema.SUBJECT, SUBJECT_NODE_CLASS],
  ...c2m2Schema.SUBJECT_RELATEDS.map((label): [string, string] => [
    label,
    SUBJECT_RELATED_NODE_CLASS,
  ]),
  [c2m2Schema.BIOSAMPLE, BIOSAMPLE_NODE_CLASS],
  ...c2m2Schema.BIOSAMPLE_RELATEDS.map((label): [string, string] => [
    label,
    BIOSAMPLE_RELATED_NODE_CLASS,
  ]),
  ...c2m2Schema.TERMS.map((label): [string, string] => [
    label,
    TERM_NODE_CLASS,
  ]),
]);

// Map of node label to the appropriate representation string
const NODE_DISPLAY_PROPERTY_MAP: SchemaDisplayPropertyMap = new Map([
  [c2m2Schema.DCC, "name"],
  [c2m2Schema.ID_NAMESPACE, "name"],
  [c2m2Schema.COLLECTION, "name"],
  [c2m2Schema.PROJECT, "name"],
  [c2m2Schema.FILE, "local_id"],
  [c2m2Schema.SUBJECT, "local_id"],
  [c2m2Schema.BIOSAMPLE, "local_id"],
  [c2m2Schema.ANATOMY, "name"],
  [c2m2Schema.BIOFLUID, "name"],
  [c2m2Schema.COMPOUND, "name"],
  [c2m2Schema.DISEASE, "name"],
  [c2m2Schema.GENE, "name"],
  [c2m2Schema.NCBI_TAXONOMY, "name"],
  [c2m2Schema.PHENOTYPE, "name"],
  [c2m2Schema.PROTEIN, "name"],
  [c2m2Schema.SUBSTANCE, "name"],
  [c2m2Schema.ANALYSIS_TYPE, "name"],
  [c2m2Schema.ASSAY_TYPE, "name"],
  [c2m2Schema.DATA_TYPE, "name"],
  [c2m2Schema.FILE_FORMAT, "name"],
  [c2m2Schema.SUBJECT_ETHNICITY, "name"],
  [c2m2Schema.SUBJECT_RACE, "name"],
  [c2m2Schema.SUBJECT_GRANULARITY, "name"],
  [c2m2Schema.SUBJECT_SEX, "name"],
  [c2m2Schema.SAMPLE_PREP_METHOD, "name"],
]);

// Map of node class name to appropriate styles
const ENTITY_STYLES_MAP: SchemaEntityStyleMap = new Map([
  [
    ADMIN_NODE_CLASS,
    {
      color: ADMIN_TEXT_COLOR,
      backgroundColor: ADMIN_NODE_COLOR,
    },
  ],
  [
    CONTAINER_NODE_CLASS,
    {
      color: CONTAINER_TEXT_COLOR,
      backgroundColor: CONTAINER_NODE_COLOR,
    },
  ],
  [
    FILE_NODE_CLASS,
    {
      color: FILE_TEXT_COLOR,
      backgroundColor: FILE_NODE_COLOR,
    },
  ],
  [
    FILE_RELATED_NODE_CLASS,
    {
      color: FILE_RELATED_TEXT_COLOR,
      backgroundColor: FILE_RELATED_NODE_COLOR,
    },
  ],
  [
    SUBJECT_NODE_CLASS,
    {
      color: SUBJECT_TEXT_COLOR,
      backgroundColor: SUBJECT_NODE_COLOR,
    },
  ],
  [
    SUBJECT_RELATED_NODE_CLASS,
    {
      color: SUBJECT_RELATED_TEXT_COLOR,
      backgroundColor: SUBJECT_RELATED_NODE_COLOR,
    },
  ],
  [
    BIOSAMPLE_NODE_CLASS,
    {
      color: BIOSAMPLE_TEXT_COLOR,
      backgroundColor: BIOSAMPLE_NODE_COLOR,
    },
  ],
  [
    BIOSAMPLE_RELATED_NODE_CLASS,
    {
      color: BIOSAMPLE_RELATED_TEXT_COLOR,
      backgroundColor: BIOSAMPLE_RELATED_NODE_COLOR,
    },
  ],
  [
    TERM_NODE_CLASS,
    {
      color: TERM_TEXT_COLOR,
      backgroundColor: TERM_NODE_COLOR,
    },
  ],
]);

const ENTITY_STYLESHEET_CLASSES: SchemaCytoscapeStylesheet = [
  ...Array.from(ENTITY_STYLES_MAP.entries()).map(([className, style]) => {
    return {
      selector: `.${className}`,
      style: style as Css.Node,
    };
  }),
];

const c2m2CytoscapeStyles = {
  ENTITY_STYLESHEET_CLASSES,
  ENTITY_STYLES_MAP,
  NODE_CLASS_MAP,
  NODE_DISPLAY_PROPERTY_MAP,
};

export default c2m2CytoscapeStyles;
