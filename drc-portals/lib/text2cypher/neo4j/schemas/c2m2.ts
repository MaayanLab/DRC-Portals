import type {
  SchemaNodes,
  SchemaRelationships,
  SchemaNodeProperties,
  SchemaPathways,
} from "@/lib/text2cypher/schema/types";

// Admin entity labels
const DCC = "DCC";
const ID_NAMESPACE = "IDNamespace";
const ADMINS: SchemaNodes = [DCC, ID_NAMESPACE];

// Container entity labels
const COLLECTION = "Collection";
const PROJECT = "Project";
const CONTAINERS: SchemaNodes = [COLLECTION, PROJECT];

// Core entity labels
const FILE = "File";
const SUBJECT = "Subject";
const BIOSAMPLE = "Biosample";
const CORES: SchemaNodes = [BIOSAMPLE, FILE, SUBJECT];

// Term entity labels
const ANATOMY = "Anatomy";
const COMPOUND = "Compound";
const DISEASE = "Disease";
const GENE = "Gene";
const NCBI_TAXONOMY = "NCBITaxonomy";
const PHENOTYPE = "Phenotype";
const PROTEIN = "Protein";
const SUBSTANCE = "Substance";
const BIOFLUID = "Biofluid";
const TERMS: SchemaNodes = [
  ANATOMY,
  BIOFLUID,
  COMPOUND,
  DISEASE,
  GENE,
  NCBI_TAXONOMY,
  PHENOTYPE,
  PROTEIN,
  SUBSTANCE,
];

// File related entity labels
const ANALYSIS_TYPE = "AnalysisType";
const ASSAY_TYPE = "AssayType";
const DATA_TYPE = "DataType";
const FILE_FORMAT = "FileFormat";
const FILE_RELATEDS: SchemaNodes = [
  ANALYSIS_TYPE,
  ASSAY_TYPE,
  DATA_TYPE,
  FILE_FORMAT,
];

// Subject related entity labels
const SUBJECT_ETHNICITY = "SubjectEthnicity";
const SUBJECT_RACE = "SubjectRace";
const SUBJECT_GRANULARITY = "SubjectGranularity";
const SUBJECT_SEX = "SubjectSex";
const SUBJECT_RELATEDS: SchemaNodes = [
  SUBJECT_ETHNICITY,
  SUBJECT_GRANULARITY,
  SUBJECT_RACE,
  SUBJECT_SEX,
];

// Biosample related entity labels
const SAMPLE_PREP_METHOD = "SamplePrepMethod";
const BIOSAMPLE_RELATEDS: SchemaNodes = [SAMPLE_PREP_METHOD];

// Meta labels
const SYNONYM = "Synonym";
const METAS: SchemaNodes = [SYNONYM];

// Set of all node labels

const NODES: SchemaNodes = [
  ANALYSIS_TYPE,
  ANATOMY,
  ASSAY_TYPE,
  BIOFLUID,
  BIOSAMPLE,
  COLLECTION,
  COMPOUND,
  DCC,
  DATA_TYPE,
  DISEASE,
  FILE,
  FILE_FORMAT,
  GENE,
  ID_NAMESPACE,
  NCBI_TAXONOMY,
  PHENOTYPE,
  PROJECT,
  PROTEIN,
  SAMPLE_PREP_METHOD,
  SUBJECT,
  SUBJECT_ETHNICITY,
  SUBJECT_GRANULARITY,
  SUBJECT_RACE,
  SUBJECT_SEX,
  SUBSTANCE,
  SYNONYM,
];

const NODE_PROPERTIES: SchemaNodeProperties = new Map([
  [ANALYSIS_TYPE, ["synonyms", "name", "description", "id"]],
  [ANATOMY, ["synonyms", "name", "description", "id"]],
  [ASSAY_TYPE, ["synonyms", "name", "description", "id"]],
  [BIOFLUID, ["synonyms", "name", "description", "id"]],
  [BIOSAMPLE, ["persistent_id", "local_id", "creation_time"]],
  [
    COLLECTION,
    [
      "name",
      "description",
      "persistent_id",
      "local_id",
      "creation_time",
      "abbreviation",
      "has_time_series_data",
    ],
  ],
  [COMPOUND, ["synonyms", "name", "description", "id"]],
  [
    DCC,
    [
      "name",
      "description",
      "id",
      "abbreviation",
      "contact_name",
      "url",
      "contact_email",
    ],
  ],
  [DATA_TYPE, ["synonyms", "name", "description", "id"]],
  [DISEASE, ["synonyms", "name", "description", "id"]],
  [
    FILE,
    [
      "persistent_id",
      "local_id",
      "creation_time",
      "filename",
      "size_in_bytes",
      "uncompressed_size_in_bytes",
      "dbgap_study_id",
      "sha256",
      "md5",
      "mime",
    ],
  ],
  [FILE_FORMAT, ["synonyms", "name", "description", "id"]],
  [GENE, ["synonyms", "name", "description", "id", "organism"]],
  [ID_NAMESPACE, ["name", "description", "id", "abbreviation"]],
  [NCBI_TAXONOMY, ["synonyms", "name", "description", "id", "clade"]],
  [PHENOTYPE, ["synonyms", "name", "description", "id"]],
  [
    PROJECT,
    [
      "name",
      "description",
      "persistent_id",
      "local_id",
      "creation_time",
      "abbreviation",
    ],
  ],
  [PROTEIN, ["synonyms", "name", "description", "id"]],
  [SAMPLE_PREP_METHOD, ["synonyms", "name", "description", "id"]],
  [
    SUBJECT,
    [
      "persistent_id",
      "local_id",
      "creation_time",
      "sex",
      "ethnicity",
      "age_at_enrollment",
      "granularity",
    ],
  ],
  [SUBJECT_ETHNICITY, ["name", "description", "id"]],
  [SUBJECT_GRANULARITY, ["name", "description", "id"]],
  [SUBJECT_RACE, ["name", "description", "id"]],
  [SUBJECT_SEX, ["name", "description", "id"]],
  [SUBSTANCE, ["synonyms", "name", "id"]],
  [SYNONYM, ["name"]],
]);

