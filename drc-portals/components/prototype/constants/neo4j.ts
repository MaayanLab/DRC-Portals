/**
 * It is important to note that it makes sense to keep these constants defined on the frontend because the underlying graph model is not
 * expected to change frequently. Should this assumption change, it may be necessary to retrieve the labels/types ad hoc. It should be
 * noted however that this can be a *very* expensive query, particularly when retrieving all connected labels/types for a given type/label.
 */
// Admin entity labels
export const DCC_LABEL = "DCC";
export const ID_NAMESPACE_LABEL = "IDNamespace";
export const ADMIN_LABELS: ReadonlyArray<string> = [
  DCC_LABEL,
  ID_NAMESPACE_LABEL,
];

// Container entity labels
export const COLLECTION_LABEL = "Collection";
export const PROJECT_LABEL = "Project";
export const CONTAINER_LABELS: ReadonlyArray<string> = [
  COLLECTION_LABEL,
  PROJECT_LABEL,
];

// Core entity labels
export const FILE_LABEL = "File";
export const SUBJECT_LABEL = "Subject";
export const BIOSAMPLE_LABEL = "Biosample";
export const CORE_LABELS: ReadonlyArray<string> = [
  BIOSAMPLE_LABEL,
  FILE_LABEL,
  SUBJECT_LABEL,
];

// Term entity labels
export const ANATOMY_LABEL = "Anatomy";
export const COMPOUND_LABEL = "Compound";
export const DISEASE_LABEL = "Disease";
export const GENE_LABEL = "Gene";
export const NCBI_TAXONOMY_LABEL = "NCBITaxonomy";
export const PHENOTYPE_LABEL = "Phenotype";
export const PROTEIN_LABEL = "Protein";
export const SUBSTANCE_LABEL = "Substance";
export const TERM_LABELS: ReadonlyArray<string> = [
  ANATOMY_LABEL,
  COMPOUND_LABEL,
  DISEASE_LABEL,
  GENE_LABEL,
  NCBI_TAXONOMY_LABEL,
  PHENOTYPE_LABEL,
  PROTEIN_LABEL,
  SUBSTANCE_LABEL,
];

// File related entity labels
export const ANALYSIS_TYPE_LABEL = "AnalysisType";
export const ASSAY_TYPE_LABEL = "AssayType";
export const DATA_TYPE_LABEL = "DataType";
export const FILE_FORMAT_LABEL = "FileFormat";
export const FILE_RELATED_LABELS: ReadonlyArray<string> = [
  ANALYSIS_TYPE_LABEL,
  ASSAY_TYPE_LABEL,
  DATA_TYPE_LABEL,
  FILE_FORMAT_LABEL,
];

// Subject related entity labels
export const SUBJECT_ETHNICITY_LABEL = "SubjectEthnicity";
export const SUBJECT_RACE_LABEL = "SubjectRace";
export const SUBJECT_GRANULARITY_LABEL = "SubjectGranularity";
export const SUBJECT_SEX_LABEL = "SubjectSex";
export const SUBJECT_RELATED_LABELS: ReadonlyArray<string> = [
  SUBJECT_ETHNICITY_LABEL,
  SUBJECT_GRANULARITY_LABEL,
  SUBJECT_RACE_LABEL,
  SUBJECT_SEX_LABEL,
];

// Biosample related entity labels
export const SAMPLE_PREP_METHOD_LABEL = "SamplePrepMethod";
export const BIOSAMPLE_RELATED_LABELS: ReadonlyArray<string> = [
  SAMPLE_PREP_METHOD_LABEL,
];

// Set of all node labels
export const NODE_LABELS: ReadonlySet<string> = new Set([
  ...ADMIN_LABELS,
  ...CONTAINER_LABELS,
  ...CORE_LABELS,
  ...TERM_LABELS,
  ...FILE_RELATED_LABELS,
  ...SUBJECT_RELATED_LABELS,
  ...BIOSAMPLE_RELATED_LABELS,
]);

