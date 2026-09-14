import c2m2Schema from "@/lib/text2cypher/neo4j/schemas/c2m2";
import type {
  SchemaCytoscapeStylesheet,
  SchemaCytoscapeElements,
} from "@/lib/text2cypher/schema/types";

import c2m2CytoscapeStyles, {
  ADMIN_NODE_LABEL,
  CONTAINER_NODE_LABEL,
  FILE_NODE_LABEL,
  FILE_RELATED_NODE_LABEL,
  BIOSAMPLE_NODE_LABEL,
  BIOSAMPLE_RELATED_NODE_LABEL,
  SUBJECT_NODE_LABEL,
  SUBJECT_RELATED_NODE_LABEL,
  TERM_NODE_LABEL,
  ADMIN_NODE_COLOR,
  CONTAINER_NODE_COLOR,
  FILE_NODE_COLOR,
  SUBJECT_NODE_COLOR,
  BIOSAMPLE_NODE_COLOR,
  TERM_NODE_COLOR,
  FILE_RELATED_NODE_COLOR,
  SUBJECT_RELATED_NODE_COLOR,
  BIOSAMPLE_RELATED_NODE_COLOR,
} from "../styles/c2m2";

import {
  CHART_BG_COLOR,
  DEFAULT_STYLESHEET,
  EDGE_DIST_ENDPOINTS,
  getEdgePoint,
  getSegmentPropsWithPoints,
} from "../styles/defaults";

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
const BIOFLUID_NODE_ID = "biofluid-label";
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
const BIOSAMPLE_SAMPLED_FROM_BIOFLUID_EDGE_ID =
  "biosample-sampled-from-biofluid";
const SUBSTANCE_ASSOCIATED_WITH_COMPOUND_EDGE_ID =
  "substance-associated-with-compound";
const PROTEIN_HAS_SOURCE_TAXONOMY_EDGE_ID = "protein-has-source-taxonomy";
const GENE_HAS_SOURCE_TAXONOMY_EDGE_ID = "gene-has-source-taxonomy";
const GENE_ASSOCIATED_WITH_PHENOTYPE_EDGE_ID = "gene-associated-with-phenotype";
const PHENOTYPE_ASSOCIATED_WITH_DISEASE_EDGE_ID =
  "phenotype-associated-with-disease";

const FILE_POS = { x: 0, y: 0 };
const ID_NAMESPACE_POS = { x: FILE_POS.x, y: -120 };
const DCC_POS = { x: 0, y: -220 };
const COLLECTION_POS = { x: 300, y: 250 };
const PROJECT_POS = { x: -1 * COLLECTION_POS.x, y: COLLECTION_POS.y };
const ANALYSIS_TYPE_POS = { x: 215, y: -38 };
const ASSAY_TYPE_POS = { x: -1 * ANALYSIS_TYPE_POS.x, y: ANALYSIS_TYPE_POS.y };
const FILE_FORMAT_POS = { x: 150, y: -70 };
const DATA_TYPE_POS = { x: -1 * FILE_FORMAT_POS.x, y: FILE_FORMAT_POS.y };
const BIOSAMPLE_POS = { x: 230, y: 566 };
const SUBJECT_POS = { x: -1 * BIOSAMPLE_POS.x, y: BIOSAMPLE_POS.y };
const SUBJECT_ETHNICITY_POS = { x: SUBJECT_POS.x - 175, y: SUBJECT_POS.y + 80 };
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
  y: BIOSAMPLE_POS.y + 80,
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
const BIOFLUID_POS = {
  x: DISEASE_POS.x,
  y: DISEASE_POS.y + TERM_NODE_Y_SPACING * 3,
};
const ANATOMY_POS = {
  x: NCBI_TAXONOMY_POS.x,
  y: DISEASE_POS.y + TERM_NODE_Y_SPACING * 4,
};
const ALL_TERMS_NODE_POS = { x: 450, y: COLLECTION_POS.y };
const ARTIFICIAL_COLLECTION_NODE_POS = {
  x: -1 * ALL_TERMS_NODE_POS.x,
  y: COLLECTION_POS.y,
};

