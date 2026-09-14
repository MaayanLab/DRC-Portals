import { Css } from "cytoscape";

import mwSchema from "@/lib/text2cypher/neo4j/schemas/mw";
import type {
  SchemaNodeClassMap,
  SchemaDisplayPropertyMap,
  SchemaCytoscapeStylesheet,
  SchemaEntityStyleMap,
} from "@/lib/text2cypher/schema/types";

// Entity class style names
export const PROJECT_NODE_CLASS = "project-node";
export const STUDY_NODE_CLASS = "study-node";
export const PERSON_NODE_CLASS = "person-node";
export const SUBJECT_NODE_CLASS = "subject-node";
export const ANALYSIS_NODE_CLASS = "analysis-node";
export const ANALYSIS_RELATED_NODE_CLASS = "analysis-related-node";
export const METADATA_RELATED_NODE_CLASS = "metadata-related-node";
export const SAMPLE_NODE_CLASS = "sample-node";
export const SAMPLE_RELATED_NODE_CLASS = "sample-related-node";
export const FACTOR_RELATED_NODE_CLASS = "factor-related-node";
export const TERM_NODE_CLASS = "term-node";

// Entity labels
export const PROJECT_NODE_LABEL = "Project Node";
export const STUDY_NODE_LABEL = "Study Node";
export const PERSON_NODE_LABEL = "Person Node";
export const SUBJECT_NODE_LABEL = "Subject Node";
export const ANALYSIS_NODE_LABEL = "Analysis Node";
export const ANALYSIS_RELATED_NODE_LABEL = "Analysis Related Node";
export const METADATA_RELATED_NODE_LABEL = "Meta Node";
export const SAMPLE_NODE_LABEL = "Sample Node";
export const SAMPLE_RELATED_NODE_LABEL = "Sample Related Node";
export const FACTOR_RELATED_NODE_LABEL = "Factor Related Node";
export const TERM_NODE_LABEL = "Term Node";

// Entity styles
export const PROJECT_NODE_COLOR = "#c78100";
export const STUDY_NODE_COLOR = "#4c8eda";
export const PERSON_NODE_COLOR = "#a11745";
export const SUBJECT_NODE_COLOR = "#da6c93";
export const ANALYSIS_NODE_COLOR = "#f16565";
export const ANALYSIS_RELATED_NODE_COLOR = "#209cbc";
export const METADATA_RELATED_NODE_COLOR = "#e170d7";
export const SAMPLE_NODE_COLOR = "#a47ecd";
export const SAMPLE_RELATED_NODE_COLOR = "#4aa553";
export const FACTOR_RELATED_NODE_COLOR = "#b28b5c";
export const TERM_NODE_COLOR = "#569480";

// Entity text styles
export const ALL_NODES_TEXT_COLOR = "#000";

const NODE_CLASS_MAP: SchemaNodeClassMap = new Map([
  [mwSchema.PROJECT, PROJECT_NODE_CLASS],
  [mwSchema.STUDY, STUDY_NODE_CLASS],
  [mwSchema.PERSON, PERSON_NODE_CLASS],
  [mwSchema.SUBJECT, SUBJECT_NODE_CLASS],
  [mwSchema.ANALYSIS, ANALYSIS_NODE_CLASS],
  ...mwSchema.ANALYSES.map((label): [string, string] => [
    label,
    ANALYSIS_RELATED_NODE_CLASS,
  ]),
  ...mwSchema.METAS.map((label): [string, string] => [
    label,
    METADATA_RELATED_NODE_CLASS,
  ]),
  [mwSchema.SAMPLE, SAMPLE_NODE_CLASS],
  ...mwSchema.SAMPLE_RELATED.map((label): [string, string] => [
    label,
    SAMPLE_RELATED_NODE_CLASS,
  ]),
  ...mwSchema.FACTOR_RELATED.map((label): [string, string] => [
    label,
    FACTOR_RELATED_NODE_CLASS,
  ]),
  ...mwSchema.TERMS.map((label): [string, string] => [label, TERM_NODE_CLASS]),
]);