// Relationship types
export const ASSOCIATED_WITH_TYPE = "ASSOCIATED_WITH";
export const CONTAINS_TYPE = "CONTAINS";
export const REGISTERED_TYPE = "REGISTERED";
export const PRODUCED_TYPE = "PRODUCED";
export const HAS_SOURCE_TYPE = "HAS_SOURCE";
export const SAMPLED_FROM_TYPE = "SAMPLED_FROM";
export const PREPPED_VIA_TYPE = "PREPPED_VIA";
export const IS_DATA_TYPE_TYPE = "IS_DATA_TYPE";
export const GENERATED_BY_ASSAY_TYPE_TYPE = "GENERATED_BY_ASSAY_TYPE";
export const GENERATED_BY_ANALYSIS_TYPE_TYPE = "GENERATED_BY_ANALYSIS_TYPE";
export const IS_FILE_FORMAT_TYPE = "IS_FILE_FORMAT";
export const IS_GRANULARITY_TYPE = "IS_GRANULARITY";
export const IS_SEX_TYPE = "IS_SEX";
export const IS_ETHNICITY_TYPE = "IS_ETHNICITY";
export const IS_SUPERSET_OF_TYPE = "IS_SUPERSET_OF";
export const IS_PARENT_OF_TYPE = "IS_PARENT_OF";
export const DESCRIBES_TYPE = "DESCRIBES";
export const TESTED_FOR_TYPE = "TESTED_FOR";
export const REFERENCES_TYPE = "REFERENCES";
export const IS_RACE_TYPE = "IS_RACE";

// Set of all relationship types
export const RELATIONSHIP_TYPES: ReadonlySet<string> = new Set([
  ASSOCIATED_WITH_TYPE,
  CONTAINS_TYPE,
  DESCRIBES_TYPE,
  GENERATED_BY_ANALYSIS_TYPE_TYPE,
  GENERATED_BY_ASSAY_TYPE_TYPE,
  HAS_SOURCE_TYPE,
  IS_DATA_TYPE_TYPE,
  IS_ETHNICITY_TYPE,
  IS_FILE_FORMAT_TYPE,
  IS_GRANULARITY_TYPE,
  IS_PARENT_OF_TYPE,
  IS_RACE_TYPE,
  IS_SEX_TYPE,
  IS_SUPERSET_OF_TYPE,
  PREPPED_VIA_TYPE,
  PRODUCED_TYPE,
  REGISTERED_TYPE,
  REFERENCES_TYPE,
  SAMPLED_FROM_TYPE,
  TESTED_FOR_TYPE,
]);

export const OUTGOING_CONNECTIONS: ReadonlyMap<
  string,
  ReadonlyMap<string, string[]>
