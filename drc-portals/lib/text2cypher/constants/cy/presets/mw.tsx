import mwSchema from "@/lib/text2cypher/neo4j/schemas/mw";

import type {
  SchemaCytoscapeStylesheet,
  SchemaCytoscapeElements,
} from "@/lib/text2cypher/schema/types";

import mwCytoscapeStyles, {
  PROJECT_NODE_LABEL,
  STUDY_NODE_LABEL,
  PERSON_NODE_LABEL,
  SUBJECT_NODE_LABEL,
  ANALYSIS_NODE_LABEL,
  ANALYSIS_RELATED_NODE_LABEL,
  METADATA_RELATED_NODE_LABEL,
  SAMPLE_NODE_LABEL,
  SAMPLE_RELATED_NODE_LABEL,
  FACTOR_RELATED_NODE_LABEL,
  TERM_NODE_LABEL,
} from "../styles/mw";

import {
  DEFAULT_STYLESHEET,
  EDGE_DIST_ENDPOINTS,
  getEdgePoint,
  getSegmentPropsWithPoints,
} from "../styles/defaults";

const NODE_X_SPACING = 160;
const NODE_Y_SPACING = 66;
const SCHEMA_EDGE_SPACING = 15;
const SCHEMA_FONT_SIZE = "10";
const SCHEMA_NODE_DIAMETER = 50;
const SCHEMA_NODE_RADIUS = SCHEMA_NODE_DIAMETER / 2;

const ALL_FACTORS_NODE_ID = "all-factors-node-id";
const ANALYSIS_NODE_ID = "analysis-node-id";
const ANOVA_NODE_ID = "anova-node-id";
const CHROMATOGRAPHY_NODE_ID = "chromatography-node-id";
const CLASS_NODE_ID = "class-node-id";
const COLLECTION_NODE_ID = "collection-node-id";
const DISEASE_NODE_ID = "disease-node-id";
const FACTOR_NODE_ID = "factor-node-id";
const FACTOR_LEVEL_NODE_ID = "factor-level-node-id";
const KINGDOM_NODE_ID = "kingdom-node-id";
const MS_NODE_ID = "ms-node-id";
const METABOLITE_NODE_ID = "metabolite-node-id";
const METADATA_NODE_ID = "metadata-node-id";
const NMR_NODE_ID = "nmr-node-id";
const PERSON_NODE_ID = "person-node-id";
const PROJECT_NODE_ID = "project-node-id";
const REFMET_NODE_ID = "refmet-node-id";
const SAMPLE_NODE_ID = "sample-node-id";
const SAMPLE_PREP_NODE_ID = "sample-prep-node-id";
const SAMPLE_SOURCE_NODE_ID = "sample-source-node-id";
const SPECIES_NODE_ID = "species-node-id";
const STUDY_NODE_ID = "study-node-id";
const SUBJECT_NODE_ID = "subject-node-id";
const TREATMENT_NODE_ID = "treatment-node-id";
const UNIQUE_SA_NODE_ID = "unique-sa-node-id";
const VERSION_NODE_ID = "version-node-id";

const PERSON_IS_CONTACT_FOR_PROJECT_EDGE_ID = "person-is-contact-for-project";
const PROJECT_INCLUDES_STUDY_EDGE_ID = "project-includes-study";
const PERSON_IS_CONTACT_FOR_STUDY_EDGE_ID = "person-is-contact-for-study";
const STUDY_HAS_VERSION_EDGE_ID = "study-has-version";
const STUDY_REFERENCES_DISEASE_EDGE_ID = "study-references-disease";
const STUDY_PRODUCED_ANOVA_EDGE_ID = "study-produced-anova";
const STUDY_PRODUCED_ANALYSIS_EDGE_ID = "study-produced-analysis";
const STUDY_REFERENCES_METABOLITE_EDGE_ID = "study-references-metabolite";
const STUDY_REFERENCES_UNIQUE_SA_EDGE_ID = "study-references-unique-sa";
const STUDY_REFERENCES_SOURCE_EDGE_ID = "study-references-source";
const ANOVA_REFERENCES_REFMET_EDGE_ID = "anova-references-refmet";
const ANALYSIS_USED_ANOVA_EDGE_ID = "analysis-used-anova";
const METABOLITE_REFERENCES_REFMET_EDGE_ID = "metabolite-references-refmet";
const ANALYSIS_DERIVED_FROM_CHROMATOGRAPHY_EDGE_ID =
  "analysis-derived-from-chromatography";
const ANALYSIS_REFERENCES_METABOLITE_EDGE_ID = "analysis-references-metabolite";
const ANALYSIS_DERIVED_FROM_NMR_EDGE_ID = "analysis-derived-from-nmr";
const ANALYSIS_DERIVED_FROM_MS_EDGE_ID = "analysis-derived-from-ms";
const UNIQUE_SA_SAMPLED_FROM_SOURCE_EDGE_ID = "unique-sa-sampled-from-source";
const SAMPLE_SAMPLED_FROM_SOURCE_EDGE_ID = "sample-sampled-from-source";
const SAMPLE_HAS_FACTORS_EDGE_ID = "sample-has-factors";
const SAMPLE_USES_FACTOR_LEVEL_EDGE_ID = "sample-uses-factor-level";
const FACTOR_LEVEL_HAS_FACTOR_EDGE_ID = "factor-level-has-factor";
const SAMPLED_FROM_SPECIES_EDGE_ID = "sampled-from-species";
const SPECIES_BELONGS_TO_KINGDOM_EDGE_ID = "species-belongs-to-kingdom";
const SPECIES_BELONGS_TO_CLASS_EDGE_ID = "species-belongs-to-class";
const SUBJECT_IS_SPECIES_EDGE_ID = "subject-is-species";
const SAMPLE_TAKEN_FROM_SUBJECT_EDGE_ID = "sample-taken-from-subject";
const COLLECTED_FROM_SUBJECT_EDGE_ID = "collected-from-subject";
const SAMPLED_FROM_SUBJECT_EDGE_ID = "sampled-from-subject";
const COLLECTION_LINKED_TO_METADATA_EDGE_ID = "collection-linked-to-metadata";
const SAMPLE_PREP_LINKED_TO_METADATA_EDGE_ID = "sample-prep-linked-to-metadata";
const TREATMENT_LINKED_TO_METADATA_EDGE_ID = "treatment-linked-to-metadata";