// Relationship types
const ASSOCIATED_WITH = "ASSOCIATED_WITH";
const CONTAINS = "CONTAINS";
const REGISTERED = "REGISTERED";
const HAS_SOURCE = "HAS_SOURCE";
const SAMPLED_FROM = "SAMPLED_FROM";
const PREPPED_VIA = "PREPPED_VIA";
const IS_DATA_TYPE = "IS_DATA_TYPE";
const GENERATED_BY_ASSAY_TYPE = "GENERATED_BY_ASSAY_TYPE";
const GENERATED_BY_ANALYSIS_TYPE = "GENERATED_BY_ANALYSIS_TYPE";
const IS_FILE_FORMAT = "IS_FILE_FORMAT";
const IS_GRANULARITY = "IS_GRANULARITY";
const IS_SEX = "IS_SEX";
const IS_ETHNICITY = "IS_ETHNICITY";
const IS_SUPERSET_OF = "IS_SUPERSET_OF";
const DEFINED_BY = "DEFINED_BY";
const IS_PARENT_OF = "IS_PARENT_OF";
const DESCRIBES = "DESCRIBES";
const TESTED_FOR = "TESTED_FOR";
const IS_RACE = "IS_RACE";
const HAS_SYNONYM = "HAS_SYNONYM";

const RELATIONSHIPS: SchemaRelationships = [
  HAS_SYNONYM,
  ASSOCIATED_WITH,
  PREPPED_VIA,
  SAMPLED_FROM,
  TESTED_FOR,
  CONTAINS,
  DEFINED_BY,
  IS_SUPERSET_OF,
  REGISTERED,
  DESCRIBES,
  GENERATED_BY_ANALYSIS_TYPE,
  GENERATED_BY_ASSAY_TYPE,
  IS_DATA_TYPE,
  IS_FILE_FORMAT,
  HAS_SOURCE,
  IS_PARENT_OF,
  IS_ETHNICITY,
  IS_GRANULARITY,
  IS_RACE,
  IS_SEX,
];