> = new Map([
  [
    BIOSAMPLE_LABEL,
    new Map([
      [SAMPLED_FROM_TYPE, [ANATOMY_LABEL, SUBJECT_LABEL]],
      [PREPPED_VIA_TYPE, [SAMPLE_PREP_METHOD_LABEL]],
      [TESTED_FOR_TYPE, [DISEASE_LABEL]],
    ]),
  ],
  [
    COLLECTION_LABEL,
    new Map([
      [CONTAINS_TYPE, [BIOSAMPLE_LABEL, FILE_LABEL, SUBJECT_LABEL]],
      [IS_SUPERSET_OF_TYPE, [COLLECTION_LABEL]],
    ]),
  ],
  [
    DCC_LABEL,
    new Map([
      [PRODUCED_TYPE, [PROJECT_LABEL]],
      [REGISTERED_TYPE, [ID_NAMESPACE_LABEL]],
    ]),
  ],
  [
    FILE_LABEL,
    new Map([
      [DESCRIBES_TYPE, [BIOSAMPLE_LABEL, SUBJECT_LABEL]],
      [GENERATED_BY_ASSAY_TYPE_TYPE, [ASSAY_TYPE_LABEL]],
      [GENERATED_BY_ANALYSIS_TYPE_TYPE, [ANALYSIS_TYPE_LABEL]],
      [IS_DATA_TYPE_TYPE, [DATA_TYPE_LABEL]],
      [IS_FILE_FORMAT_TYPE, [FILE_FORMAT_LABEL]],
      [
        REFERENCES_TYPE,
        [
          ANATOMY_LABEL,
          COMPOUND_LABEL,
          GENE_LABEL,
          NCBI_TAXONOMY_LABEL,
          PROTEIN_LABEL,
          SUBJECT_LABEL,
          SUBSTANCE_LABEL,
        ],
      ],
    ]),
  ],
  [GENE_LABEL, new Map([[HAS_SOURCE_TYPE, [NCBI_TAXONOMY_LABEL]]])],
  [
    ID_NAMESPACE_LABEL,
    new Map([
      [
        CONTAINS_TYPE,
        [
          BIOSAMPLE_LABEL,
          COLLECTION_LABEL,
          FILE_LABEL,
          PROJECT_LABEL,
          SUBJECT_LABEL,
        ],
      ],
    ]),
  ],
  [
    PROJECT_LABEL,
    new Map([
      [CONTAINS_TYPE, [BIOSAMPLE_LABEL, FILE_LABEL, SUBJECT_LABEL]],
      [IS_PARENT_OF_TYPE, [PROJECT_LABEL]],
    ]),
  ],
  [PROTEIN_LABEL, new Map([[HAS_SOURCE_TYPE, [NCBI_TAXONOMY_LABEL]]])],
  [
    SUBJECT_LABEL,
    new Map([
      [ASSOCIATED_WITH_TYPE, [NCBI_TAXONOMY_LABEL]],
      [IS_GRANULARITY_TYPE, [SUBJECT_GRANULARITY_LABEL]],
      [IS_SEX_TYPE, [SUBJECT_SEX_LABEL]],
      [IS_ETHNICITY_TYPE, [SUBJECT_ETHNICITY_LABEL]],
      [IS_RACE_TYPE, [SUBJECT_RACE_LABEL]],
      [TESTED_FOR_TYPE, [DISEASE_LABEL, PHENOTYPE_LABEL]],
    ]),
  ],
  [SUBSTANCE_LABEL, new Map([[ASSOCIATED_WITH_TYPE, [COMPOUND_LABEL]]])],
]);

export const INCOMING_CONNECTIONS: ReadonlyMap<
  string,
  ReadonlyMap<string, string[]>
> = (() => {
  const map = new Map<string, Map<string, string[]>>();
  OUTGOING_CONNECTIONS.forEach((val, src) => {
    val.forEach((dests, type) => {
      dests.forEach((dest) => {
        if (map.has(dest)) {
          if (map.get(dest)?.has(type)) {
            (map.get(dest)?.get(type) as string[]).push(src);
          } else {
            (map.get(dest) as Map<string, string[]>).set(type, [src]);
          }
        } else {
          map.set(dest, new Map([[type, [src]]]));
        }
      });
    });
  });
  return map;
})();

// All properties
export const ID_PROPERTY = "id";
export const DESCRIPTION_PROPERTY = "description";
export const NAME_PROPERTY = "name";
export const ABBREV_PROPERTY = "abbreviation";
export const LOCAL_ID_PROPERTY = "local_id";
export const CREATION_TIME_PROPERTY = "creation_time";
export const PERSISTENT_ID_PROPERTY = "persistent_id";
export const HAS_TIME_SERIES_DATA_PROPERTY = "has_time_series_data";
export const URL_PROPERTY = "url";
export const CONTACT_EMAIL_PROPERTY = "contact_email";
export const CONTACT_NAME_PROPERTY = "contact_name";
export const SYNONYMS_PROPERTY = "synonyms";
export const ORGANISM_PROPERTY = "organsim";
export const CLADE_PROPERTY = "clade";
export const MIME_TYPE_PROPERTY = "mime_type";
export const SIZE_IN_BYTES_PROPERTY = "size_in_bytes";
export const MD5_PROPERTY = "md5";
export const FILENAME_PROPERTY = "filename";
export const SHA256_PROPERTY = "sha256";
export const UNCOMPRESSED_SIZE_IN_BYTES_PROPERTY = "uncompressed_size_in_bytes";
export const DBGAP_STUDY_ID_PROPERTY = "dbgap_study_id";
export const GRANULARITY_PROPERTY = "granularity";
export const SEX_PROPERTY = "sex";
export const AGE_AT_ENROLLMENT_PROPERTY = "age_at_enrollment";
export const ETHNICITY_PROPERTY = "ethnicity";
export const ROLE_ID_PROPERTY = "role_id";
export const AGE_AT_SAMPLING_PROPERTY = "age_at_sampling";
export const OBSERVED_PROPERTY = "observed";