const ALL_FACTORS_POS = { x: 1 * NODE_X_SPACING, y: 2 * NODE_Y_SPACING };
const ANALYSIS_POS = { x: -2 * NODE_X_SPACING, y: 1 * NODE_Y_SPACING };
const ANOVA_POS = { x: -4 * NODE_X_SPACING, y: -2 * NODE_Y_SPACING };
const CHROMATOGRAPHY_POS = { x: -3 * NODE_X_SPACING, y: 3 * NODE_Y_SPACING };
const CLASS_POS = { x: 3 * NODE_X_SPACING, y: -1 * NODE_Y_SPACING };
const COLLECTION_POS = { x: 4 * NODE_X_SPACING, y: 0 * NODE_Y_SPACING };
const DISEASE_POS = { x: 0 * NODE_X_SPACING, y: -3 * NODE_Y_SPACING };
const FACTOR_POS = { x: 2 * NODE_X_SPACING, y: 3 * NODE_Y_SPACING };
const FACTOR_LEVEL_POS = { x: 2 * NODE_X_SPACING, y: 2 * NODE_Y_SPACING };
const KINGDOM_POS = { x: 1 * NODE_X_SPACING, y: -1 * NODE_Y_SPACING };
const MS_POS = { x: -1 * NODE_X_SPACING, y: 3 * NODE_Y_SPACING };
const METABOLITE_POS = { x: -4 * NODE_X_SPACING, y: 0 * NODE_Y_SPACING };
const METADATA_POS = { x: 5 * NODE_X_SPACING, y: 1 * NODE_Y_SPACING };
const NMR_POS = { x: -2 * NODE_X_SPACING, y: 3 * NODE_Y_SPACING };
const PERSON_POS = { x: -3 * NODE_X_SPACING, y: -3 * NODE_Y_SPACING };
const PROJECT_POS = { x: -1 * NODE_X_SPACING, y: -3 * NODE_Y_SPACING };
const REFMET_POS = { x: -5 * NODE_X_SPACING, y: -1 * NODE_Y_SPACING };
const SAMPLE_POS = { x: 2 * NODE_X_SPACING, y: 1 * NODE_Y_SPACING };
const SAMPLE_PREP_POS = { x: 4 * NODE_X_SPACING, y: 1 * NODE_Y_SPACING };
const SAMPLE_SOURCE_POS = { x: 0 * NODE_X_SPACING, y: 1 * NODE_Y_SPACING };
const SPECIES_POS = { x: 2 * NODE_X_SPACING, y: 0 * NODE_Y_SPACING };
const STUDY_POS = { x: -2 * NODE_X_SPACING, y: -2 * NODE_Y_SPACING };
const SUBJECT_POS = { x: 3 * NODE_X_SPACING, y: 1 * NODE_Y_SPACING };
const TREATMENT_POS = { x: 4 * NODE_X_SPACING, y: 2 * NODE_Y_SPACING };
const UNIQUE_SA_POS = { x: 0 * NODE_X_SPACING, y: 0 * NODE_Y_SPACING };
const VERSION_POS = { x: 0 * NODE_X_SPACING, y: -2 * NODE_Y_SPACING };

