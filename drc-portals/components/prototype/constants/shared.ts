import { CSSProperties } from "react";
import {
  ADMIN_LABELS,
  ANALYSIS_TYPE_LABEL,
  ANATOMY_LABEL,
  ASSAY_TYPE_LABEL,
  BIOSAMPLE_LABEL,
  BIOSAMPLE_RELATED_LABELS,
  COLLECTION_LABEL,
  COMPOUND_LABEL,
  CONTAINER_LABELS,
  CORE_LABELS,
  DATA_TYPE_LABEL,
  DCC_LABEL,
  DISEASE_LABEL,
  FILE_FORMAT_LABEL,
  FILE_LABEL,
  FILE_RELATED_LABELS,
  GENE_LABEL,
  ID_NAMESPACE_LABEL,
  NCBI_TAXONOMY_LABEL,
  PHENOTYPE_LABEL,
  PROJECT_LABEL,
  PROTEIN_LABEL,
  SAMPLE_PREP_METHOD_LABEL,
  SUBJECT_ETHNICITY_LABEL,
  SUBJECT_GRANULARITY_LABEL,
  SUBJECT_LABEL,
  SUBJECT_RACE_LABEL,
  SUBJECT_RELATED_LABELS,
  SUBJECT_SEX_LABEL,
  SUBSTANCE_LABEL,
  TERM_LABELS,
} from "./neo4j";

// Entity class style names
export const ADMIN_NODE_CLASS = "admin-node";
export const BIOSAMPLE_RELATED_NODE_CLASS = "biosample-related-node";
export const CONTAINER_NODE_CLASS = "container-node";
export const CORE_NODE_CLASS = "core-node";
export const FILE_RELATED_NODE_CLASS = "file-related-node";
export const SUBJECT_RELATED_NODE_CLASS = "subject-related-node";
export const TERM_NODE_CLASS = "term-node";

// Entity styles
export const ADMIN_NODE_COLOR = "#ffc454";
export const BIOSAMPLE_RELATED_NODE_COLOR = "#f79767";
export const CONTAINER_NODE_COLOR = "#4c8eda";
export const CORE_NODE_COLOR = "#3a414a";
export const FILE_RELATED_NODE_COLOR = "#d46989";
export const SUBJECT_RELATED_NODE_COLOR = "#c186b7";
export const TERM_NODE_COLOR = "#569480";

// Map of node label to the appropriate representation string
export const NODE_DISPLAY_PROPERTY_MAP: ReadonlyMap<string, string> = new Map([
  [DCC_LABEL, "name"],
  [ID_NAMESPACE_LABEL, "name"],
  [COLLECTION_LABEL, "name"],
  [PROJECT_LABEL, "name"],
  [FILE_LABEL, "local_id"],
  [SUBJECT_LABEL, "local_id"],
  [BIOSAMPLE_LABEL, "local_id"],
  [ANATOMY_LABEL, "name"],
  [COMPOUND_LABEL, "name"],
  [DISEASE_LABEL, "name"],
  [GENE_LABEL, "name"],
  [NCBI_TAXONOMY_LABEL, "name"],
  [PHENOTYPE_LABEL, "name"],
  [PROTEIN_LABEL, "name"],
  [SUBSTANCE_LABEL, "name"],
  [ANALYSIS_TYPE_LABEL, "name"],
  [ASSAY_TYPE_LABEL, "name"],
  [DATA_TYPE_LABEL, "name"],
  [FILE_FORMAT_LABEL, "name"],
  [SUBJECT_ETHNICITY_LABEL, "name"],
  [SUBJECT_RACE_LABEL, "name"],
  [SUBJECT_GRANULARITY_LABEL, "name"],
  [SUBJECT_SEX_LABEL, "name"],
  [SAMPLE_PREP_METHOD_LABEL, "name"],
]);

export const ENTITY_STYLES_MAP: ReadonlyMap<string, CSSProperties> = new Map([
  [
    ADMIN_NODE_CLASS,
    {
      color: "#000",
      backgroundColor: ADMIN_NODE_COLOR,
      textOutlineColor: "#fff",
    },
  ],
  [
    BIOSAMPLE_RELATED_NODE_CLASS,
    {
      backgroundColor: BIOSAMPLE_RELATED_NODE_COLOR,
    },
  ],
  [
    CONTAINER_NODE_CLASS,
    {
      backgroundColor: CONTAINER_NODE_COLOR,
    },
  ],
  [
    CORE_NODE_CLASS,
    {
      backgroundColor: CORE_NODE_COLOR,
    },
  ],
  [
    FILE_RELATED_NODE_CLASS,
    {
      backgroundColor: FILE_RELATED_NODE_COLOR,
    },
  ],
  [
    SUBJECT_RELATED_NODE_CLASS,
    {
      backgroundColor: SUBJECT_RELATED_NODE_COLOR,
    },
  ],
  [
    TERM_NODE_CLASS,
    {
      backgroundColor: TERM_NODE_COLOR,
    },
  ],
]);

// Map of node label to appropriate color
export const NODE_CLASS_MAP: ReadonlyMap<string, string> = new Map([
  ...ADMIN_LABELS.map((label): [string, string] => [label, ADMIN_NODE_CLASS]),
  ...CONTAINER_LABELS.map((label): [string, string] => [
    label,
    CONTAINER_NODE_CLASS,
  ]),
  ...CORE_LABELS.map((label): [string, string] => [label, CORE_NODE_CLASS]),
  ...TERM_LABELS.map((label): [string, string] => [label, TERM_NODE_CLASS]),
  ...FILE_RELATED_LABELS.map((label): [string, string] => [
    label,
    FILE_RELATED_NODE_CLASS,
  ]),
  ...SUBJECT_RELATED_LABELS.map((label): [string, string] => [
    label,
    SUBJECT_RELATED_NODE_CLASS,
  ]),
  ...BIOSAMPLE_RELATED_LABELS.map((label): [string, string] => [
    label,
    BIOSAMPLE_RELATED_NODE_CLASS,
  ]),
]);