export const STRING_PROPERTIES: Set<string> = new Set([
  ID_PROPERTY,
  LOCAL_ID_PROPERTY,
  PERSISTENT_ID_PROPERTY,
  NAME_PROPERTY,
  DESCRIPTION_PROPERTY,
  ABBREV_PROPERTY,
  CONTACT_EMAIL_PROPERTY,
  CONTACT_NAME_PROPERTY,
  URL_PROPERTY,
  SHA256_PROPERTY,
  MD5_PROPERTY,
  FILENAME_PROPERTY,
  MIME_TYPE_PROPERTY,
  DBGAP_STUDY_ID_PROPERTY,
  ORGANISM_PROPERTY,
  CLADE_PROPERTY,
  GRANULARITY_PROPERTY,
  SEX_PROPERTY,
  ETHNICITY_PROPERTY,
]);

export const NUMBER_PROPERTIES: Set<string> = new Set([
  SIZE_IN_BYTES_PROPERTY,
  UNCOMPRESSED_SIZE_IN_BYTES_PROPERTY,
  AGE_AT_ENROLLMENT_PROPERTY,
  AGE_AT_SAMPLING_PROPERTY,
]);

export const STRING_ARRAY_PROPERTIES: Set<string> = new Set([
  SYNONYMS_PROPERTY,
]);

export const DATE_PROPERTIES: Set<string> = new Set([CREATION_TIME_PROPERTY]);

export const BOOL_PROPERTIES: Set<string> = new Set([
  HAS_TIME_SERIES_DATA_PROPERTY,
  OBSERVED_PROPERTY,
]);