const PERSON_IS_CONTACT_FOR_STUDY_SOURCE_DEG = 180;
const PERSON_IS_CONTACT_FOR_STUDY_TARGET_DEG = 0;
const PERSON_IS_CONTACT_FOR_STUDY_SOURCE_POS = getEdgePoint(
  PERSON_POS,
  PERSON_IS_CONTACT_FOR_STUDY_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const PERSON_IS_CONTACT_FOR_STUDY_TARGET_POS = getEdgePoint(
  STUDY_POS,
  PERSON_IS_CONTACT_FOR_STUDY_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const PROJECT_INCLUDES_STUDY_SOURCE_DEG = 180;
const PROJECT_INCLUDES_STUDY_TARGET_DEG = 0;
const PROJECT_INCLUDES_STUDY_SOURCE_POS = getEdgePoint(
  PROJECT_POS,
  PROJECT_INCLUDES_STUDY_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const PROJECT_INCLUDES_STUDY_TARGET_POS = getEdgePoint(
  STUDY_POS,
  PROJECT_INCLUDES_STUDY_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const STUDY_REFERENCES_DISEASE_SOURCE_DEG = 90;
const STUDY_REFERENCES_DISEASE_TARGET_DEG = -90;
const STUDY_REFERENCES_DISEASE_SOURCE_POS = getEdgePoint(
  STUDY_POS,
  STUDY_REFERENCES_DISEASE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const STUDY_REFERENCES_DISEASE_TARGET_POS = getEdgePoint(
  DISEASE_POS,
  STUDY_REFERENCES_DISEASE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const STUDY_REFERENCES_UNIQUE_SA_SOURCE_DEG = 90;
const STUDY_REFERENCES_UNIQUE_SA_TARGET_DEG = -90;
const STUDY_REFERENCES_UNIQUE_SA_SOURCE_POS = getEdgePoint(
  STUDY_POS,
  STUDY_REFERENCES_UNIQUE_SA_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const STUDY_REFERENCES_UNIQUE_SA_TARGET_POS = getEdgePoint(
  UNIQUE_SA_POS,
  STUDY_REFERENCES_UNIQUE_SA_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const STUDY_REFERENCES_SOURCE_SOURCE_DEG = 90;
const STUDY_REFERENCES_SOURCE_TARGET_DEG = -90;
const STUDY_REFERENCES_SOURCE_SOURCE_POS = getEdgePoint(
  STUDY_POS,
  STUDY_REFERENCES_SOURCE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const STUDY_REFERENCES_SOURCE_TARGET_POS = getEdgePoint(
  SAMPLE_SOURCE_POS,
  STUDY_REFERENCES_SOURCE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const STUDY_REFERENCES_METABOLITE_SOURCE_DEG = 180;
const STUDY_REFERENCES_METABOLITE_TARGET_DEG = 0;
const STUDY_REFERENCES_METABOLITE_SOURCE_POS = getEdgePoint(
  STUDY_POS,
  STUDY_REFERENCES_METABOLITE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const STUDY_REFERENCES_METABOLITE_TARGET_POS = getEdgePoint(
  METABOLITE_POS,
  STUDY_REFERENCES_METABOLITE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const ANOVA_REFERENCES_REFMET_SOURCE_DEG = -90;
const ANOVA_REFERENCES_REFMET_TARGET_DEG = 0;
const ANOVA_REFERENCES_REFMET_SOURCE_POS = getEdgePoint(
  ANOVA_POS,
  ANOVA_REFERENCES_REFMET_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const ANOVA_REFERENCES_REFMET_TARGET_POS = getEdgePoint(
  REFMET_POS,
  ANOVA_REFERENCES_REFMET_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const ANALYSIS_USED_ANOVA_SOURCE_DEGREE = -90;
const ANALYSIS_USED_ANOVA_TARGET_DEGREE = 0;
const ANALYSIS_USED_ANOVA_SOURCE_POS = getEdgePoint(
  ANALYSIS_POS,
  ANALYSIS_USED_ANOVA_SOURCE_DEGREE,
  SCHEMA_NODE_RADIUS,
);
const ANALYSIS_USED_ANOVA_TARGET_POS = getEdgePoint(
  ANOVA_POS,
  ANALYSIS_USED_ANOVA_TARGET_DEGREE,
  SCHEMA_NODE_RADIUS,
);

const METABOLITE_LINKED_TO_REFMET_SOURCE_DEG = -90;
const METABOLITE_LINKED_TO_REFMET_TARGET_DEGREE = 180;
const METABOLITE_LINKED_TO_REFMET_SOURCE_POS = getEdgePoint(
  METABOLITE_POS,
  METABOLITE_LINKED_TO_REFMET_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const METABOLITE_LINKED_TO_REFMET_TARGET_POS = getEdgePoint(
  REFMET_POS,
  METABOLITE_LINKED_TO_REFMET_TARGET_DEGREE,
  SCHEMA_NODE_RADIUS,
);

const ANALYSIS_REFERENCES_METABOLITE_SOURCE_DEGREE = -90;
const ANALYSIS_REFERENCES_METABOLITE_TARGET_DEGREE = 180;
const ANALYSIS_REFERENCES_METABOLITE_SOURCE_POS = getEdgePoint(
  ANALYSIS_POS,
  ANALYSIS_REFERENCES_METABOLITE_SOURCE_DEGREE,
  SCHEMA_NODE_RADIUS,
);
const ANALYSIS_REFERENCES_METABOLITE_TARGET_POS = getEdgePoint(
  METABOLITE_POS,
  ANALYSIS_REFERENCES_METABOLITE_TARGET_DEGREE,
  SCHEMA_NODE_RADIUS,
);

const ANALYSIS_DERIVED_FROM_CHROMATOGRAPHY_SOURCE_DEGREE = -90;
const ANALYSIS_DERIVED_FROM_CHROMATOGRAPHY_TARGET_DEGREE = 0;
const ANALYSIS_DERIVED_FROM_CHROMATOGRAPHY_SOURCE_POS = getEdgePoint(
  ANALYSIS_POS,
  ANALYSIS_DERIVED_FROM_CHROMATOGRAPHY_SOURCE_DEGREE,
  SCHEMA_NODE_RADIUS,
);
const ANALYSIS_DERIVED_FROM_CHROMATOGRAPHY_TARGET_POS = getEdgePoint(
  CHROMATOGRAPHY_POS,
  ANALYSIS_DERIVED_FROM_CHROMATOGRAPHY_TARGET_DEGREE,
  SCHEMA_NODE_RADIUS,
);

const ANALYSIS_DERIVED_FROM_MS_SOURCE_DEGREE = 90;
const ANALYSIS_DERIVED_FROM_MS_TARGET_DEGREE = 0;
const ANALYSIS_DERIVED_FROM_MS_SOURCE_POS = getEdgePoint(
  ANALYSIS_POS,
  ANALYSIS_DERIVED_FROM_MS_SOURCE_DEGREE,
  SCHEMA_NODE_RADIUS,
);
const ANALYSIS_DERIVED_FROM_MS_TARGET_POS = getEdgePoint(
  MS_POS,
  ANALYSIS_DERIVED_FROM_MS_TARGET_DEGREE,
  SCHEMA_NODE_RADIUS,
);

const SAMPLE_HAS_FACTORS_SOURCE_DEGREE = 90;
const SAMPLE_HAS_FACTORS_TARGET_DEGREE = 0;
const SAMPLE_HAS_FACTORS_SOURCE_POS = getEdgePoint(
  SAMPLE_POS,
  SAMPLE_HAS_FACTORS_SOURCE_DEGREE,
  SCHEMA_NODE_RADIUS,
);
const SAMPLE_HAS_FACTORS_TARGET_POS = getEdgePoint(
  ALL_FACTORS_POS,
  SAMPLE_HAS_FACTORS_TARGET_DEGREE,
  SCHEMA_NODE_RADIUS,
);

const SPECIES_BELONGS_TO_KINGDOM_SOURCE_DEGREE = 0;
const SPECIES_BELONGS_TO_KINGDOM_TARGET_DEGREE = 180;
const SPECIES_BELONGS_TO_KINGDOM_SOURCE_POS = getEdgePoint(
  SPECIES_POS,
  SPECIES_BELONGS_TO_KINGDOM_SOURCE_DEGREE,
  SCHEMA_NODE_RADIUS,
);
const SPECIES_BELONGS_TO_KINGDOM_TARGET_POS = getEdgePoint(
  KINGDOM_POS,
  SPECIES_BELONGS_TO_KINGDOM_TARGET_DEGREE,
  SCHEMA_NODE_RADIUS,
);

const SPECIES_BELONGS_TO_CLASS_SOURCE_DEGREE = 0;
const SPECIES_BELONGS_TO_CLASS_TARGET_DEGREE = 180;
const SPECIES_BELONGS_TO_CLASS_SOURCE_POS = getEdgePoint(
  SPECIES_POS,
  SPECIES_BELONGS_TO_CLASS_SOURCE_DEGREE,
  SCHEMA_NODE_RADIUS,
);
const SPECIES_BELONGS_TO_CLASS_TARGET_POS = getEdgePoint(
  CLASS_POS,
  SPECIES_BELONGS_TO_CLASS_TARGET_DEGREE,
  SCHEMA_NODE_RADIUS,
);

const SUBJECT_IS_SPECIES_SOURCE_DEGREE = 0;
const SUBJECT_IS_SPECIES_TARGET_DEGREE = 90;
const SUBJECT_IS_SPECIES_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_IS_SPECIES_SOURCE_DEGREE,
  SCHEMA_NODE_RADIUS,
);
const SUBJECT_IS_SPECIES_TARGET_POS = getEdgePoint(
  SPECIES_POS,
  SUBJECT_IS_SPECIES_TARGET_DEGREE,
  SCHEMA_NODE_RADIUS,
);

const COLLECTED_FROM_SUBJECT_SOURCE_DEGREE = -90;
const COLLECTED_FROM_SUBJECT_TARGET_DEGREE = 90;
const COLLECTED_FROM_SUBJECT_SOURCE_POS = getEdgePoint(
  COLLECTION_POS,
  COLLECTED_FROM_SUBJECT_SOURCE_DEGREE,
  SCHEMA_NODE_RADIUS,
);
const COLLECTED_FROM_SUBJECT_TARGET_POS = getEdgePoint(
  SUBJECT_POS,
  COLLECTED_FROM_SUBJECT_TARGET_DEGREE,
  SCHEMA_NODE_RADIUS,
);

const COLLECTION_LINKED_TO_METADATA_SOURCE_DEGREE = 90;
const COLLECTION_LINKED_TO_METADATA_TARGET_DEGREE = 0;
const COLLECTION_LINKED_TO_METADATA_SOURCE_POS = getEdgePoint(
  COLLECTION_POS,
  COLLECTION_LINKED_TO_METADATA_SOURCE_DEGREE,
  SCHEMA_NODE_RADIUS,
);
const COLLECTION_LINKED_TO_METADATA_TARGET_POS = getEdgePoint(
  METADATA_POS,
  COLLECTION_LINKED_TO_METADATA_TARGET_DEGREE,
  SCHEMA_NODE_RADIUS,
);

const TREATMENT_LINKED_TO_METADATA_SOURCE_DEGREE = 90;
const TREATMENT_LINKED_TO_METADATA_TARGET_DEGREE = 180;
const TREATMENT_LINKED_TO_METADATA_SOURCE_POS = getEdgePoint(
  TREATMENT_POS,
  TREATMENT_LINKED_TO_METADATA_SOURCE_DEGREE,
  SCHEMA_NODE_RADIUS,
);
const TREATMENT_LINKED_TO_METADATA_TARGET_POS = getEdgePoint(
  METADATA_POS,
  TREATMENT_LINKED_TO_METADATA_TARGET_DEGREE,
  SCHEMA_NODE_RADIUS,
);

const NODES: SchemaCytoscapeElements = [
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.ALL_FACTORS) || ""],
    position: ALL_FACTORS_POS,
    locked: true,
    data: {
      id: ALL_FACTORS_NODE_ID,
      label: FACTOR_RELATED_NODE_LABEL,
      displayLabel: mwSchema.ALL_FACTORS,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.ANALYSIS) || ""],
    position: ANALYSIS_POS,
    locked: true,
    data: {
      id: ANALYSIS_NODE_ID,
      label: ANALYSIS_NODE_LABEL,
      displayLabel: mwSchema.ANALYSIS,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.ANOVA) || ""],
    position: ANOVA_POS,
    locked: true,
    data: {
      id: ANOVA_NODE_ID,
      label: ANALYSIS_RELATED_NODE_LABEL,
      displayLabel: mwSchema.ANOVA,
    },
  },
  {
    classes: [
      mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.CHROMATOGRAPHY) || "",
    ],
    position: CHROMATOGRAPHY_POS,
    locked: true,
    data: {
      id: CHROMATOGRAPHY_NODE_ID,
      label: ANALYSIS_RELATED_NODE_LABEL,
      displayLabel: mwSchema.CHROMATOGRAPHY,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.CLASS) || ""],
    position: CLASS_POS,
    locked: true,
    data: {
      id: CLASS_NODE_ID,
      label: TERM_NODE_LABEL,
      displayLabel: mwSchema.CLASS,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.COLLECTION) || ""],
    position: COLLECTION_POS,
    locked: true,
    data: {
      id: COLLECTION_NODE_ID,
      label: TERM_NODE_LABEL,
      displayLabel: mwSchema.COLLECTION,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.DISEASE) || ""],
    position: DISEASE_POS,
    locked: true,
    data: {
      id: DISEASE_NODE_ID,
      label: TERM_NODE_LABEL,
      displayLabel: mwSchema.DISEASE,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.FACTOR) || ""],
    position: FACTOR_POS,
    locked: true,
    data: {
      id: FACTOR_NODE_ID,
      label: FACTOR_RELATED_NODE_LABEL,
      displayLabel: mwSchema.FACTOR,
    },
  },
  {
    classes: [
      mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.FACTOR_LEVEL) || "",
    ],
    position: FACTOR_LEVEL_POS,
    locked: true,
    data: {
      id: FACTOR_LEVEL_NODE_ID,
      label: FACTOR_RELATED_NODE_LABEL,
      displayLabel: mwSchema.FACTOR_LEVEL,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.KINGDOM) || ""],
    position: KINGDOM_POS,
    locked: true,
    data: {
      id: KINGDOM_NODE_ID,
      label: TERM_NODE_LABEL,
      displayLabel: mwSchema.KINGDOM,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.MS) || ""],
    position: MS_POS,
    locked: true,
    data: {
      id: MS_NODE_ID,
      label: ANALYSIS_RELATED_NODE_LABEL,
      displayLabel: mwSchema.MS,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.METABOLITE) || ""],
    position: METABOLITE_POS,
    locked: true,
    data: {
      id: METABOLITE_NODE_ID,
      label: TERM_NODE_LABEL,
      displayLabel: mwSchema.METABOLITE,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.METADATA) || ""],
    position: METADATA_POS,
    locked: true,
    data: {
      id: METADATA_NODE_ID,
      label: METADATA_RELATED_NODE_LABEL,
      displayLabel: mwSchema.METADATA,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.NMR) || ""],
    position: NMR_POS,
    locked: true,
    data: {
      id: NMR_NODE_ID,
      label: ANALYSIS_RELATED_NODE_LABEL,
      displayLabel: mwSchema.NMR,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.PERSON) || ""],
    position: PERSON_POS,
    locked: true,
    data: {
      id: PERSON_NODE_ID,
      label: PERSON_NODE_LABEL,
      displayLabel: mwSchema.PERSON,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.PROJECT) || ""],
    position: PROJECT_POS,
    locked: true,
    data: {
      id: PROJECT_NODE_ID,
      label: PROJECT_NODE_LABEL,
      displayLabel: mwSchema.PROJECT,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.REFMET) || ""],
    position: REFMET_POS,
    locked: true,
    data: {
      id: REFMET_NODE_ID,
      label: TERM_NODE_LABEL,
      displayLabel: mwSchema.REFMET,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.SAMPLE) || ""],
    position: SAMPLE_POS,
    locked: true,
    data: {
      id: SAMPLE_NODE_ID,
      label: SAMPLE_NODE_LABEL,
      displayLabel: mwSchema.SAMPLE,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.SAMPLE_PREP) || ""],
    position: SAMPLE_PREP_POS,
    locked: true,
    data: {
      id: SAMPLE_PREP_NODE_ID,
      label: SAMPLE_RELATED_NODE_LABEL,
      displayLabel: mwSchema.SAMPLE_PREP,
    },
  },
  {
    classes: [
      mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.SAMPLE_SOURCE) || "",
    ],
    position: SAMPLE_SOURCE_POS,
    locked: true,
    data: {
      id: SAMPLE_SOURCE_NODE_ID,
      label: SAMPLE_RELATED_NODE_LABEL,
      displayLabel: mwSchema.SAMPLE_SOURCE,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.SPECIES) || ""],
    position: SPECIES_POS,
    locked: true,
    data: {
      id: SPECIES_NODE_ID,
      label: TERM_NODE_LABEL,
      displayLabel: mwSchema.SPECIES,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.STUDY) || ""],
    position: STUDY_POS,
    locked: true,
    data: {
      id: STUDY_NODE_ID,
      label: STUDY_NODE_LABEL,
      displayLabel: mwSchema.STUDY,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.SUBJECT) || ""],
    position: SUBJECT_POS,
    locked: true,
    data: {
      id: SUBJECT_NODE_ID,
      label: SUBJECT_NODE_LABEL,
      displayLabel: mwSchema.SUBJECT,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.TREATMENT) || ""],
    position: TREATMENT_POS,
    locked: true,
    data: {
      id: TREATMENT_NODE_ID,
      label: SAMPLE_RELATED_NODE_LABEL,
      displayLabel: mwSchema.TREATMENT,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.UNIQUE_SA) || ""],
    position: UNIQUE_SA_POS,
    locked: true,
    data: {
      id: UNIQUE_SA_NODE_ID,
      label: SAMPLE_RELATED_NODE_LABEL,
      displayLabel: mwSchema.UNIQUE_SA,
    },
  },
  {
    classes: [mwCytoscapeStyles.NODE_CLASS_MAP.get(mwSchema.VERSION) || ""],
    position: VERSION_POS,
    locked: true,
    data: {
      id: VERSION_NODE_ID,
      label: METADATA_RELATED_NODE_LABEL,
      displayLabel: mwSchema.VERSION,
    },
  },
];