const NODE_DISPLAY_PROPERTY_MAP: SchemaDisplayPropertyMap = new Map([
  [mwSchema.ALL_FACTORS, "factors"],
  [mwSchema.ANALYSIS, "analysis_display"],
  [mwSchema.ANOVA, "factor_name"],
  [mwSchema.CHROMATOGRAPHY, "id"],
  [mwSchema.CLASS, "name"],
  [mwSchema.COLLECTION, "id"],
  [mwSchema.DISEASE, "name"],
  [mwSchema.FACTOR, "id"],
  [mwSchema.FACTOR_LEVEL, "id"],
  [mwSchema.KINGDOM, "name"],
  [mwSchema.MS, "name"],
  [mwSchema.METABOLITE, "name"],
  [mwSchema.METADATA, "id"],
  [mwSchema.NMR, "id"],
  [mwSchema.PERSON, "email"],
  [mwSchema.PROJECT, "id"],
  [mwSchema.REFMET, "refmet_id"],
  [mwSchema.SAMPLE, "id"],
  [mwSchema.SAMPLE_PREP, "id"],
  [mwSchema.SAMPLE_SOURCE, "name"],
  [mwSchema.SPECIES, "name"],
  [mwSchema.STUDY, "id"],
  [mwSchema.SUBJECT, "id"],
  [mwSchema.TREATMENT, "id"],
  [mwSchema.UNIQUE_SA, "id"],
  [mwSchema.VERSION, "version"],
]);

const ENTITY_STYLES_MAP: SchemaEntityStyleMap = new Map([
  [
    PROJECT_NODE_CLASS,
    {
      color: ALL_NODES_TEXT_COLOR,
      backgroundColor: PROJECT_NODE_COLOR,
    },
  ],
  [
    STUDY_NODE_CLASS,
    {
      color: ALL_NODES_TEXT_COLOR,
      backgroundColor: STUDY_NODE_COLOR,
    },
  ],
  [
    PERSON_NODE_CLASS,
    {
      color: ALL_NODES_TEXT_COLOR,
      backgroundColor: PERSON_NODE_COLOR,
    },
  ],
  [
    SUBJECT_NODE_CLASS,
    {
      color: ALL_NODES_TEXT_COLOR,
      backgroundColor: SUBJECT_NODE_COLOR,
    },
  ],
  [
    ANALYSIS_NODE_CLASS,
    {
      color: ALL_NODES_TEXT_COLOR,
      backgroundColor: ANALYSIS_NODE_COLOR,
    },
  ],
  [
    ANALYSIS_RELATED_NODE_CLASS,
    {
      color: ALL_NODES_TEXT_COLOR,
      backgroundColor: ANALYSIS_RELATED_NODE_COLOR,
    },
  ],
  [
    METADATA_RELATED_NODE_CLASS,
    {
      color: ALL_NODES_TEXT_COLOR,
      backgroundColor: METADATA_RELATED_NODE_COLOR,
    },
  ],
  [
    SAMPLE_NODE_CLASS,
    {
      color: ALL_NODES_TEXT_COLOR,
      backgroundColor: SAMPLE_NODE_COLOR,
    },
  ],
  [
    SAMPLE_RELATED_NODE_CLASS,
    {
      color: ALL_NODES_TEXT_COLOR,
      backgroundColor: SAMPLE_RELATED_NODE_COLOR,
    },
  ],
  [
    FACTOR_RELATED_NODE_CLASS,
    {
      color: ALL_NODES_TEXT_COLOR,
      backgroundColor: FACTOR_RELATED_NODE_COLOR,
    },
  ],
  [
    TERM_NODE_CLASS,
    {
      color: ALL_NODES_TEXT_COLOR,
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

const mwCytoscapeStyles = {
  NODE_CLASS_MAP: NODE_CLASS_MAP,
  NODE_DISPLAY_PROPERTY_MAP: NODE_DISPLAY_PROPERTY_MAP,
  ENTITY_STYLES_MAP: ENTITY_STYLES_MAP,
  ENTITY_STYLESHEET_CLASSES: ENTITY_STYLESHEET_CLASSES,
};

export default mwCytoscapeStyles;