export const PROPERTY_MAP: ReadonlyMap<string, string[]> = new Map([
  [
    ID_NAMESPACE_LABEL,
    [NAME_PROPERTY, ID_PROPERTY, DESCRIPTION_PROPERTY, ABBREV_PROPERTY],
  ],
  [
    COLLECTION_LABEL,
    [
      NAME_PROPERTY,
      ABBREV_PROPERTY,
      LOCAL_ID_PROPERTY,
      DESCRIPTION_PROPERTY,
      // CREATION_TIME_PROPERTY,
      PERSISTENT_ID_PROPERTY,
      // HAS_TIME_SERIES_DATA_PROPERTY,
    ],
  ],
  [
    PROJECT_LABEL,
    [
      NAME_PROPERTY,
      ABBREV_PROPERTY,
      PERSISTENT_ID_PROPERTY,
      DESCRIPTION_PROPERTY,
      LOCAL_ID_PROPERTY,
      // CREATION_TIME_PROPERTY,
    ],
  ],
  [
    DCC_LABEL,
    [
      NAME_PROPERTY,
      ABBREV_PROPERTY,
      ID_PROPERTY,
      URL_PROPERTY,
      CONTACT_EMAIL_PROPERTY,
      DESCRIPTION_PROPERTY,
      CONTACT_NAME_PROPERTY,
    ],
  ],
  [
    ANALYSIS_TYPE_LABEL,
    [
      NAME_PROPERTY,
      // SYNONYMS_PROPERTY,
      ID_PROPERTY,
      DESCRIPTION_PROPERTY,
    ],
  ],
  [
    ANATOMY_LABEL,
    [
      NAME_PROPERTY,
      ID_PROPERTY,
      DESCRIPTION_PROPERTY,
      // SYNONYMS_PROPERTY
    ],
  ],
  [
    ASSAY_TYPE_LABEL,
    [
      NAME_PROPERTY,
      // SYNONYMS_PROPERTY,
      ID_PROPERTY,
      DESCRIPTION_PROPERTY,
    ],
  ],
  [
    COMPOUND_LABEL,
    [
      NAME_PROPERTY,
      // SYNONYMS_PROPERTY,
      ID_PROPERTY,
    ],
  ],
  [
    DATA_TYPE_LABEL,
    [
      NAME_PROPERTY,
      DESCRIPTION_PROPERTY,
      // SYNONYMS_PROPERTY,
      ID_PROPERTY,
    ],
  ],
  [
    DISEASE_LABEL,
    [
      NAME_PROPERTY,
      // SYNONYMS_PROPERTY,
      ID_PROPERTY,
      DESCRIPTION_PROPERTY,
    ],
  ],
  [
    FILE_FORMAT_LABEL,
    [
      NAME_PROPERTY,
      ID_PROPERTY,
      DESCRIPTION_PROPERTY,
      // SYNONYMS_PROPERTY
    ],
  ],
  [
    GENE_LABEL,
    [
      NAME_PROPERTY,
      ORGANISM_PROPERTY,
      ID_PROPERTY,
      DESCRIPTION_PROPERTY,
      // SYNONYMS_PROPERTY,
    ],
  ],
  [
    NCBI_TAXONOMY_LABEL,
    [
      NAME_PROPERTY,
      ID_PROPERTY,
      // SYNONYMS_PROPERTY,
      DESCRIPTION_PROPERTY,
      CLADE_PROPERTY,
    ],
  ],
  [
    PHENOTYPE_LABEL,
    [
      NAME_PROPERTY,
      ID_PROPERTY,
      DESCRIPTION_PROPERTY,
      // SYNONYMS_PROPERTY
    ],
  ],
  [
    PROTEIN_LABEL,
    [
      NAME_PROPERTY,
      ID_PROPERTY,
      // SYNONYMS_PROPERTY,
      DESCRIPTION_PROPERTY,
    ],
  ],
  [
    SAMPLE_PREP_METHOD_LABEL,
    [
      NAME_PROPERTY,
      DESCRIPTION_PROPERTY,
      // SYNONYMS_PROPERTY,
      ID_PROPERTY,
    ],
  ],
  [SUBJECT_ETHNICITY_LABEL, [NAME_PROPERTY, ID_PROPERTY, DESCRIPTION_PROPERTY]],
  [SUBJECT_RACE_LABEL, [NAME_PROPERTY, ID_PROPERTY, DESCRIPTION_PROPERTY]],
  [
    SUBJECT_GRANULARITY_LABEL,
    [NAME_PROPERTY, ID_PROPERTY, DESCRIPTION_PROPERTY],
  ],
  [SUBJECT_SEX_LABEL, [NAME_PROPERTY, ID_PROPERTY, DESCRIPTION_PROPERTY]],
  [
    SUBSTANCE_LABEL,
    [
      NAME_PROPERTY,
      // SYNONYMS_PROPERTY,
      ID_PROPERTY,
    ],
  ],
  [
    BIOSAMPLE_LABEL,
    [
      PERSISTENT_ID_PROPERTY,
      LOCAL_ID_PROPERTY,
      // CREATION_TIME_PROPERTY
    ],
  ],
  [
    FILE_LABEL,
    [
      FILENAME_PROPERTY,
      LOCAL_ID_PROPERTY,
      MIME_TYPE_PROPERTY,
      // SIZE_IN_BYTES_PROPERTY,
      MD5_PROPERTY,
      // CREATION_TIME_PROPERTY,
      PERSISTENT_ID_PROPERTY,
      SHA256_PROPERTY,
      // UNCOMPRESSED_SIZE_IN_BYTES_PROPERTY,
      DBGAP_STUDY_ID_PROPERTY,
    ],
  ],
  [
    SUBJECT_LABEL,
    [
      LOCAL_ID_PROPERTY,
      PERSISTENT_ID_PROPERTY,
      GRANULARITY_PROPERTY,
      SEX_PROPERTY,
      // AGE_AT_ENROLLMENT_PROPERTY,
      ETHNICITY_PROPERTY,
      // CREATION_TIME_PROPERTY,
    ],
  ],
  [ASSOCIATED_WITH_TYPE, [ROLE_ID_PROPERTY]],
  [
    SAMPLED_FROM_TYPE,
    [
      // AGE_AT_SAMPLING_PROPERTY
    ],
  ],
  [
    TESTED_FOR_TYPE,
    [
      // OBSERVED_PROPERTY
    ],
  ],
]);