const EDGES: SchemaCytoscapeElements = [
  {
    classes: [],
    data: {
      id: PERSON_IS_CONTACT_FOR_PROJECT_EDGE_ID,
      source: PERSON_NODE_ID,
      target: PROJECT_NODE_ID,
      type: mwSchema.IS_CONTACT_FOR,
    },
  },
  {
    classes: [],
    data: {
      id: PROJECT_INCLUDES_STUDY_EDGE_ID,
      source: PROJECT_NODE_ID,
      target: STUDY_NODE_ID,
      type: mwSchema.INCLUDES_STUDY,
    },
  },
  {
    classes: [],
    data: {
      id: PERSON_IS_CONTACT_FOR_STUDY_EDGE_ID,
      source: PERSON_NODE_ID,
      target: STUDY_NODE_ID,
      type: mwSchema.IS_CONTACT_FOR,
    },
  },
  {
    classes: [],
    data: {
      id: STUDY_HAS_VERSION_EDGE_ID,
      source: STUDY_NODE_ID,
      target: VERSION_NODE_ID,
      type: mwSchema.HAS_VERSION,
    },
  },
  {
    classes: [],
    data: {
      id: STUDY_REFERENCES_DISEASE_EDGE_ID,
      source: STUDY_NODE_ID,
      target: DISEASE_NODE_ID,
      type: mwSchema.REFERENCES_DISEASE,
    },
  },
  {
    classes: [],
    data: {
      id: STUDY_PRODUCED_ANOVA_EDGE_ID,
      source: STUDY_NODE_ID,
      target: ANOVA_NODE_ID,
      type: mwSchema.STUDY_PRODUCED_ANOVA,
    },
  },
  {
    classes: ["horizontal-text"],
    data: {
      id: STUDY_PRODUCED_ANALYSIS_EDGE_ID,
      source: STUDY_NODE_ID,
      target: ANALYSIS_NODE_ID,
      type: mwSchema.STUDY_PRODUCED_ANALYSIS,
    },
  },
  {
    classes: [],
    data: {
      id: STUDY_REFERENCES_METABOLITE_EDGE_ID,
      source: STUDY_NODE_ID,
      target: METABOLITE_NODE_ID,
      type: mwSchema.STUDY_REFERENCES_METABOLITE,
    },
  },
  {
    classes: [],
    data: {
      id: STUDY_REFERENCES_UNIQUE_SA_EDGE_ID,
      source: STUDY_NODE_ID,
      target: UNIQUE_SA_NODE_ID,
      type: mwSchema.STUDY_REFERENCES_UNIQUE_SA,
    },
  },
  {
    classes: [],
    data: {
      id: STUDY_REFERENCES_SOURCE_EDGE_ID,
      source: STUDY_NODE_ID,
      target: SAMPLE_SOURCE_NODE_ID,
      type: mwSchema.STUDY_REFERENCES_SOURCE,
    },
  },
  {
    classes: [],
    data: {
      id: ANOVA_REFERENCES_REFMET_EDGE_ID,
      source: ANOVA_NODE_ID,
      target: REFMET_NODE_ID,
      type: mwSchema.ANOVA_REFERENCES_REFMET,
    },
  },
  {
    classes: [],
    data: {
      id: ANALYSIS_USED_ANOVA_EDGE_ID,
      source: ANALYSIS_NODE_ID,
      target: ANOVA_NODE_ID,
      type: mwSchema.ANALYSIS_USED_ANOVA,
    },
  },
  {
    classes: [],
    data: {
      id: METABOLITE_REFERENCES_REFMET_EDGE_ID,
      source: METABOLITE_NODE_ID,
      target: REFMET_NODE_ID,
      type: mwSchema.METABOLITE_LINKED_TO_REFMET,
    },
  },
  {
    classes: [],
    data: {
      id: ANALYSIS_REFERENCES_METABOLITE_EDGE_ID,
      source: ANALYSIS_NODE_ID,
      target: METABOLITE_NODE_ID,
      type: mwSchema.ANALYSIS_REFERENCES_METABOLITE,
    },
  },
  {
    classes: [],
    data: {
      id: ANALYSIS_DERIVED_FROM_CHROMATOGRAPHY_EDGE_ID,
      source: ANALYSIS_NODE_ID,
      target: CHROMATOGRAPHY_NODE_ID,
      type: mwSchema.DERIVED_FROM_CHROMATOGRAPHY,
    },
  },
  {
    classes: ["horizontal-text"],
    data: {
      id: ANALYSIS_DERIVED_FROM_NMR_EDGE_ID,
      source: ANALYSIS_NODE_ID,
      target: NMR_NODE_ID,
      type: mwSchema.DERIVED_FROM_NMR,
    },
  },
  {
    classes: [],
    data: {
      id: ANALYSIS_DERIVED_FROM_MS_EDGE_ID,
      source: ANALYSIS_NODE_ID,
      target: MS_NODE_ID,
      type: mwSchema.DERIVED_FROM_MS,
    },
  },
  {
    classes: ["horizontal-text"],
    data: {
      id: UNIQUE_SA_SAMPLED_FROM_SOURCE_EDGE_ID,
      source: UNIQUE_SA_NODE_ID,
      target: SAMPLE_SOURCE_NODE_ID,
      type: mwSchema.UNIQUE_SA_SAMPLED_FROM_SOURCE,
    },
  },
  {
    classes: [],
    data: {
      id: SAMPLE_SAMPLED_FROM_SOURCE_EDGE_ID,
      source: SAMPLE_NODE_ID,
      target: SAMPLE_SOURCE_NODE_ID,
      type: mwSchema.SAMPLED_FROM_SOURCE,
    },
  },
  {
    classes: [],
    data: {
      id: SAMPLE_HAS_FACTORS_EDGE_ID,
      source: SAMPLE_NODE_ID,
      target: ALL_FACTORS_NODE_ID,
      type: mwSchema.HAS_FACTORS,
    },
  },
  {
    classes: ["horizontal-text"],
    data: {
      id: SAMPLE_USES_FACTOR_LEVEL_EDGE_ID,
      source: SAMPLE_NODE_ID,
      target: FACTOR_LEVEL_NODE_ID,
      type: mwSchema.SAMPLE_USES_FACTOR_LEVEL,
    },
  },
  {
    classes: ["horizontal-text"],
    data: {
      id: FACTOR_LEVEL_HAS_FACTOR_EDGE_ID,
      source: FACTOR_LEVEL_NODE_ID,
      target: FACTOR_NODE_ID,
      type: mwSchema.FACTOR_LEVEL_HAS_FACTOR,
    },
  },
  {
    classes: ["horizontal-text"],
    data: {
      id: SAMPLED_FROM_SPECIES_EDGE_ID,
      source: SAMPLE_NODE_ID,
      target: SPECIES_NODE_ID,
      type: mwSchema.SAMPLED_FROM_SPECIES,
    },
  },
  {
    classes: [],
    data: {
      id: SPECIES_BELONGS_TO_KINGDOM_EDGE_ID,
      source: SPECIES_NODE_ID,
      target: KINGDOM_NODE_ID,
      type: mwSchema.BELONGS_TO_KINGDOM,
    },
  },
  {
    classes: [],
    data: {
      id: SPECIES_BELONGS_TO_CLASS_EDGE_ID,
      source: SPECIES_NODE_ID,
      target: CLASS_NODE_ID,
      type: mwSchema.BELONGS_TO_CLASS,
    },
  },
  {
    classes: [],
    data: {
      id: SUBJECT_IS_SPECIES_EDGE_ID,
      source: SUBJECT_NODE_ID,
      target: SPECIES_NODE_ID,
      type: mwSchema.IS_SPECIES,
    },
  },
  {
    classes: [],
    data: {
      id: SAMPLE_TAKEN_FROM_SUBJECT_EDGE_ID,
      source: SAMPLE_NODE_ID,
      target: SUBJECT_NODE_ID,
      type: mwSchema.SAMPLE_TAKEN_FROM,
    },
  },
  {
    classes: [],
    data: {
      id: COLLECTED_FROM_SUBJECT_EDGE_ID,
      source: COLLECTION_NODE_ID,
      target: SUBJECT_NODE_ID,
      type: mwSchema.COLLECTED_FROM_SUBJECT,
    },
  },
  {
    classes: [],
    data: {
      id: SAMPLED_FROM_SUBJECT_EDGE_ID,
      source: SAMPLE_PREP_NODE_ID,
      target: SUBJECT_NODE_ID,
      type: mwSchema.SAMPLED_FROM_SUBJECT,
    },
  },
  {
    classes: [],
    data: {
      id: COLLECTION_LINKED_TO_METADATA_EDGE_ID,
      source: COLLECTION_NODE_ID,
      target: METADATA_NODE_ID,
      type: mwSchema.COLLECTION_LINKED_TO_METADATA,
    },
  },
  {
    classes: [],
    data: {
      id: SAMPLE_PREP_LINKED_TO_METADATA_EDGE_ID,
      source: SAMPLE_PREP_NODE_ID,
      target: METADATA_NODE_ID,
      type: mwSchema.SAMPLE_PREP_LINKED_TO_METADATA,
    },
  },
  {
    classes: [],
    data: {
      id: TREATMENT_LINKED_TO_METADATA_EDGE_ID,
      source: TREATMENT_NODE_ID,
      target: METADATA_NODE_ID,
      type: mwSchema.TREATMENT_LINKED_TO_METADATA,
    },
  },
];