const ID_NAMESPACE_CONTAINS_PROJECT_SOURCE_DEG = -90;
const ID_NAMESPACE_CONTAINS_PROJECT_TARGET_DEG = 0;
const ID_NAMESPACE_CONTAINS_PROJECT_SOURCE_POS = getEdgePoint(
  ID_NAMESPACE_POS,
  ID_NAMESPACE_CONTAINS_PROJECT_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const ID_NAMESPACE_CONTAINS_PROJECT_TARGET_POS = getEdgePoint(
  PROJECT_POS,
  ID_NAMESPACE_CONTAINS_PROJECT_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const ID_NAMESPACE_CONTAINS_COLLECTION_SOURCE_DEG = 90;
const ID_NAMESPACE_CONTAINS_COLLECTION_TARGET_DEG = 0;
const ID_NAMESPACE_CONTAINS_COLLECTION_SOURCE_POS = getEdgePoint(
  ID_NAMESPACE_POS,
  ID_NAMESPACE_CONTAINS_COLLECTION_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const ID_NAMESPACE_CONTAINS_COLLECTION_TARGET_POS = getEdgePoint(
  COLLECTION_POS,
  ID_NAMESPACE_CONTAINS_COLLECTION_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const ID_NAMESPACE_CONTAINS_SUBJECT_SOURCE_DEG = -10;
const ID_NAMESPACE_CONTAINS_SUBJECT_TARGET_DEG = -90;
const ID_NAMESPACE_CONTAINS_SUBJECT_SOURCE_POS = getEdgePoint(
  ID_NAMESPACE_POS,
  ID_NAMESPACE_CONTAINS_SUBJECT_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const ID_NAMESPACE_CONTAINS_SUBJECT_TARGET_POS = getEdgePoint(
  SUBJECT_POS,
  ID_NAMESPACE_CONTAINS_SUBJECT_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const ID_NAMESPACE_CONTAINS_BIOSAMPLE_SOURCE_DEG = 10;
const ID_NAMESPACE_CONTAINS_BIOSAMPLE_TARGET_DEG = 90;
const ID_NAMESPACE_CONTAINS_BIOSAMPLE_SOURCE_POS = getEdgePoint(
  ID_NAMESPACE_POS,
  ID_NAMESPACE_CONTAINS_BIOSAMPLE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const ID_NAMESPACE_CONTAINS_BIOSAMPLE_TARGET_POS = getEdgePoint(
  BIOSAMPLE_POS,
  ID_NAMESPACE_CONTAINS_BIOSAMPLE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const PROJECT_CONTAINS_FILE_SOURCE_DEG = 10;
const PROJECT_CONTAINS_FILE_TARGET_DEG = -90;
const PROJECT_CONTAINS_FILE_SOURCE_POS = getEdgePoint(
  PROJECT_POS,
  PROJECT_CONTAINS_FILE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const PROJECT_CONTAINS_FILE_TARGET_POS = getEdgePoint(
  FILE_POS,
  PROJECT_CONTAINS_FILE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const PROJECT_CONTAINS_SUBJECT_SOURCE_DEG = 180;
const PROJECT_CONTAINS_SUBJECT_TARGET_DEG = -100;
const PROJECT_CONTAINS_SUBJECT_SOURCE_POS = getEdgePoint(
  PROJECT_POS,
  PROJECT_CONTAINS_SUBJECT_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const PROJECT_CONTAINS_SUBJECT_TARGET_POS = getEdgePoint(
  SUBJECT_POS,
  PROJECT_CONTAINS_SUBJECT_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const PROJECT_CONTAINS_BIOSAMPLE_SOURCE_DEG = -100;
const PROJECT_CONTAINS_BIOSAMPLE_TARGET_DEG = 180;
const PROJECT_CONTAINS_BIOSAMPLE_SOURCE_POS = getEdgePoint(
  PROJECT_POS,
  PROJECT_CONTAINS_BIOSAMPLE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const PROJECT_CONTAINS_BIOSAMPLE_TARGET_POS = getEdgePoint(
  BIOSAMPLE_POS,
  PROJECT_CONTAINS_BIOSAMPLE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const COLLECTION_CONTAINS_FILE_SOURCE_DEG = -10;
const COLLECTION_CONTAINS_FILE_TARGET_DEG = 90;
const COLLECTION_CONTAINS_FILE_SOURCE_POS = getEdgePoint(
  COLLECTION_POS,
  COLLECTION_CONTAINS_FILE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const COLLECTION_CONTAINS_FILE_TARGET_POS = getEdgePoint(
  FILE_POS,
  COLLECTION_CONTAINS_FILE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const COLLECTION_CONTAINS_SUBJECT_SOURCE_DEG = 90;
const COLLECTION_CONTAINS_SUBJECT_TARGET_DEG = 180;
const COLLECTION_CONTAINS_SUBJECT_SOURCE_POS = getEdgePoint(
  COLLECTION_POS,
  COLLECTION_CONTAINS_SUBJECT_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const COLLECTION_CONTAINS_SUBJECT_TARGET_POS = getEdgePoint(
  SUBJECT_POS,
  COLLECTION_CONTAINS_SUBJECT_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const COLLECTION_CONTAINS_BIOSAMPLE_SOURCE_DEG = 180;
const COLLECTION_CONTAINS_BIOSAMPLE_TARGET_DEG = 100;
const COLLECTION_CONTAINS_BIOSAMPLE_SOURCE_POS = getEdgePoint(
  COLLECTION_POS,
  COLLECTION_CONTAINS_BIOSAMPLE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const COLLECTION_CONTAINS_BIOSAMPLE_TARGET_POS = getEdgePoint(
  BIOSAMPLE_POS,
  COLLECTION_CONTAINS_BIOSAMPLE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const FILE_DESCRIBES_SUBJECT_SOURCE_DEG = -100;
const FILE_DESCRIBES_SUBJECT_TARGET_DEG = 0;
const FILE_DESCRIBES_SUBJECT_SOURCE_POS = getEdgePoint(
  FILE_POS,
  FILE_DESCRIBES_SUBJECT_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const FILE_DESCRIBES_SUBJECT_TARGET_POS = getEdgePoint(
  SUBJECT_POS,
  FILE_DESCRIBES_SUBJECT_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const FILE_DESCRIBES_BIOSAMPLE_SOURCE_DEG = 100;
const FILE_DESCRIBES_BIOSAMPLE_TARGET_DEG = 0;
const FILE_DESCRIBES_BIOSAMPLE_SOURCE_POS = getEdgePoint(
  FILE_POS,
  FILE_DESCRIBES_BIOSAMPLE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const FILE_DESCRIBES_BIOSAMPLE_TARGET_POS = getEdgePoint(
  BIOSAMPLE_POS,
  FILE_DESCRIBES_BIOSAMPLE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const FILE_IS_DATA_TYPE_SOURCE_DEG = -10;
const FILE_IS_DATA_TYPE_TARGET_DEG = 90;
const FILE_IS_DATA_TYPE_SOURCE_POS = getEdgePoint(
  FILE_POS,
  FILE_IS_DATA_TYPE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const FILE_IS_DATA_TYPE_TARGET_POS = getEdgePoint(
  DATA_TYPE_POS,
  FILE_IS_DATA_TYPE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const FILE_GENERATED_BY_ASSAY_TYPE_SOURCE_DEG = -20;
const FILE_GENERATED_BY_ASSAY_TYPE_TARGET_DEG = 90;
const FILE_GENERATED_BY_ASSAY_TYPE_SOURCE_POS = getEdgePoint(
  FILE_POS,
  FILE_GENERATED_BY_ASSAY_TYPE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const FILE_GENERATED_BY_ASSAY_TYPE_TARGET_POS = getEdgePoint(
  ASSAY_TYPE_POS,
  FILE_GENERATED_BY_ASSAY_TYPE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const FILE_IS_FORMAT_SOURCE_DEG = 10;
const FILE_IS_FORMAT_TARGET_DEG = -90;
const FILE_IS_FORMAT_SOURCE_POS = getEdgePoint(
  FILE_POS,
  FILE_IS_FORMAT_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const FILE_IS_FORMAT_TARGET_POS = getEdgePoint(
  FILE_FORMAT_POS,
  FILE_IS_FORMAT_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const FILE_GENERATED_BY_ANALYSIS_TYPE_SOURCE_DEG = 20;
const FILE_GENERATED_BY_ANALYSIS_TYPE_TARGET_DEG = -90;
const FILE_GENERATED_BY_ANALYSIS_TYPE_SOURCE_POS = getEdgePoint(
  FILE_POS,
  FILE_GENERATED_BY_ANALYSIS_TYPE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const FILE_GENERATED_BY_ANALYSIS_TYPE_TARGET_POS = getEdgePoint(
  ANALYSIS_TYPE_POS,
  FILE_GENERATED_BY_ANALYSIS_TYPE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const BIOSAMPLE_TESTED_FOR_PHENOTYPE_SOURCE_DEG = -90;
const BIOSAMPLE_TESTED_FOR_PHENOTYPE_TARGET_DEG = 90;
const BIOSAMPLE_TESTED_FOR_PHENOTYPE_SOURCE_POS = getEdgePoint(
  BIOSAMPLE_POS,
  BIOSAMPLE_TESTED_FOR_PHENOTYPE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const BIOSAMPLE_TESTED_FOR_PHENOTYPE_TARGET_POS = getEdgePoint(
  PHENOTYPE_POS,
  BIOSAMPLE_TESTED_FOR_PHENOTYPE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const BIOSAMPLE_TESTED_FOR_DISEASE_SOURCE_DEG = -90;
const BIOSAMPLE_TESTED_FOR_DISEASE_TARGET_DEG = 90;
const BIOSAMPLE_TESTED_FOR_DISEASE_SOURCE_POS = getEdgePoint(
  BIOSAMPLE_POS,
  BIOSAMPLE_TESTED_FOR_DISEASE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const BIOSAMPLE_TESTED_FOR_DISEASE_TARGET_POS = getEdgePoint(
  DISEASE_POS,
  BIOSAMPLE_TESTED_FOR_DISEASE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const BIOSAMPLE_SAMPLED_FROM_ANATOMY_SOURCE_DEG = -90;
const BIOSAMPLE_SAMPLED_FROM_ANATOMY_TARGET_DEG = 90;
const BIOSAMPLE_SAMPLED_FROM_ANATOMY_SOURCE_POS = getEdgePoint(
  BIOSAMPLE_POS,
  BIOSAMPLE_SAMPLED_FROM_ANATOMY_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const BIOSAMPLE_SAMPLED_FROM_ANATOMY_TARGET_POS = getEdgePoint(
  ANATOMY_POS,
  BIOSAMPLE_SAMPLED_FROM_ANATOMY_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const BIOSAMPLE_SAMPLED_FROM_BIOFLUID_SOURCE_DEG = -90;
const BIOSAMPLE_SAMPLED_FROM_BIOFLUID_TARGET_DEG = 90;
const BIOSAMPLE_SAMPLED_FROM_BIOFLUID_SOURCE_POS = getEdgePoint(
  BIOSAMPLE_POS,
  BIOSAMPLE_SAMPLED_FROM_BIOFLUID_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const BIOSAMPLE_SAMPLED_FROM_BIOFLUID_TARGET_POS = getEdgePoint(
  BIOFLUID_POS,
  BIOSAMPLE_SAMPLED_FROM_BIOFLUID_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const SUBJECT_IS_ETHNICITY_SOURCE_DEG = -160;
const SUBJECT_IS_ETHNICITY_TARGET_DEG = 90;
const SUBJECT_IS_ETHNICITY_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_IS_ETHNICITY_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const SUBJECT_IS_ETHNICITY_TARGET_POS = getEdgePoint(
  SUBJECT_ETHNICITY_POS,
  SUBJECT_IS_ETHNICITY_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const SUBJECT_IS_SEX_SOURCE_DEG = -170;
const SUBJECT_IS_SEX_TARGET_DEG = 90;
const SUBJECT_IS_SEX_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_IS_SEX_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const SUBJECT_IS_SEX_TARGET_POS = getEdgePoint(
  SUBJECT_SEX_POS,
  SUBJECT_IS_SEX_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const SUBJECT_IS_RACE_SOURCE_DEG = 170;
const SUBJECT_IS_RACE_TARGET_DEG = -90;
const SUBJECT_IS_RACE_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_IS_RACE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const SUBJECT_IS_RACE_TARGET_POS = getEdgePoint(
  SUBJECT_RACE_POS,
  SUBJECT_IS_RACE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const SUBJECT_IS_GRANULARITY_SOURCE_DEG = 160;
const SUBJECT_IS_GRANULARITY_TARGET_DEG = -90;
const SUBJECT_IS_GRANULARITY_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_IS_GRANULARITY_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const SUBJECT_IS_GRANULARITY_TARGET_POS = getEdgePoint(
  SUBJECT_GRANULARITY_POS,
  SUBJECT_IS_GRANULARITY_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const SUBJECT_TESTED_FOR_PHENOTYPE_SOURCE_DEG = 90;
const SUBJECT_TESTED_FOR_PHENOTYPE_TARGET_DEG = -90;
const SUBJECT_TESTED_FOR_PHENOTYPE_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_TESTED_FOR_PHENOTYPE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const SUBJECT_TESTED_FOR_PHENOTYPE_TARGET_POS = getEdgePoint(
  PHENOTYPE_POS,
  SUBJECT_TESTED_FOR_PHENOTYPE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const SUBJECT_TESTED_FOR_DISEASE_SOURCE_DEG = 90;
const SUBJECT_TESTED_FOR_DISEASE_TARGET_DEG = -90;
const SUBJECT_TESTED_FOR_DISEASE_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_TESTED_FOR_DISEASE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const SUBJECT_TESTED_FOR_DISEASE_TARGET_POS = getEdgePoint(
  DISEASE_POS,
  SUBJECT_TESTED_FOR_DISEASE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const SUBJECT_ASSOCIATED_WITH_TAXONOMY_SOURCE_DEG = 90;
const SUBJECT_ASSOCIATED_WITH_TAXONOMY_TARGET_DEG = -90;
const SUBJECT_ASSOCIATED_WITH_TAXONOMY_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_ASSOCIATED_WITH_TAXONOMY_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const SUBJECT_ASSOCIATED_WITH_TAXONOMY_TARGET_POS = getEdgePoint(
  NCBI_TAXONOMY_POS,
  SUBJECT_ASSOCIATED_WITH_TAXONOMY_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const SUBJECT_ASSOCIATED_WITH_SUBSTANCE_SOURCE_DEG = 90;
const SUBJECT_ASSOCIATED_WITH_SUBSTANCE_TARGET_DEG = -90;
const SUBJECT_ASSOCIATED_WITH_SUBSTANCE_SOURCE_POS = getEdgePoint(
  SUBJECT_POS,
  SUBJECT_ASSOCIATED_WITH_SUBSTANCE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const SUBJECT_ASSOCIATED_WITH_SUBSTANCE_TARGET_POS = getEdgePoint(
  SUBSTANCE_POS,
  SUBJECT_ASSOCIATED_WITH_SUBSTANCE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_SOURCE_DEG = -90;
const BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_TARGET_DEG = 90;
const BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_SOURCE_POS = getEdgePoint(
  BIOSAMPLE_POS,
  BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_TARGET_POS = getEdgePoint(
  SUBSTANCE_POS,
  BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const BIOSAMPLE_ASSOCIATED_WITH_GENE_SOURCE_DEG = -90;
const BIOSAMPLE_ASSOCIATED_WITH_GENE_TARGET_DEG = 90;
const BIOSAMPLE_ASSOCIATED_WITH_GENE_SOURCE_POS = getEdgePoint(
  BIOSAMPLE_POS,
  BIOSAMPLE_ASSOCIATED_WITH_GENE_SOURCE_DEG,
  SCHEMA_NODE_RADIUS,
);
const BIOSAMPLE_ASSOCIATED_WITH_GENE_TARGET_POS = getEdgePoint(
  GENE_POS,
  BIOSAMPLE_ASSOCIATED_WITH_GENE_TARGET_DEG,
  SCHEMA_NODE_RADIUS,
);

const SUBSTANCE_ASSOCIATED_WITH_TAXONOMY_SOURCE_DEG = 225;
const SUBSTANCE_ASSOCIATED_WITH_TAXONOMY_TARGET_DEG = 90;

const NODES: SchemaCytoscapeElements = [
  {
    classes: [
      c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.ID_NAMESPACE) || "",
    ],
    position: ID_NAMESPACE_POS,
    locked: true,
    data: {
      id: ID_NAMESPACE_NODE_ID,
      label: ADMIN_NODE_LABEL,
      displayLabel: c2m2Schema.ID_NAMESPACE,
    },
  },
  {
    classes: [c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.DCC) || ""],
    position: DCC_POS,
    locked: true,
    data: {
      id: DCC_NODE_ID,
      label: ADMIN_NODE_LABEL,
      displayLabel: c2m2Schema.DCC,
    },
  },
  {
    classes: [c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.PROJECT) || ""],
    position: PROJECT_POS,
    locked: true,
    data: {
      id: PROJECT_NODE_ID,
      label: CONTAINER_NODE_LABEL,
      displayLabel: c2m2Schema.PROJECT,
    },
  },
  {
    classes: [
      c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.COLLECTION) || "",
    ],
    position: COLLECTION_POS,
    locked: true,
    data: {
      id: COLLECTION_NODE_ID,
      label: CONTAINER_NODE_LABEL,
      displayLabel: c2m2Schema.COLLECTION,
    },
  },
  {
    classes: [
      c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.ASSAY_TYPE) || "",
    ],
    position: ASSAY_TYPE_POS,
    locked: true,
    data: {
      id: ASSAY_TYPE_NODE_ID,
      label: FILE_RELATED_NODE_LABEL,
      displayLabel: c2m2Schema.ASSAY_TYPE,
    },
  },
  {
    classes: [
      c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.DATA_TYPE) || "",
    ],
    position: DATA_TYPE_POS,
    locked: true,
    data: {
      id: DATA_TYPE_NODE_ID,
      label: FILE_RELATED_NODE_LABEL,
      displayLabel: c2m2Schema.DATA_TYPE,
    },
  },
  {
    classes: [
      c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.FILE_FORMAT) || "",
    ],
    position: FILE_FORMAT_POS,
    locked: true,
    data: {
      id: FILE_FORMAT_NODE_ID,
      label: FILE_RELATED_NODE_LABEL,
      displayLabel: c2m2Schema.FILE_FORMAT,
    },
  },
  {
    classes: [
      c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.ANALYSIS_TYPE) || "",
    ],
    position: ANALYSIS_TYPE_POS,
    locked: true,
    data: {
      id: ANALYSIS_TYPE_NODE_ID,
      label: FILE_RELATED_NODE_LABEL,
      displayLabel: c2m2Schema.ANALYSIS_TYPE,
    },
  },
  {
    classes: [c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.FILE) || ""],
    position: FILE_POS,
    locked: true,
    data: {
      id: FILE_NODE_ID,
      label: FILE_NODE_LABEL,
      displayLabel: c2m2Schema.FILE,
    },
  },
  {
    classes: [c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.SUBJECT) || ""],
    position: SUBJECT_POS,
    locked: true,
    data: {
      id: SUBJECT_NODE_ID,
      label: SUBJECT_NODE_LABEL,
      displayLabel: c2m2Schema.SUBJECT,
    },
  },
  {
    classes: [
      c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.SUBJECT_SEX) || "",
    ],
    position: SUBJECT_SEX_POS,
    locked: true,
    data: {
      id: SUBJECT_SEX_NODE_ID,
      label: SUBJECT_RELATED_NODE_LABEL,
      displayLabel: c2m2Schema.SUBJECT_SEX,
    },
  },
  {
    classes: [
      c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.SUBJECT_ETHNICITY) ||
      "",
    ],
    position: SUBJECT_ETHNICITY_POS,
    locked: true,
    data: {
      id: SUBJECT_ETHNICITY_NODE_ID,
      label: SUBJECT_RELATED_NODE_LABEL,
      displayLabel: c2m2Schema.SUBJECT_ETHNICITY,
    },
  },
  {
    classes: [
      c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.SUBJECT_RACE) || "",
    ],
    position: SUBJECT_RACE_POS,
    locked: true,
    data: {
      id: SUBJECT_RACE_NODE_ID,
      label: SUBJECT_RELATED_NODE_LABEL,
      displayLabel: c2m2Schema.SUBJECT_RACE,
    },
  },
  {
    classes: [
      c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.SUBJECT_GRANULARITY) ||
      "",
    ],
    position: SUBJECT_GRANULARITY_POS,
    locked: true,
    data: {
      id: SUBJECT_GRANULARITY_NODE_ID,
      label: SUBJECT_RELATED_NODE_LABEL,
      displayLabel: c2m2Schema.SUBJECT_GRANULARITY,
    },
  },
  {
    classes: [
      c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.BIOSAMPLE) || "",
    ],
    position: BIOSAMPLE_POS,
    locked: true,
    data: {
      id: BIOSAMPLE_NODE_ID,
      label: BIOSAMPLE_NODE_LABEL,
      displayLabel: c2m2Schema.BIOSAMPLE,
    },
  },
  {
    classes: [
      c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.SAMPLE_PREP_METHOD) ||
      "",
    ],
    position: SAMPLE_PREP_METHOD_POS,
    locked: true,
    data: {
      id: SAMPLE_PREP_METHOD_NODE_ID,
      label: BIOSAMPLE_RELATED_NODE_LABEL,
      displayLabel: c2m2Schema.SAMPLE_PREP_METHOD,
    },
  },
  {
    classes: [
      c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.SUBSTANCE) || "",
    ],
    position: SUBSTANCE_POS,
    locked: true,
    data: {
      id: SUBSTANCE_NODE_ID,
      label: TERM_NODE_LABEL,
      displayLabel: c2m2Schema.SUBSTANCE,
    },
  },
  {
    classes: [
      c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.BIOFLUID) || "",
    ],
    position: BIOFLUID_POS,
    locked: true,
    data: {
      id: BIOFLUID_NODE_ID,
      label: TERM_NODE_LABEL,
      displayLabel: c2m2Schema.BIOFLUID,
    },
  },
  {
    classes: [
      c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.COMPOUND) || "",
    ],
    position: COMPOUND_POS,
    locked: true,
    data: {
      id: COMPOUND_NODE_ID,
      label: TERM_NODE_LABEL,
      displayLabel: c2m2Schema.COMPOUND,
    },
  },
  {
    classes: [c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.PROTEIN) || ""],
    position: PROTEIN_POS,
    locked: true,
    data: {
      id: PROTEIN_NODE_ID,
      label: TERM_NODE_LABEL,
      displayLabel: c2m2Schema.PROTEIN,
    },
  },
  {
    classes: [
      c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.NCBI_TAXONOMY) || "",
    ],
    position: NCBI_TAXONOMY_POS,
    locked: true,
    data: {
      id: NCBI_TAXONOMY_NODE_ID,
      label: TERM_NODE_LABEL,
      displayLabel: c2m2Schema.NCBI_TAXONOMY,
    },
  },
  {
    classes: [c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.GENE) || ""],
    position: GENE_POS,
    locked: true,
    data: {
      id: GENE_NODE_ID,
      label: TERM_NODE_LABEL,
      displayLabel: c2m2Schema.GENE,
    },
  },
  {
    classes: [
      c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.PHENOTYPE) || "",
    ],
    position: PHENOTYPE_POS,
    locked: true,
    data: {
      id: PHENOTYPE_NODE_ID,
      label: TERM_NODE_LABEL,
      displayLabel: c2m2Schema.PHENOTYPE,
    },
  },
  {
    classes: [c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.DISEASE) || ""],
    position: DISEASE_POS,
    locked: true,
    data: {
      id: DISEASE_NODE_ID,
      label: TERM_NODE_LABEL,
      displayLabel: c2m2Schema.DISEASE,
    },
  },
  {
    classes: [c2m2CytoscapeStyles.NODE_CLASS_MAP.get(c2m2Schema.ANATOMY) || ""],
    position: ANATOMY_POS,
    locked: true,
    data: {
      id: ANATOMY_NODE_ID,
      label: TERM_NODE_LABEL,
      displayLabel: c2m2Schema.ANATOMY,
    },
  },
  {
    classes: ["all-terms-node", "dashed"],
    position: ALL_TERMS_NODE_POS,
    locked: true,
    data: {
      id: ALL_TERM_NODES_NODE_ID,
      displayLabel: "All Term Nodes",
      // label: "All Term Nodes",
    },
  },
  {
    classes: ["artificial-collection-node", "dashed"],
    position: ARTIFICIAL_COLLECTION_NODE_POS,
    locked: true,
    data: {
      id: ARTIFICIAL_COLLECTION_NODE_ID,
      displayLabel: "Collection",
      // label: "Collection",
    },
  },
];

const EDGES: SchemaCytoscapeElements = [
  {
    classes: ["admin-relationship", "horizontal-text"],
    data: {
      id: DCC_REGISTERED_ID_NAMESPACE_EDGE_ID,
      source: DCC_NODE_ID,
      target: ID_NAMESPACE_NODE_ID,
      type: c2m2Schema.REGISTERED,
    },
  },
  {
    classes: ["admin-relationship"],
    data: {
      id: ID_NAMESPACE_CONTAINS_PROJECT_EDGE_ID,
      source: ID_NAMESPACE_NODE_ID,
      target: PROJECT_NODE_ID,
      type: c2m2Schema.CONTAINS,
    },
  },
  {
    classes: ["admin-relationship"],
    data: {
      id: ID_NAMESPACE_CONTAINS_COLLECTION_EDGE_ID,
      source: ID_NAMESPACE_NODE_ID,
      target: COLLECTION_NODE_ID,
      type: c2m2Schema.CONTAINS,
    },
  },
  {
    classes: ["admin-relationship", "horizontal-text"],
    data: {
      id: ID_NAMESPACE_CONTAINS_FILE_EDGE_ID,
      source: ID_NAMESPACE_NODE_ID,
      target: FILE_NODE_ID,
      type: c2m2Schema.CONTAINS,
    },
  },
  {
    classes: ["admin-relationship"],
    data: {
      id: ID_NAMESPACE_CONTAINS_BIOSAMPLE_EDGE_ID,
      source: ID_NAMESPACE_NODE_ID,
      target: BIOSAMPLE_NODE_ID,
      type: c2m2Schema.CONTAINS,
    },
  },
  {
    classes: ["admin-relationship"],
    data: {
      id: ID_NAMESPACE_CONTAINS_SUBJECT_EDGE_ID,
      source: ID_NAMESPACE_NODE_ID,
      target: SUBJECT_NODE_ID,
      type: c2m2Schema.CONTAINS,
    },
  },
  {
    classes: ["container-relationship"],
    data: {
      id: PROJECT_IS_PARENT_OF_PROJECT_EDGE_ID,
      source: PROJECT_NODE_ID,
      target: PROJECT_NODE_ID,
      type: c2m2Schema.IS_PARENT_OF,
    },
  },
  {
    classes: ["container-relationship"],
    data: {
      id: PROJECT_CONTAINS_SUBJECT_EDGE_ID,
      source: PROJECT_NODE_ID,
      target: SUBJECT_NODE_ID,
      type: c2m2Schema.CONTAINS,
    },
  },
  {
    classes: ["container-relationship"],
    data: {
      id: PROJECT_CONTAINS_BIOSAMPLE_EDGE_ID,
      source: PROJECT_NODE_ID,
      target: BIOSAMPLE_NODE_ID,
      type: c2m2Schema.CONTAINS,
    },
  },
  {
    classes: ["container-relationship"],
    data: {
      id: PROJECT_CONTAINS_FILE_EDGE_ID,
      source: PROJECT_NODE_ID,
      target: FILE_NODE_ID,
      type: c2m2Schema.CONTAINS,
    },
  },
  {
    classes: ["container-relationship"],
    data: {
      id: COLLECTION_IS_SUPERSET_OF_COLLECTION_EDGE_ID,
      source: COLLECTION_NODE_ID,
      target: COLLECTION_NODE_ID,
      type: c2m2Schema.IS_SUPERSET_OF,
    },
  },
  {
    classes: ["container-relationship"],
    data: {
      id: COLLECTION_CONTAINS_FILE_EDGE_ID,
      source: COLLECTION_NODE_ID,
      target: FILE_NODE_ID,
      type: c2m2Schema.CONTAINS,
    },
  },
  {
    classes: ["container-relationship"],
    data: {
      id: COLLECTION_CONTAINS_BIOSAMPLE_EDGE_ID,
      source: COLLECTION_NODE_ID,
      target: BIOSAMPLE_NODE_ID,
      type: c2m2Schema.CONTAINS,
    },
  },
  {
    classes: ["container-relationship"],
    data: {
      id: COLLECTION_CONTAINS_SUBJECT_EDGE_ID,
      source: COLLECTION_NODE_ID,
      target: SUBJECT_NODE_ID,
      type: c2m2Schema.CONTAINS,
    },
  },
  {
    classes: ["container-relationship", "dashed"],
    data: {
      id: COLLECTION_DEFINED_BY_PROJECT_EDGE_ID,
      source: ARTIFICIAL_COLLECTION_NODE_ID,
      target: PROJECT_NODE_ID,
      type: c2m2Schema.DEFINED_BY,
    },
  },
  {
    classes: ["term-relationship", "dashed"],
    data: {
      id: COLLECTION_CONTAINS_TERMS_EDGE_ID,
      source: COLLECTION_NODE_ID,
      target: ALL_TERM_NODES_NODE_ID,
      type: c2m2Schema.CONTAINS,
    },
  },
  {
    classes: ["file-related-relationship"],
    data: {
      id: FILE_IS_FILE_FORMAT_EDGE_ID,
      source: FILE_NODE_ID,
      target: FILE_FORMAT_NODE_ID,
      type: c2m2Schema.IS_FILE_FORMAT,
    },
  },
  {
    classes: ["file-related-relationship"],
    data: {
      id: FILE_GENERATED_BY_ASSAY_TYPE_EDGE_ID,
      source: FILE_NODE_ID,
      target: ASSAY_TYPE_NODE_ID,
      type: c2m2Schema.GENERATED_BY_ASSAY_TYPE,
    },
  },
  {
    classes: ["file-related-relationship"],
    data: {
      id: FILE_GENERATED_BY_ANALYSIS_TYPE_EDGE_ID,
      source: FILE_NODE_ID,
      target: ANALYSIS_TYPE_NODE_ID,
      type: c2m2Schema.GENERATED_BY_ANALYSIS_TYPE,
    },
  },
  {
    classes: ["file-related-relationship"],
    data: {
      id: FILE_IS_DATA_TYPE_EDGE_ID,
      source: FILE_NODE_ID,
      target: DATA_TYPE_NODE_ID,
      type: c2m2Schema.IS_DATA_TYPE,
    },
  },
  {
    classes: ["file-relationship"],
    data: {
      id: FILE_DESCRIBES_BIOSAMPLE_EDGE_ID,
      source: FILE_NODE_ID,
      target: BIOSAMPLE_NODE_ID,
      type: c2m2Schema.DESCRIBES,
    },
  },
  {
    classes: ["file-relationship"],
    data: {
      id: FILE_DESCRIBES_SUBJECT_EDGE_ID,
      source: FILE_NODE_ID,
      target: SUBJECT_NODE_ID,
      type: c2m2Schema.DESCRIBES,
    },
  },
  {
    classes: ["subject-related-relationship"],
    data: {
      id: SUBJECT_IS_GRANULARITY_EDGE_ID,
      source: SUBJECT_NODE_ID,
      target: SUBJECT_GRANULARITY_NODE_ID,
      type: c2m2Schema.IS_GRANULARITY,
    },
  },
  {
    classes: ["subject-related-relationship"],
    data: {
      id: SUBJECT_IS_ETHNICITY_EDGE_ID,
      source: SUBJECT_NODE_ID,
      target: SUBJECT_ETHNICITY_NODE_ID,
      type: c2m2Schema.IS_ETHNICITY,
    },
  },
  {
    classes: ["subject-related-relationship"],
    data: {
      id: SUBJECT_IS_RACE_EDGE_ID,
      source: SUBJECT_NODE_ID,
      target: SUBJECT_RACE_NODE_ID,
      type: c2m2Schema.IS_RACE,
    },
  },
  {
    classes: ["subject-related-relationship"],
    data: {
      id: SUBJECT_IS_SEX_EDGE_ID,
      source: SUBJECT_NODE_ID,
      target: SUBJECT_SEX_NODE_ID,
      type: c2m2Schema.IS_SEX,
    },
  },
  {
    classes: ["term-relationship", "no-arrows"],
    data: {
      id: SUBJECT_ASSOCIATED_WITH_TAXONOMY_EDGE_ID,
      source: SUBJECT_NODE_ID,
      target: NCBI_TAXONOMY_NODE_ID,
      type: c2m2Schema.ASSOCIATED_WITH,
    },
  },
  {
    classes: ["term-relationship"],
    data: {
      id: SUBJECT_TESTED_FOR_DISEASE_EDGE_ID,
      source: SUBJECT_NODE_ID,
      target: DISEASE_NODE_ID,
      type: c2m2Schema.TESTED_FOR,
    },
  },
  {
    classes: ["term-relationship"],
    data: {
      id: SUBJECT_TESTED_FOR_PHENOTYPE_EDGE_ID,
      source: SUBJECT_NODE_ID,
      target: PHENOTYPE_NODE_ID,
      type: c2m2Schema.TESTED_FOR,
    },
  },
  {
    classes: ["term-relationship", "no-arrows"],
    data: {
      id: BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE_EDGE_ID,
      source: BIOSAMPLE_NODE_ID,
      target: SUBSTANCE_NODE_ID,
      type: c2m2Schema.ASSOCIATED_WITH,
    },
  },
  {
    classes: ["term-relationship", "no-arrows"],
    data: {
      id: SUBJECT_ASSOCIATED_WITH_SUBSTANCE_EDGE_ID,
      source: SUBJECT_NODE_ID,
      target: SUBSTANCE_NODE_ID,
      type: c2m2Schema.ASSOCIATED_WITH,
    },
  },
  {
    classes: ["term-relationship", "no-arrows"],
    data: {
      id: BIOSAMPLE_ASSOCIATED_WITH_GENE_EDGE_ID,
      source: BIOSAMPLE_NODE_ID,
      target: GENE_NODE_ID,
      type: c2m2Schema.ASSOCIATED_WITH,
    },
  },
  {
    classes: ["biosample-related-relationship", "horizontal-text"],
    data: {
      id: BIOSAMPLE_PREPPED_VIA_SAMPLE_PREP_METHOD_EDGE_ID,
      source: BIOSAMPLE_NODE_ID,
      target: SAMPLE_PREP_METHOD_NODE_ID,
      type: c2m2Schema.PREPPED_VIA,
    },
  },
  {
    classes: ["term-relationship"],
    data: {
      id: BIOSAMPLE_TESTED_FOR_PHENOTYPE_EDGE_ID,
      source: BIOSAMPLE_NODE_ID,
      target: PHENOTYPE_NODE_ID,
      type: c2m2Schema.TESTED_FOR,
    },
  },
  {
    classes: ["term-relationship"],
    data: {
      id: BIOSAMPLE_TESTED_FOR_DISEASE_EDGE_ID,
      source: BIOSAMPLE_NODE_ID,
      target: DISEASE_NODE_ID,
      type: c2m2Schema.TESTED_FOR,
    },
  },
  {
    classes: ["biosample-relationship"],
    data: {
      id: BIOSAMPLE_SAMPLED_FROM_SUBJECT_EDGE_ID,
      source: BIOSAMPLE_NODE_ID,
      target: SUBJECT_NODE_ID,
      type: c2m2Schema.SAMPLED_FROM,
    },
  },
  {
    classes: ["term-relationship"],
    data: {
      id: BIOSAMPLE_SAMPLED_FROM_ANATOMY_EDGE_ID,
      source: BIOSAMPLE_NODE_ID,
      target: ANATOMY_NODE_ID,
      type: c2m2Schema.SAMPLED_FROM,
    },
  },
  {
    classes: ["term-relationship"],
    data: {
      id: BIOSAMPLE_SAMPLED_FROM_BIOFLUID_EDGE_ID,
      source: BIOSAMPLE_NODE_ID,
      target: BIOFLUID_NODE_ID,
      type: c2m2Schema.SAMPLED_FROM,
    },
  },
  {
    classes: ["term-relationship", "no-arrows", "horizontal-text"],
    data: {
      id: SUBSTANCE_ASSOCIATED_WITH_COMPOUND_EDGE_ID,
      source: SUBSTANCE_NODE_ID,
      target: COMPOUND_NODE_ID,
      type: c2m2Schema.ASSOCIATED_WITH,
    },
  },
  {
    classes: ["term-relationship", "horizontal-text"],
    data: {
      id: PROTEIN_HAS_SOURCE_TAXONOMY_EDGE_ID,
      source: PROTEIN_NODE_ID,
      target: NCBI_TAXONOMY_NODE_ID,
      type: c2m2Schema.HAS_SOURCE,
    },
  },
  {
    classes: ["term-relationship", "horizontal-text"],
    data: {
      id: GENE_HAS_SOURCE_TAXONOMY_EDGE_ID,
      source: GENE_NODE_ID,
      target: NCBI_TAXONOMY_NODE_ID,
      type: c2m2Schema.HAS_SOURCE,
    },
  },
  {
    classes: ["term-relationship", "no-arrows", "horizontal-text"],
    data: {
      id: GENE_ASSOCIATED_WITH_PHENOTYPE_EDGE_ID,
      source: GENE_NODE_ID,
      target: PHENOTYPE_NODE_ID,
      type: c2m2Schema.ASSOCIATED_WITH,
    },
  },
  {
    classes: ["term-relationship", "no-arrows", "horizontal-text"],
    data: {
      id: PHENOTYPE_ASSOCIATED_WITH_DISEASE_EDGE_ID,
      source: PHENOTYPE_NODE_ID,
      target: DISEASE_NODE_ID,
      type: c2m2Schema.ASSOCIATED_WITH,
    },
  },
];

const ELEMENTS: SchemaCytoscapeElements = [...NODES, ...EDGES];

const STYLESHEET: SchemaCytoscapeStylesheet = [
  ...DEFAULT_STYLESHEET,
  ...c2m2CytoscapeStyles.ENTITY_STYLESHEET_CLASSES,
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
    selector: "node.all-terms-node",
    style: {
      "background-color": CHART_BG_COLOR,
      "border-width": 1,
      "border-color": TERM_NODE_COLOR,
    },
  },
  {
    selector: "node.artificial-collection-node",
    style: {
      "background-color": CHART_BG_COLOR,
      "border-width": 1,
      "border-color": CONTAINER_NODE_COLOR,
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
    selector: "edge.admin-relationship",
    style: {
      "line-color": ADMIN_NODE_COLOR,
      "target-arrow-color": ADMIN_NODE_COLOR,
    },
  },
  {
    selector: "edge.container-relationship",
    style: {
      "line-color": CONTAINER_NODE_COLOR,
      "target-arrow-color": CONTAINER_NODE_COLOR,
    },
  },
  {
    selector: "edge.file-relationship",
    style: {
      "line-color": FILE_NODE_COLOR,
      "target-arrow-color": FILE_NODE_COLOR,
    },
  },
  {
    selector: "edge.file-related-relationship",
    style: {
      "line-color": FILE_RELATED_NODE_COLOR,
      "target-arrow-color": FILE_RELATED_NODE_COLOR,
    },
  },
  {
    selector: "edge.subject-relationship",
    style: {
      "line-color": SUBJECT_NODE_COLOR,
      "target-arrow-color": SUBJECT_NODE_COLOR,
    },
  },
  {
    selector: "edge.subject-related-relationship",
    style: {
      "line-color": SUBJECT_RELATED_NODE_COLOR,
      "target-arrow-color": SUBJECT_RELATED_NODE_COLOR,
    },
  },
  {
    selector: "edge.biosample-relationship",
    style: {
      "line-color": BIOSAMPLE_NODE_COLOR,
      "target-arrow-color": BIOSAMPLE_NODE_COLOR,
    },
  },
  {
    selector: "edge.biosample-related-relationship",
    style: {
      "line-color": BIOSAMPLE_RELATED_NODE_COLOR,
      "target-arrow-color": BIOSAMPLE_RELATED_NODE_COLOR,
    },
  },
  {
    selector: "edge.term-relationship",
    style: {
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
      "source-label": "data(type)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS, // intersection | node-position | endpoints
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
        ID_NAMESPACE_CONTAINS_PROJECT_TARGET_POS,
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${ID_NAMESPACE_CONTAINS_COLLECTION_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [true],
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${ID_NAMESPACE_CONTAINS_FILE_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 10,
    },
  },
  {
    selector: `edge#${ID_NAMESPACE_CONTAINS_BIOSAMPLE_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [true, true, true],
      ),
      "segment-radii": [20, 20, 20],
    },
  },
  {
    selector: `edge#${ID_NAMESPACE_CONTAINS_SUBJECT_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        ID_NAMESPACE_CONTAINS_SUBJECT_TARGET_POS,
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
      "source-label": "data(type)",
      "source-text-offset": 62.5,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [true],
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${PROJECT_CONTAINS_SUBJECT_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        PROJECT_CONTAINS_SUBJECT_TARGET_POS,
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${PROJECT_CONTAINS_BIOSAMPLE_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        PROJECT_CONTAINS_BIOSAMPLE_TARGET_POS,
      ),
      "segment-radii": [20],
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
      "source-label": "data(type)",
      "source-text-offset": 62.5,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        COLLECTION_CONTAINS_FILE_TARGET_POS,
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${COLLECTION_CONTAINS_BIOSAMPLE_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [true],
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${COLLECTION_CONTAINS_SUBJECT_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [true, true, true],
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${COLLECTION_CONTAINS_TERMS_EDGE_ID}`,
    style: {
      label: "data(type)",
    },
  },
  {
    selector: `edge#${COLLECTION_DEFINED_BY_PROJECT_EDGE_ID}`,
    style: {
      label: "data(type)",
    },
  },
  {
    selector: `edge#${FILE_IS_FILE_FORMAT_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [true],
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${FILE_GENERATED_BY_ASSAY_TYPE_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        FILE_GENERATED_BY_ASSAY_TYPE_TARGET_POS,
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${FILE_GENERATED_BY_ANALYSIS_TYPE_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [true],
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${FILE_IS_DATA_TYPE_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        FILE_IS_DATA_TYPE_TARGET_POS,
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${FILE_DESCRIBES_SUBJECT_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        FILE_DESCRIBES_SUBJECT_TARGET_POS,
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${FILE_DESCRIBES_BIOSAMPLE_EDGE_ID}`,
    style: {
      label: "",
      "source-label": "data(type)",
      "source-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [true],
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${SUBJECT_IS_GRANULARITY_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(type)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        SUBJECT_IS_GRANULARITY_TARGET_POS,
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${SUBJECT_IS_ETHNICITY_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(type)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [true],
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${SUBJECT_IS_RACE_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(type)",
      "target-text-offset": 35,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        SUBJECT_IS_RACE_TARGET_POS,
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${SUBJECT_IS_SEX_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(type)",
      "target-text-offset": 35,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [true],
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${SUBJECT_ASSOCIATED_WITH_TAXONOMY_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(type)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [false, true],
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${SUBJECT_ASSOCIATED_WITH_SUBSTANCE_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(type)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [false, true],
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${SUBJECT_TESTED_FOR_PHENOTYPE_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(type)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [false, true],
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${SUBJECT_TESTED_FOR_DISEASE_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(type)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [false, true],
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${BIOSAMPLE_TESTED_FOR_PHENOTYPE_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(type)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [true, false],
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${BIOSAMPLE_TESTED_FOR_DISEASE_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(type)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [true, false],
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${BIOSAMPLE_SAMPLED_FROM_ANATOMY_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(type)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [true, false],
      ),
    },
  },
  {
    selector: `edge#${BIOSAMPLE_SAMPLED_FROM_BIOFLUID_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(type)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
      "source-endpoint": `${BIOSAMPLE_SAMPLED_FROM_BIOFLUID_SOURCE_DEG}deg`,
      "target-endpoint": `${BIOSAMPLE_SAMPLED_FROM_BIOFLUID_TARGET_DEG}deg`,
      ...getSegmentPropsWithPoints(
        BIOSAMPLE_SAMPLED_FROM_BIOFLUID_SOURCE_POS,
        [
          {
            x: TERM_NODE_X_SPACING,
            y: BIOSAMPLE_SAMPLED_FROM_BIOFLUID_SOURCE_POS.y,
          },
          {
            x: TERM_NODE_X_SPACING,
            y: BIOSAMPLE_SAMPLED_FROM_BIOFLUID_TARGET_POS.y,
          },
        ],
        BIOSAMPLE_SAMPLED_FROM_BIOFLUID_TARGET_POS,
        [true, false],
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
      "target-label": "data(type)",
      "target-text-offset": 100,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [true, false],
      ),
      "segment-radii": [20],
    },
  },
  {
    selector: `edge#${BIOSAMPLE_ASSOCIATED_WITH_GENE_EDGE_ID}`,
    style: {
      label: "",
      "target-label": "data(type)",
      "target-text-offset": 75,
      "curve-style": "round-segments",
      "radius-type": "arc-radius",
      "edge-distances": EDGE_DIST_ENDPOINTS,
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
        [true, false],
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
    selector: `edge#${PHENOTYPE_ASSOCIATED_WITH_DISEASE_EDGE_ID}`,
    style: {},
  },
];

const LAYOUT = {
  name: "preset",
};

const c2m2Preset = {
  LAYOUT,
  STYLESHEET,
  ELEMENTS,
};

export default c2m2Preset;
