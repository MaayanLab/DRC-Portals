import { TEXT_2_CYPHER_NODE_LABEL } from "@/lib/text2cypher/constants/cy/styles/defaults";
import c2m2Schema from "@/lib/text2cypher/neo4j/schemas/c2m2";
import { SchemaTemplates } from "@/lib/text2cypher/schema/types";

export const templates: SchemaTemplates = [
  {
    id: "subjects-by-disease",
    name: "Subjects by Disease",
    description:
      "Subjects tested for a specific disease, and their parent projects.",
    query: `MATCH
  (disease:Disease {name: $disease_name})<-[testedFor:${c2m2Schema.TESTED_FOR}]-(subject:${c2m2Schema.SUBJECT}),
  (project:${c2m2Schema.PROJECT})-[contains:${c2m2Schema.CONTAINS}]->(subject),
  (subject)-[associatedWith:${c2m2Schema.ASSOCIATED_WITH}]->(organism:${c2m2Schema.NCBI_TAXONOMY})
WITH disease, subject, project, organism, testedFor, contains, associatedWith
LIMIT 10
RETURN
  collect(DISTINCT disease) +
  collect(DISTINCT subject) +
  collect(DISTINCT project) +
  collect(DISTINCT organism) AS nodes,
  collect(DISTINCT testedFor) +
  collect(DISTINCT contains) +
  collect(DISTINCT associatedWith) AS edges`,
    params: [
      {
        name: "disease_name",
        type: "text",
        example: "diabetes mellitus",
      },
    ],
  },
  {
    id: "dcc-summary",
    name: "DCC Summary",
    description:
      "Overview of a DCC — project count, biosample count, subject count.",
    query: `MATCH (d:${c2m2Schema.DCC})
WHERE
  toLower(d.name) CONTAINS toLower($dcc_name)
  OR toLower(d.abbreviation) CONTAINS toLower($dcc_name)
WITH d
OPTIONAL MATCH (d)-[:${c2m2Schema.CONTAINS}]->(p:${c2m2Schema.PROJECT})
WITH d, count(DISTINCT p) AS project_count
OPTIONAL MATCH (d)-[:${c2m2Schema.CONTAINS}]->(b:${c2m2Schema.BIOSAMPLE})
WITH d, project_count, count(DISTINCT b) AS biosample_count
OPTIONAL MATCH (d)-[:${c2m2Schema.CONTAINS}]->(s:${c2m2Schema.SUBJECT})
WITH d, project_count, biosample_count, count(DISTINCT s) AS subject_count
WITH DISTINCT d, project_count, 'project_count_' + randomUUID() AS project_count_id, biosample_count, 'biosample_count_' + randomUUID() AS biosample_count_id, subject_count, 'subject_count_' + randomUUID() AS subject_count_id
LIMIT 10
RETURN
  collect(DISTINCT d) +
  collect(DISTINCT {
    id: project_count_id,
    labels: ['${TEXT_2_CYPHER_NODE_LABEL}'],
    properties: { value: '# of Projects: ' + toString(project_count) }
  }) +
  collect(DISTINCT {
      id: biosample_count_id,
      labels: ['${TEXT_2_CYPHER_NODE_LABEL}'],
      properties: { value: '# of Biosamples: ' + toString(biosample_count) }
  }) +
  collect(DISTINCT {
    id: subject_count_id,
    labels: ['${TEXT_2_CYPHER_NODE_LABEL}'],
    properties: { value: '# of Subjects: ' + toString(subject_count) }
  }) AS nodes,
  collect(DISTINCT {
    type: 'HAS_PROJECT_COUNT',
    isSynthetic: true,
    startNodeElementId: toString(elementId(d)),
    endNodeElementId: project_count_id,
    properties: {}
  }) +
  collect(DISTINCT {
    type: 'HAS_BIOSAMPLE_COUNT',
    isSynthetic: true,
    startNodeElementId: toString(elementId(d)),
    endNodeElementId: biosample_count_id,
    properties: {}
  }) +
  collect(DISTINCT {
    type: 'HAS_SUBJECT_COUNT',
    isSynthetic: true,
    startNodeElementId: toString(elementId(d)),
    endNodeElementId: subject_count_id,
    properties: {}
  }) AS edges`,
    params: [
      {
        name: "dcc_name",
        type: "text",
        example: "Metabolomics Workbench",
      },
    ],
  },
  {
    id: "biosamples-by-anatomy",
    name: "Biosamples by Anatomy",
    description:
      "All projects and collections with biosamples from a given anatomy term.",
    query: `MATCH (a:${c2m2Schema.ANATOMY})
WHERE toLower(a.name) CONTAINS toLower($anatomy_term)
WITH a
CALL (a) {
  MATCH
    (a)<-[sampled_from:${c2m2Schema.SAMPLED_FROM}]-(b:${c2m2Schema.BIOSAMPLE}),
    (b)<-[n_contains_biosample:${c2m2Schema.CONTAINS}]-(n:${c2m2Schema.PROJECT})
  RETURN DISTINCT b, sampled_from, n_contains_biosample, n
  UNION
  MATCH
    (a)<-[sampled_from:${c2m2Schema.SAMPLED_FROM}]-(b:${c2m2Schema.BIOSAMPLE}),
    (b)<-[n_contains_biosample:${c2m2Schema.CONTAINS}]-(n:${c2m2Schema.COLLECTION})
  RETURN DISTINCT b, sampled_from, n_contains_biosample, n
}
WITH a, b, sampled_from, n_contains_biosample, n
LIMIT 10
RETURN
  collect(DISTINCT a) +
  collect(DISTINCT b) +
  collect(DISTINCT n) AS nodes,
  collect(DISTINCT sampled_from) +
  collect(DISTINCT n_contains_biosample) AS edges`,
    params: [
      {
        name: "anatomy_term",
        type: "text",
        example: "liver",
      },
    ],
  },
  {
    id: "studies-by-disease",
    name: "Studies by Disease",
    description: "All projects and collections associated with a disease term.",
    query: `MATCH (d:${c2m2Schema.DISEASE})
WHERE
    toLower(d.name) CONTAINS toLower($disease_term)
WITH d
CALL (d) {
    OPTIONAL MATCH
        (d)<-[cnxn_to_d:${c2m2Schema.TESTED_FOR}]-(cnxn:${c2m2Schema.BIOSAMPLE}),
        (cnxn)<-[st_to_cnxn:${c2m2Schema.CONTAINS}]-(st:${c2m2Schema.PROJECT})
    RETURN cnxn_to_d, cnxn, st_to_cnxn, st
    UNION
    OPTIONAL MATCH
        (d)<-[cnxn_to_d:${c2m2Schema.TESTED_FOR}]-(cnxn:${c2m2Schema.BIOSAMPLE}),
        (cnxn)<-[st_to_cnxn:${c2m2Schema.CONTAINS}]-(st:${c2m2Schema.COLLECTION})
    RETURN cnxn_to_d, cnxn, st_to_cnxn, st
    UNION
    OPTIONAL MATCH
        (d)<-[cnxn_to_d:${c2m2Schema.TESTED_FOR}]-(cnxn:${c2m2Schema.SUBJECT}),
        (cnxn)<-[st_to_cnxn:${c2m2Schema.CONTAINS}]-(st:${c2m2Schema.PROJECT})
    RETURN cnxn_to_d, cnxn, st_to_cnxn, st
    UNION
    OPTIONAL MATCH
        (d)<-[cnxn_to_d:${c2m2Schema.TESTED_FOR}]-(cnxn:${c2m2Schema.SUBJECT}),
        (cnxn)<-[st_to_cnxn:${c2m2Schema.CONTAINS}]-(st:${c2m2Schema.COLLECTION})
    RETURN cnxn_to_d, cnxn, st_to_cnxn, st
}
WITH
  d,
  cnxn,
  cnxn_to_d,
  st,
  st_to_cnxn
LIMIT 10
WITH
  d,
  collect(DISTINCT d) +
  collect(DISTINCT cnxn) +
  collect(DISTINCT st) AS nodes,
  collect(DISTINCT cnxn_to_d) +
  collect(DISTINCT st_to_cnxn) AS edges
MATCH (d)<-[st_to_d:${c2m2Schema.CONTAINS}]-(st:${c2m2Schema.COLLECTION})
WITH d, nodes, edges, st_to_d, st
LIMIT 10
WITH nodes, collect(DISTINCT st) AS new_nodes, edges, collect(DISTINCT st_to_d) AS new_edges
RETURN nodes + new_nodes AS nodes, edges + new_edges AS edges`,
    params: [
      {
        name: "disease_term",
        type: "text",
        example: "cirrhosis",
      },
    ],
  },
  {
    id: "files-by-assay-type",
    name: "Files by Assay Type",
    description:
      "Files generated by a given assay type with file format breakdown.",
    query: `MATCH (f:File)-[:${c2m2Schema.GENERATED_BY_ASSAY_TYPE}]->(at:${c2m2Schema.ASSAY_TYPE})
WHERE toLower(at.name) CONTAINS toLower($assay_term)
OPTIONAL MATCH (f)-[:${c2m2Schema.IS_FILE_FORMAT}]->(ff:${c2m2Schema.FILE_FORMAT})
OPTIONAL MATCH (f)-[:${c2m2Schema.IS_DATA_TYPE}]->(dt:${c2m2Schema.DATA_TYPE})
WITH DISTINCT at, ff, dt, count(f) AS file_count
LIMIT 10
WITH at, ff, dt, file_count, 'file_count_' + randomUUID() AS file_count_id
WITH
  {
    id: file_count_id,
    labels: ['${TEXT_2_CYPHER_NODE_LABEL}'],
    properties: { value: '# of Files: ' + toString(file_count) }
  } AS file_count_node, at, ff, dt,
  {
    type: 'FILE_IS_ASSAY_TYPE',
    startNodeElementId: file_count_id,
    endNodeElementId: toString(elementId(at)),
    properties: {}
  } AS at_to_file_count,
  CASE
    WHEN ff IS NULL THEN NULL
    ELSE {
      type: 'FILE_IS_FILE_FORMAT',
      isSynthetic: true,
      startNodeElementId: file_count_id,
      endNodeElementId: toString(elementId(ff)),
      properties: {}
    }
  END AS ff_to_file_count,
  CASE
    WHEN dt IS NULL THEN NULL
    ELSE {
      type: 'FILE_IS_DATA_TYPE',
      isSynthetic: true,
      startNodeElementId: file_count_id,
      endNodeElementId: toString(elementId(dt)),
      properties: {}
    }
  END AS dt_to_file_count
RETURN
  collect(DISTINCT file_count_node) +
  collect(DISTINCT at) +
  collect(DISTINCT ff) +
  collect(DISTINCT dt) AS nodes,
  collect(DISTINCT at_to_file_count) +
  collect(DISTINCT ff_to_file_count) +
  collect(DISTINCT dt_to_file_count) AS edges`,
    params: [
      {
        name: "assay_term",
        type: "text",
        example: "RNA-seq",
      },
    ],
  },
  {
    id: "subject-cohort-by-taxonomy",
    name: "Subject Cohort by Taxonomy",
    description:
      "Subject counts broken down by sex and race for a given species.",
    query: `MATCH (s:${c2m2Schema.SUBJECT})-[:${c2m2Schema.ASSOCIATED_WITH}]->(t:${c2m2Schema.NCBI_TAXONOMY})
WHERE toLower(t.name) CONTAINS toLower($species_name)
OPTIONAL MATCH (s)-[:${c2m2Schema.IS_SEX}]->(sx:${c2m2Schema.SUBJECT_SEX})
OPTIONAL MATCH (s)-[:${c2m2Schema.IS_RACE}]->(sr:${c2m2Schema.SUBJECT_RACE})
WITH DISTINCT t, sx, sr, count(s) AS subject_count
LIMIT 10
WITH t, sx, sr, subject_count, 'subject_count_' + randomUUID() AS subject_count_id
WITH
  {
    id: subject_count_id,
    labels: ['${TEXT_2_CYPHER_NODE_LABEL}'],
    properties: { value: '# of Subjects: ' + toString(subject_count) }
  } AS subject_count_node, t, sx, sr,
  {
    type: 'SUBJECT_IS_ORGANISM',
    isSynthetic: true,
    startNodeElementId: subject_count_id,
    endNodeElementId: toString(elementId(t)),
    properties: {}
  } AS organism_to_subject_count,
  CASE
    WHEN sx IS NULL THEN NULL
    ELSE {
      type: 'SUBJECT_IS_SEX',
      isSynthetic: true,
      startNodeElementId: subject_count_id,
      endNodeElementId: toString(elementId(sx)),
      properties: {}
    }
  END AS sx_to_subject_count,
  CASE
    WHEN sr IS NULL THEN NULL
    ELSE {
      type: 'SUBJECT_IS_RACE',
      isSynthetic: true,
      startNodeElementId: subject_count_id,
      endNodeElementId: toString(elementId(sr)),
      properties: {}
    }
  END AS sr_to_subject_count
RETURN
  collect(DISTINCT subject_count_node) +
  collect(DISTINCT t) +
  collect(DISTINCT sx) +
  collect(DISTINCT sr) AS nodes,
  collect(DISTINCT organism_to_subject_count) +
  collect(DISTINCT sx_to_subject_count) +
  collect(DISTINCT sr_to_subject_count) AS edges`,
    params: [
      {
        name: "species_name",
        type: "text",
        example: "Homo sapiens",
      },
    ],
  },
  {
    id: "dccs-with-drs-links",
    name: "Files With DRS Links by DCC",
    description: "",
    query: `MATCH (d:${c2m2Schema.DCC})
WHERE
  toLower(d.name) CONTAINS toLower($dcc_name)
  OR toLower(d.abbreviation) CONTAINS toLower($dcc_name)
WITH d
MATCH (f:${c2m2Schema.FILE})<-[contains:${c2m2Schema.CONTAINS}]-(d)
WHERE f.access_url IS NOT NULL AND f.access_url <> ""
WITH d, contains, f
LIMIT 10
RETURN
  collect(DISTINCT d) +
  collect(distinct f) AS nodes,
  collect(DISTINCT contains) AS edges`,
    params: [
      {
        name: "dcc_name",
        type: "text",
        example: "HuBMAP",
      },
    ],
  },
];