const ELEMENTS: SchemaCytoscapeElements = [...NODES, ...EDGES];

const STYLESHEET: SchemaCytoscapeStylesheet = [
  ...DEFAULT_STYLESHEET,
  ...mwCytoscapeStyles.ENTITY_STYLESHEET_CLASSES,
  {
    selector: "node",
    style: {
      label: "data(displayLabel)",
      height: SCHEMA_NODE_DIAMETER,
      width: SCHEMA_NODE_DIAMETER,
    },
  },
  {
    selector: "node[label]",
    style: {
      label: "data(displayLabel)",
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
    selector: "edge[label]",
    style: {
      label: "data(type)",
      "font-size": SCHEMA_FONT_SIZE,
    },
  },
  {
    selector: `edge#${PERSON_IS_CONTACT_FOR_PROJECT_EDGE_ID}`,
    style: {},
  },
  {
    selector: `edge#${PROJECT_INCLUDES_STUDY_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${PROJECT_INCLUDES_STUDY_SOURCE_DEG}deg`,
      "target-endpoint": `${PROJECT_INCLUDES_STUDY_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        PROJECT_INCLUDES_STUDY_SOURCE_POS,
        [
          {
            x: PROJECT_INCLUDES_STUDY_SOURCE_POS.x,
            y: PROJECT_INCLUDES_STUDY_SOURCE_POS.y + SCHEMA_EDGE_SPACING / 2,
          },
          {
            x: PROJECT_INCLUDES_STUDY_TARGET_POS.x,
            y: PROJECT_INCLUDES_STUDY_TARGET_POS.y - SCHEMA_EDGE_SPACING / 2,
          },
        ],
        PROJECT_INCLUDES_STUDY_TARGET_POS,
        [true, false],
      ),
    },
  },
  {
    selector: `edge#${PERSON_IS_CONTACT_FOR_STUDY_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${PERSON_IS_CONTACT_FOR_STUDY_SOURCE_DEG}deg`,
      "target-endpoint": `${PERSON_IS_CONTACT_FOR_STUDY_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        PERSON_IS_CONTACT_FOR_STUDY_SOURCE_POS,
        [
          {
            x: PERSON_IS_CONTACT_FOR_STUDY_SOURCE_POS.x,
            y:
              PERSON_IS_CONTACT_FOR_STUDY_SOURCE_POS.y +
              SCHEMA_EDGE_SPACING / 2,
          },
          {
            x: PERSON_IS_CONTACT_FOR_STUDY_TARGET_POS.x,
            y:
              PERSON_IS_CONTACT_FOR_STUDY_TARGET_POS.y -
              SCHEMA_EDGE_SPACING / 2,
          },
        ],
        PERSON_IS_CONTACT_FOR_STUDY_TARGET_POS,
        [false, true],
      ),
    },
  },
  {
    selector: `edge#${STUDY_HAS_VERSION_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 230,
    },
  },
  {
    selector: `edge#${STUDY_REFERENCES_DISEASE_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 300,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${STUDY_REFERENCES_DISEASE_SOURCE_DEG}deg`,
      "target-endpoint": `${STUDY_REFERENCES_DISEASE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        STUDY_REFERENCES_DISEASE_SOURCE_POS,
        [
          {
            x: STUDY_REFERENCES_DISEASE_SOURCE_POS.x + NODE_X_SPACING * 2 * 0.6,
            y: STUDY_REFERENCES_DISEASE_SOURCE_POS.y,
          },
          {
            x: STUDY_REFERENCES_DISEASE_SOURCE_POS.x + NODE_X_SPACING * 2 * 0.6,
            y: STUDY_REFERENCES_DISEASE_TARGET_POS.y,
          },
        ],
        STUDY_REFERENCES_DISEASE_TARGET_POS,
        [false, true],
      ),
    },
  },
  {
    selector: `edge#${STUDY_PRODUCED_ANOVA_EDGE_ID}`,
    style: {},
  },
  {
    selector: `edge#${STUDY_PRODUCED_ANALYSIS_EDGE_ID}`,
    style: {},
  },
  {
    selector: `edge#${STUDY_REFERENCES_METABOLITE_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 200,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${STUDY_REFERENCES_METABOLITE_SOURCE_DEG}deg`,
      "target-endpoint": `${STUDY_REFERENCES_METABOLITE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        STUDY_REFERENCES_METABOLITE_SOURCE_POS,
        [
          {
            x: STUDY_REFERENCES_METABOLITE_SOURCE_POS.x,
            y:
              STUDY_REFERENCES_METABOLITE_SOURCE_POS.y +
              NODE_Y_SPACING -
              SCHEMA_NODE_RADIUS,
          },
          {
            x: STUDY_REFERENCES_METABOLITE_TARGET_POS.x,
            y:
              STUDY_REFERENCES_METABOLITE_TARGET_POS.y -
              NODE_Y_SPACING +
              SCHEMA_NODE_RADIUS,
          },
        ],
        STUDY_REFERENCES_METABOLITE_TARGET_POS,
        [true, false],
      ),
    },
  },
  {
    selector: `edge#${STUDY_REFERENCES_UNIQUE_SA_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 362,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${STUDY_REFERENCES_UNIQUE_SA_SOURCE_DEG}deg`,
      "target-endpoint": `${STUDY_REFERENCES_UNIQUE_SA_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        STUDY_REFERENCES_UNIQUE_SA_SOURCE_POS,
        [
          {
            x:
              STUDY_REFERENCES_UNIQUE_SA_SOURCE_POS.x +
              NODE_X_SPACING * 2 * 0.6,
            y: STUDY_REFERENCES_UNIQUE_SA_SOURCE_POS.y,
          },
          {
            x:
              STUDY_REFERENCES_UNIQUE_SA_SOURCE_POS.x +
              NODE_X_SPACING * 2 * 0.6,
            y: STUDY_REFERENCES_UNIQUE_SA_TARGET_POS.y,
          },
        ],
        STUDY_REFERENCES_UNIQUE_SA_TARGET_POS,
        [true, false],
      ),
    },
  },
  {
    selector: `edge#${STUDY_REFERENCES_SOURCE_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 429,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${STUDY_REFERENCES_SOURCE_SOURCE_DEG}deg`,
      "target-endpoint": `${STUDY_REFERENCES_SOURCE_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        STUDY_REFERENCES_SOURCE_SOURCE_POS,
        [
          {
            x: STUDY_REFERENCES_SOURCE_SOURCE_POS.x + NODE_X_SPACING * 2 * 0.6,
            y: STUDY_REFERENCES_SOURCE_SOURCE_POS.y,
          },
          {
            x: STUDY_REFERENCES_SOURCE_SOURCE_POS.x + NODE_X_SPACING * 2 * 0.6,
            y: STUDY_REFERENCES_SOURCE_TARGET_POS.y,
          },
        ],
        STUDY_REFERENCES_SOURCE_TARGET_POS,
        [true, false],
      ),
    },
  },
  {
    selector: `edge#${ANOVA_REFERENCES_REFMET_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 60,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${ANOVA_REFERENCES_REFMET_SOURCE_DEG}deg`,
      "target-endpoint": `${ANOVA_REFERENCES_REFMET_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        ANOVA_REFERENCES_REFMET_SOURCE_POS,
        [
          {
            x: ANOVA_REFERENCES_REFMET_TARGET_POS.x,
            y: ANOVA_REFERENCES_REFMET_SOURCE_POS.y,
          },
        ],
        ANOVA_REFERENCES_REFMET_TARGET_POS,
      ),
    },
  },
  {
    selector: `edge#${ANALYSIS_USED_ANOVA_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 750,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${ANALYSIS_USED_ANOVA_SOURCE_DEGREE}deg`,
      "target-endpoint": `${ANALYSIS_USED_ANOVA_TARGET_DEGREE}deg`,
      ...getSegmentPropsWithPoints(
        ANALYSIS_USED_ANOVA_SOURCE_POS,
        [
          {
            x: ANALYSIS_USED_ANOVA_SOURCE_POS.x - NODE_X_SPACING * 4,
            y: ANALYSIS_USED_ANOVA_SOURCE_POS.y,
          },
          {
            x:
              ANALYSIS_USED_ANOVA_TARGET_POS.x -
              SCHEMA_NODE_RADIUS -
              NODE_X_SPACING * 2,
            y: ANALYSIS_USED_ANOVA_TARGET_POS.y - SCHEMA_EDGE_SPACING,
          },
          {
            x: ANALYSIS_USED_ANOVA_TARGET_POS.x,
            y: ANALYSIS_USED_ANOVA_TARGET_POS.y - SCHEMA_EDGE_SPACING,
          },
        ],
        ANALYSIS_USED_ANOVA_TARGET_POS,
        [true, true, false],
      ),
    },
  },
  {
    selector: `edge#${METABOLITE_REFERENCES_REFMET_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 80,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${METABOLITE_LINKED_TO_REFMET_SOURCE_DEG}deg`,
      "target-endpoint": `${METABOLITE_LINKED_TO_REFMET_TARGET_DEGREE}deg`,
      ...getSegmentPropsWithPoints(
        METABOLITE_LINKED_TO_REFMET_SOURCE_POS,
        [
          {
            x: METABOLITE_LINKED_TO_REFMET_TARGET_POS.x,
            y: METABOLITE_LINKED_TO_REFMET_SOURCE_POS.y,
          },
        ],
        METABOLITE_LINKED_TO_REFMET_TARGET_POS,
        [true],
      ),
    },
  },
  {
    selector: `edge#${ANALYSIS_DERIVED_FROM_CHROMATOGRAPHY_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 205,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${ANALYSIS_DERIVED_FROM_CHROMATOGRAPHY_SOURCE_DEGREE}deg`,
      "target-endpoint": `${ANALYSIS_DERIVED_FROM_CHROMATOGRAPHY_TARGET_DEGREE}deg`,
      ...getSegmentPropsWithPoints(
        ANALYSIS_DERIVED_FROM_CHROMATOGRAPHY_SOURCE_POS,
        [
          {
            x: ANALYSIS_DERIVED_FROM_CHROMATOGRAPHY_TARGET_POS.x,
            y: ANALYSIS_DERIVED_FROM_CHROMATOGRAPHY_SOURCE_POS.y,
          },
        ],
        ANALYSIS_DERIVED_FROM_CHROMATOGRAPHY_TARGET_POS,
        [false],
      ),
    },
  },
  {
    selector: `edge#${ANALYSIS_REFERENCES_METABOLITE_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 315,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${ANALYSIS_REFERENCES_METABOLITE_SOURCE_DEGREE}deg`,
      "target-endpoint": `${ANALYSIS_REFERENCES_METABOLITE_TARGET_DEGREE}deg`,
      ...getSegmentPropsWithPoints(
        ANALYSIS_REFERENCES_METABOLITE_SOURCE_POS,
        [
          {
            x: ANALYSIS_REFERENCES_METABOLITE_TARGET_POS.x,
            y: ANALYSIS_REFERENCES_METABOLITE_SOURCE_POS.y,
          },
        ],
        ANALYSIS_REFERENCES_METABOLITE_TARGET_POS,
        [true],
      ),
    },
  },
  {
    selector: `edge#${ANALYSIS_DERIVED_FROM_NMR_EDGE_ID}`,
    style: {},
  },
  {
    selector: `edge#${ANALYSIS_DERIVED_FROM_MS_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 205,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${ANALYSIS_DERIVED_FROM_MS_SOURCE_DEGREE}deg`,
      "target-endpoint": `${ANALYSIS_DERIVED_FROM_MS_TARGET_DEGREE}deg`,
      ...getSegmentPropsWithPoints(
        ANALYSIS_DERIVED_FROM_MS_SOURCE_POS,
        [
          {
            x: ANALYSIS_DERIVED_FROM_MS_TARGET_POS.x,
            y: ANALYSIS_DERIVED_FROM_MS_SOURCE_POS.y,
          },
        ],
        ANALYSIS_DERIVED_FROM_MS_TARGET_POS,
        [true],
      ),
    },
  },
  {
    selector: `edge#${UNIQUE_SA_SAMPLED_FROM_SOURCE_EDGE_ID}`,
    style: {},
  },
  {
    selector: `edge#${SAMPLE_SAMPLED_FROM_SOURCE_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 200,
    },
  },
  {
    selector: `edge#${SAMPLE_HAS_FACTORS_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 210,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${SAMPLE_HAS_FACTORS_SOURCE_DEGREE}deg`,
      "target-endpoint": `${SAMPLE_HAS_FACTORS_TARGET_DEGREE}deg`,
      ...getSegmentPropsWithPoints(
        SAMPLE_HAS_FACTORS_SOURCE_POS,
        [
          {
            x: SAMPLE_HAS_FACTORS_TARGET_POS.x,
            y: SAMPLE_HAS_FACTORS_SOURCE_POS.y,
          },
        ],
        SAMPLE_HAS_FACTORS_TARGET_POS,
      ),
    },
  },
  {
    selector: `edge#${SAMPLE_USES_FACTOR_LEVEL_EDGE_ID}`,
    style: {},
  },
  {
    selector: `edge#${FACTOR_LEVEL_HAS_FACTOR_EDGE_ID}`,
    style: {},
  },
  {
    selector: `edge#${SAMPLED_FROM_SPECIES_EDGE_ID}`,
    style: {},
  },
  {
    selector: `edge#${SPECIES_BELONGS_TO_KINGDOM_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 90,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${SPECIES_BELONGS_TO_KINGDOM_SOURCE_DEGREE}deg`,
      "target-endpoint": `${SPECIES_BELONGS_TO_KINGDOM_TARGET_DEGREE}deg`,
      ...getSegmentPropsWithPoints(
        SPECIES_BELONGS_TO_KINGDOM_SOURCE_POS,
        [
          {
            x: SPECIES_BELONGS_TO_KINGDOM_SOURCE_POS.x,
            y:
              SPECIES_BELONGS_TO_KINGDOM_SOURCE_POS.y +
              SCHEMA_NODE_RADIUS -
              NODE_Y_SPACING / 2,
          },
          {
            x: SPECIES_BELONGS_TO_KINGDOM_TARGET_POS.x,
            y:
              SPECIES_BELONGS_TO_KINGDOM_TARGET_POS.y -
              SCHEMA_NODE_RADIUS +
              NODE_Y_SPACING / 2,
          },
        ],
        SPECIES_BELONGS_TO_KINGDOM_TARGET_POS,
        [false, true],
      ),
    },
  },
  {
    selector: `edge#${SPECIES_BELONGS_TO_CLASS_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 90,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${SPECIES_BELONGS_TO_CLASS_SOURCE_DEGREE}deg`,
      "target-endpoint": `${SPECIES_BELONGS_TO_CLASS_TARGET_DEGREE}deg`,
      ...getSegmentPropsWithPoints(
        SPECIES_BELONGS_TO_CLASS_SOURCE_POS,
        [
          {
            x: SPECIES_BELONGS_TO_CLASS_SOURCE_POS.x,
            y:
              SPECIES_BELONGS_TO_CLASS_SOURCE_POS.y +
              SCHEMA_NODE_RADIUS -
              NODE_Y_SPACING / 2,
          },
          {
            x: SPECIES_BELONGS_TO_CLASS_TARGET_POS.x,
            y:
              SPECIES_BELONGS_TO_CLASS_TARGET_POS.y -
              SCHEMA_NODE_RADIUS +
              NODE_Y_SPACING / 2,
          },
        ],
        SPECIES_BELONGS_TO_CLASS_TARGET_POS,
        [true, false],
      ),
    },
  },
  {
    selector: `edge#${SUBJECT_IS_SPECIES_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${SUBJECT_IS_SPECIES_SOURCE_DEGREE}deg`,
      "target-endpoint": `${SUBJECT_IS_SPECIES_TARGET_DEGREE}deg`,
      ...getSegmentPropsWithPoints(
        SUBJECT_IS_SPECIES_SOURCE_POS,
        [
          {
            x: SUBJECT_IS_SPECIES_SOURCE_POS.x,
            y: SUBJECT_IS_SPECIES_TARGET_POS.y,
          },
        ],
        SUBJECT_IS_SPECIES_TARGET_POS,
      ),
    },
  },
  {
    selector: `edge#${SAMPLE_TAKEN_FROM_SUBJECT_EDGE_ID}`,
    style: {},
  },
  {
    selector: `edge#${COLLECTED_FROM_SUBJECT_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 110,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${COLLECTED_FROM_SUBJECT_SOURCE_DEGREE}deg`,
      "target-endpoint": `${COLLECTED_FROM_SUBJECT_TARGET_DEGREE}deg`,
      ...getSegmentPropsWithPoints(
        COLLECTED_FROM_SUBJECT_SOURCE_POS,
        [
          {
            x: COLLECTED_FROM_SUBJECT_SOURCE_POS.x - NODE_X_SPACING * 0.5,
            y: COLLECTED_FROM_SUBJECT_SOURCE_POS.y,
          },
          {
            x: COLLECTED_FROM_SUBJECT_SOURCE_POS.x - NODE_X_SPACING * 0.5,
            y: COLLECTED_FROM_SUBJECT_TARGET_POS.y,
          },
        ],
        COLLECTED_FROM_SUBJECT_TARGET_POS,
        [false, true],
      ),
    },
  },
  {
    selector: `edge#${SAMPLED_FROM_SUBJECT_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 45,
    },
  },
  {
    selector: `edge#${COLLECTION_LINKED_TO_METADATA_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 70,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${COLLECTION_LINKED_TO_METADATA_SOURCE_DEGREE}deg`,
      "target-endpoint": `${COLLECTION_LINKED_TO_METADATA_TARGET_DEGREE}deg`,
      ...getSegmentPropsWithPoints(
        COLLECTION_LINKED_TO_METADATA_SOURCE_POS,
        [
          {
            x: COLLECTION_LINKED_TO_METADATA_TARGET_POS.x,
            y: COLLECTION_LINKED_TO_METADATA_SOURCE_POS.y,
          },
        ],
        COLLECTION_LINKED_TO_METADATA_TARGET_POS,
        [true],
      ),
    },
  },
  {
    selector: `edge#${SAMPLE_PREP_LINKED_TO_METADATA_EDGE_ID}`,
    style: {},
  },
  {
    selector: `edge#${TREATMENT_LINKED_TO_METADATA_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 70,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
      "source-endpoint": `${TREATMENT_LINKED_TO_METADATA_SOURCE_DEGREE}deg`,
      "target-endpoint": `${TREATMENT_LINKED_TO_METADATA_TARGET_DEGREE}deg`,
      ...getSegmentPropsWithPoints(
        TREATMENT_LINKED_TO_METADATA_SOURCE_POS,
        [
          {
            x: TREATMENT_LINKED_TO_METADATA_TARGET_POS.x,
            y: TREATMENT_LINKED_TO_METADATA_SOURCE_POS.y,
          },
        ],
        TREATMENT_LINKED_TO_METADATA_TARGET_POS,
        [false],
      ),
    },
  },
];

const LAYOUT = {
  name: "preset",
};

const mwPreset = {
  ELEMENTS: ELEMENTS,
  LAYOUT: LAYOUT,
  STYLESHEET: STYLESHEET,
};

export default mwPreset;
