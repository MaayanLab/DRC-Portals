import { TEXT_2_CYPHER_NODE_LABEL } from "@/lib/text2cypher/constants/cy/styles/defaults";
import mwSchema from "@/lib/text2cypher/neo4j/schemas/mw";
import { SchemaTemplates } from "@/lib/text2cypher/schema/types";

export const templates: SchemaTemplates = [
  {
    id: "studies-by-project",
    name: "Studies by Project",
    description: "Studies associated with a specific project.",
    query: `MATCH
  (project:${mwSchema.PROJECT})-[includes:${mwSchema.INCLUDES_STUDY}]->(study:${mwSchema.STUDY})
  WHERE toLower(project.title) CONTAINS toLower($project_title)
WITH project, study, includes
LIMIT 10
RETURN
  collect(DISTINCT project) +
  collect(DISTINCT study) AS nodes,
  collect(DISTINCT includes) AS edges`,
    params: [
      {
        name: "project_title",
        type: "text",
        example: "Metabolomics Workbench",
      },
    ],
  },
  {
    id: "studies-by-organism",
    name: "Studies by Organism",
    description: "Studies where subjects belong to a specific organism.",
    query: `MATCH
  (st:${mwSchema.STUDY})-[study_references_source:${mwSchema.STUDY_REFERENCES_SOURCE}]->(src:${mwSchema.SAMPLE_SOURCE}),
  (src)<-[sampled_from_source:${mwSchema.SAMPLED_FROM_SOURCE}]-(sample:${mwSchema.SAMPLE}),
  (sample)-[sampled_from_species:${mwSchema.SAMPLED_FROM_SPECIES}]->(spc:${mwSchema.SPECIES})
WHERE toLower(spc.name) CONTAINS toLower($organism_name) OR toLower(spc.common_name) CONTAINS toLower($organism_name)
WITH st, study_references_source, src, sampled_from_source, sample, sampled_from_species, spc
LIMIT 10
RETURN
  collect(DISTINCT st) +
  collect(DISTINCT src) +
  collect(DISTINCT sample) +
  collect(DISTINCT spc) AS nodes,
  collect(DISTINCT study_references_source) +
  collect(DISTINCT sampled_from_source) +
  collect(DISTINCT sampled_from_species) AS edges`,
    params: [
      {
        name: "organism_name",
        type: "text",
        example: "Homo sapiens",
      },
    ],
  },
  {
    id: "instrument-chain",
    name: "Instrument Chain",
    description:
      "All instruments and their properties used in a specific study.",
    query: `MATCH
  (study:${mwSchema.STUDY})-[study_produced_analysis:${mwSchema.STUDY_PRODUCED_ANALYSIS}]->(analysis:${mwSchema.ANALYSIS})
WHERE study.id = $study_id
OPTIONAL MATCH
  (ms:${mwSchema.MS})<-[derived_from_ms:${mwSchema.DERIVED_FROM_MS}]-(analysis)
OPTIONAL MATCH
  (chr:${mwSchema.CHROMATOGRAPHY})<-[derived_from_chrom:${mwSchema.DERIVED_FROM_CHROMATOGRAPHY}]-(analysis)
OPTIONAL MATCH
  (nmr:${mwSchema.NMR})<-[derived_from_nmr:${mwSchema.DERIVED_FROM_NMR}]-(analysis)
RETURN
  collect(DISTINCT study) +
  collect(DISTINCT analysis) +
  collect(DISTINCT ms) +
  collect(DISTINCT chr) +
  collect(DISTINCT nmr) AS nodes,
  collect(DISTINCT study_produced_analysis) +
  collect(DISTINCT derived_from_ms) +
  collect(DISTINCT derived_from_chrom) +
  collect(DISTINCT derived_from_nmr) AS edges`,
    params: [
      {
        name: "study_id",
        type: "text",
        example: "ST001933",
      },
    ],
  },
  {
    id: "analysis-type-summary",
    name: "Analysis Type Summary",
    description: "MS vs NMR analysis breakdown for a specific project.",
    query: `MATCH
  (project:${mwSchema.PROJECT})-[includes:${mwSchema.INCLUDES_STUDY}]->(study:${mwSchema.STUDY})-[:${mwSchema.STUDY_PRODUCED_ANALYSIS}]->(analysis:${mwSchema.ANALYSIS})
WHERE project.id = 'PR001222'
WITH project, includes, study, analysis
OPTIONAL MATCH (analysis)-[:${mwSchema.DERIVED_FROM_MS}]->(ms:${mwSchema.MS})
WITH project, includes, study, analysis, count(ms) AS ms_count
OPTIONAL MATCH (analysis)-[:${mwSchema.DERIVED_FROM_NMR}]->(nmr:${mwSchema.NMR})
WITH project, includes, study, analysis, ms_count, count(nmr) AS nmr_count
OPTIONAL MATCH (analysis)-[:${mwSchema.DERIVED_FROM_CHROMATOGRAPHY}]->(chr:${mwSchema.CHROMATOGRAPHY})
WITH project, includes, study, analysis, ms_count, nmr_count, count(chr) AS chr_count
WITH DISTINCT project, includes, study, ms_count, 'ms_count_' + randomUUID() AS ms_count_id, nmr_count, 'nmr_count_' + randomUUID() AS nmr_count_id, chr_count, 'chr_count_' + randomUUID() AS chr_count_id
LIMIT 10
RETURN
  collect(DISTINCT project) +
  collect(DISTINCT study) +
  collect(DISTINCT {
    id: nmr_count_id,
    labels: ['${TEXT_2_CYPHER_NODE_LABEL}'],
    properties: { value: '# of NMR Analyses: ' + toString(nmr_count) }
  }) +
  collect(DISTINCT {
    id: ms_count_id,
    labels: ['${TEXT_2_CYPHER_NODE_LABEL}'],
    properties: { value: '# of MS Analyses: ' + toString(ms_count) }
  }) +
  collect(DISTINCT {
    id: chr_count_id,
    labels: ['${TEXT_2_CYPHER_NODE_LABEL}'],
    properties: { value: '# of Chromatography Analyses: ' + toString(chr_count) }
  }) AS nodes,
  collect(DISTINCT includes) +
  collect(DISTINCT {
    type: 'HAS_NMR_COUNT',
    isSynthetic: true,
    startNodeElementId: toString(elementId(study)),
    endNodeElementId: nmr_count_id,
    properties: {}
  }) +
  collect(DISTINCT {
    type: 'HAS_MS_COUNT',
    isSynthetic: true,
    startNodeElementId: toString(elementId(study)),
    endNodeElementId: ms_count_id,
    properties: {}
  }) +
  collect(DISTINCT {
    type: 'HAS_CHROMATOGRAPHY_COUNT',
    isSynthetic: true,
    startNodeElementId: toString(elementId(study)),
    endNodeElementId: chr_count_id,
    properties: {}
  }) AS edges`,
    params: [
      {
        name: "project_id",
        type: "text",
        example: "PR001222",
      },
    ],
  },
];