const PATHWAYS: SchemaPathways = [
  [ANALYSIS_TYPE, HAS_SYNONYM, SYNONYM],
  [ANATOMY, HAS_SYNONYM, SYNONYM],
  [ASSAY_TYPE, HAS_SYNONYM, SYNONYM],
  [BIOFLUID, HAS_SYNONYM, SYNONYM],
  [BIOSAMPLE, ASSOCIATED_WITH, SUBSTANCE],
  [BIOSAMPLE, ASSOCIATED_WITH, GENE],
  [BIOSAMPLE, PREPPED_VIA, SAMPLE_PREP_METHOD],
  [BIOSAMPLE, SAMPLED_FROM, ANATOMY],
  [BIOSAMPLE, SAMPLED_FROM, BIOFLUID],
  [BIOSAMPLE, SAMPLED_FROM, SUBJECT],
  [BIOSAMPLE, TESTED_FOR, DISEASE],
  [COLLECTION, CONTAINS, COMPOUND],
  [COLLECTION, CONTAINS, SUBJECT],
  [COLLECTION, CONTAINS, PROTEIN],
  [COLLECTION, CONTAINS, FILE],
  [COLLECTION, CONTAINS, NCBI_TAXONOMY],
  [COLLECTION, CONTAINS, BIOSAMPLE],
  [COLLECTION, CONTAINS, ANATOMY],
  [COLLECTION, CONTAINS, BIOFLUID],
  [COLLECTION, CONTAINS, DISEASE],
  [COLLECTION, CONTAINS, GENE],
  [COLLECTION, DEFINED_BY, PROJECT],
  [COLLECTION, IS_SUPERSET_OF, COLLECTION],
  [COMPOUND, HAS_SYNONYM, SYNONYM],
  [DCC, CONTAINS, BIOSAMPLE],
  [DCC, CONTAINS, COLLECTION],
  [DCC, CONTAINS, PROJECT],
  [DCC, CONTAINS, FILE],
  [DCC, CONTAINS, SUBJECT],
  [DCC, REGISTERED, ID_NAMESPACE],
  [DATA_TYPE, HAS_SYNONYM, SYNONYM],
  [DISEASE, HAS_SYNONYM, SYNONYM],
  [FILE, DESCRIBES, BIOSAMPLE],
  [FILE, DESCRIBES, COLLECTION],
  [FILE, DESCRIBES, SUBJECT],
  [FILE, GENERATED_BY_ANALYSIS_TYPE, ANALYSIS_TYPE],
  [FILE, GENERATED_BY_ASSAY_TYPE, ASSAY_TYPE],
  [FILE, IS_DATA_TYPE, DATA_TYPE],
  [FILE, IS_FILE_FORMAT, FILE_FORMAT],
  [FILE_FORMAT, HAS_SYNONYM, SYNONYM],
  [GENE, HAS_SOURCE, NCBI_TAXONOMY],
  [GENE, HAS_SYNONYM, SYNONYM],
  [ID_NAMESPACE, CONTAINS, COLLECTION],
  [ID_NAMESPACE, CONTAINS, BIOSAMPLE],
  [ID_NAMESPACE, CONTAINS, FILE],
  [ID_NAMESPACE, CONTAINS, PROJECT],
  [ID_NAMESPACE, CONTAINS, SUBJECT],
  [NCBI_TAXONOMY, HAS_SYNONYM, SYNONYM],
  [PHENOTYPE, ASSOCIATED_WITH, GENE],
  [PHENOTYPE, HAS_SYNONYM, SYNONYM],
  [PROJECT, CONTAINS, BIOSAMPLE],
  [PROJECT, CONTAINS, FILE],
  [PROJECT, CONTAINS, SUBJECT],
  [PROJECT, IS_PARENT_OF, PROJECT],
  [PROTEIN, HAS_SOURCE, NCBI_TAXONOMY],
  [PROTEIN, HAS_SYNONYM, SYNONYM],
  [SAMPLE_PREP_METHOD, HAS_SYNONYM, SYNONYM],
  [SUBJECT, ASSOCIATED_WITH, NCBI_TAXONOMY],
  [SUBJECT, IS_ETHNICITY, SUBJECT_ETHNICITY],
  [SUBJECT, IS_GRANULARITY, SUBJECT_GRANULARITY],
  [SUBJECT, IS_RACE, SUBJECT_RACE],
  [SUBJECT, IS_SEX, SUBJECT_SEX],
  [SUBJECT, TESTED_FOR, PHENOTYPE],
  [SUBJECT, TESTED_FOR, DISEASE],
  [SUBJECT_ETHNICITY, HAS_SYNONYM, SYNONYM],
  [SUBJECT_GRANULARITY, HAS_SYNONYM, SYNONYM],
  [SUBJECT_RACE, HAS_SYNONYM, SYNONYM],
  [SUBJECT_SEX, HAS_SYNONYM, SYNONYM],
  [SUBSTANCE, ASSOCIATED_WITH, COMPOUND],
  [SUBSTANCE, HAS_SYNONYM, SYNONYM],
];

const schema = {
  ADMINS,
  ANALYSIS_TYPE,
  ANATOMY,
  ASSAY_TYPE,
  ASSOCIATED_WITH,
  BIOFLUID,
  BIOSAMPLE,
  BIOSAMPLE_RELATEDS,
  COLLECTION,
  COMPOUND,
  CONTAINS,
  CONTAINERS,
  CORES,
  DATA_TYPE,
  DEFINED_BY,
  DCC,
  DISEASE,
  DESCRIBES,
  FILE,
  FILE_FORMAT,
  FILE_RELATEDS,
  GENERATED_BY_ANALYSIS_TYPE,
  GENERATED_BY_ASSAY_TYPE,
  GENE,
  HAS_SOURCE,
  HAS_SYNONYM,
  ID_NAMESPACE,
  IS_DATA_TYPE,
  IS_ETHNICITY,
  IS_FILE_FORMAT,
  IS_GRANULARITY,
  IS_PARENT_OF,
  IS_RACE,
  IS_SEX,
  IS_SUPERSET_OF,
  METAS,
  NCBI_TAXONOMY,
  PHENOTYPE,
  PREPPED_VIA,
  PROJECT,
  PROTEIN,
  REGISTERED,
  SAMPLE_PREP_METHOD,
  SAMPLED_FROM,
  SUBJECT,
  SUBJECT_ETHNICITY,
  SUBJECT_GRANULARITY,
  SUBJECT_RACE,
  SUBJECT_RELATEDS,
  SUBJECT_SEX,
  SUBSTANCE,
  SYNONYM,
  TERMS,
  TESTED_FOR,
  NODES,
  NODE_PROPERTIES,
  RELATIONSHIPS,
  PATHWAYS,
};
export default schema;
