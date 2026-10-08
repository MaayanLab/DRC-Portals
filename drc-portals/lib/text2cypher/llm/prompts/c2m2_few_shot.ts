export const C2M2_FEW_SHOT = `
### Example 1: User searches for a DCC

**Question**

> Find metabolomics workbench projects.

**Response**

\`\`\`json
{
  "cypher": "MATCH (dcc:DCC)-[contains:CONTAINS]->(project:Project)\nWHERE toLower(dcc.abbreviation) CONTAINS toLower($dcc_abbreviation)\nWITH DISTINCT dcc, contains, project\nRETURN collect(DISTINCT {dcc: dcc, contains: contains, project: project}) AS rows",
  "params": {
    "dcc_abbreviation": "MW"
  },
  "error": null
}
\`\`\`

### Example 2: User provides a CV term parameter

**Question**

> Find glioblastoma studies.

**Response**

\`\`\`json
{
  "cypher": "CALL () {\n MATCH (project:Project)-[contains:CONTAINS]->(entity:Subject)-[tested_for:TESTED_FOR]->(disease:Disease)\n WHERE toLower(disease.name) CONTAINS toLower($disease)\n  RETURN project, contains, entity, tested_for, disease\n  UNION\n  MATCH (project:Project)-[contains:CONTAINS]->(entity:Biosample)-[tested_for:TESTED_FOR]->(disease:Disease)\n  WHERE toLower(disease.name) CONTAINS toLower($disease)\n RETURN project, contains, entity, tested_for, disease\n}\nWITH DISTINCT project, contains, entity, tested_for, disease\nRETURN collect(DISTINCT {project: project, contains: contains, subject_or_biosample: entity, tested_for: tested_for, disease: disease}) AS rows",
  "params": {
    "disease": "glioblastoma"
  },
  "error": null
}
\`\`\`

### Example 3: User filters on SubjectEthnicity

**Question**

> Find Latino diabetes patients.

**Response**

\`\`\`json
{
  "cypher": "MATCH (disease:Disease)<-[tested_for:TESTED_FOR]-(subject:Subject)-[is_ethnicity:IS_ETHNICITY]->(ethnicity:SubjectEthnicity)\nWHERE toLower(disease.name) CONTAINS toLower($disease) AND ethnicity.name = $ethnicity\nWITH DISTINCT disease, tested_for, subject, is_ethnicity, ethnicity\nRETURN collect(DISTINCT {disease: disease, tested_for: tested_for, subject: subject, is_ethnicity: is_ethnicity, ethnicity: ethnicity}) AS rows",
  "params": {
    "ethnicity": "Hispanic or Latino",
    "disease": "diabetes"
  },
  "error": null
}
\`\`\`

### Example 4: User filters on SubjectRace

**Question**

> Find black Alzheimer's patients.

**Response**

\`\`\`json
{
  "cypher": "MATCH (disease:Disease)<-[tested_for:TESTED_FOR]-(subject:Subject)-[is_race:IS_RACE]->(race:SubjectRace)\nWHERE toLower(disease.name) CONTAINS toLower($disease) AND race.name = $race\nWITH DISTINCT disease, tested_for, subject, is_race, race\nRETURN collect(DISTINCT {disease: disease, tested_for: tested_for, subject: subject, is_race: is_race, race: race}) AS rows",
  "params": {
    "race": "Black or African American",
    "disease": "alzheimer's"
  },
  "error": null
}
\`\`\`

### Example 5: User filters on SubjectSex

**Question**

> Find male Alzheimer's patients.

**Response**

\`\`\`json
{
  "cypher": "MATCH (disease:Disease)<-[tested_for:TESTED_FOR]-(subject:Subject)-[is_sex:IS_SEX]->(sex:SubjectSex)\nWHERE toLower(disease.name) CONTAINS toLower($disease) AND sex.name = $sex\nWITH DISTINCT disease, tested_for, subject, is_sex, sex\nRETURN collect(DISTINCT {disease: disease, tested_for: tested_for, subject: subject, is_sex: is_sex, sex: sex}) AS rows",
  "params": {
    "sex": "Male",
    "disease": "alzheimer's"
  },
  "error": null
}
\`\`\`

### Example 6: Prefer AssayType for an Ambiguous Term

**Question**

> Find RNA-seq projects.

**Response**

\`\`\`json
{
  "cypher": "MATCH (project:Project)-[contains:CONTAINS]->(biosample:Biosample)-[generated_by_assay_type:GENERATED_BY_ASSAY_TYPE]->(assay_type:AssayType)\nWHERE toLower(assay_type.name) CONTAINS toLower($assay_type)\nWITH DISTINCT project, contains, biosample, generated_by_assay_type, assay_type\nRETURN collect(DISTINCT {project: project, contains: contains, biosample: biosample, generated_by_assay_type: generated_by_assay_type, assay_type: assay_type}) AS rows",
  "params": {
    "assay_type": "RNA-seq"
  },
  "error": null
}
\`\`\`

### Example 7: Use AnalysisType When Explicitly Requested

**Question**

> Find projects with differential gene expression analysis.

**Response**

\`\`\`json
{
  "cypher": "MATCH (project:Project)-[contains:CONTAINS]->(file:File)-[generated_by_analysis_type:GENERATED_BY_ANALYSIS_TYPE]->(analysis_type:AnalysisType)\nWHERE toLower(analysis_type.name) CONTAINS toLower($analysis_type)\nWITH DISTINCT project, contains, file, generated_by_analysis_type, analysis_type\nRETURN collect(DISTINCT {project: project, contains: contains, file: file, generated_by_analysis_type: generated_by_analysis_type, analysis_type: analysis_type}) AS rows",
  "params": {
    "analysis_type": "differential gene expression"
  },
  "error": null
}
\`\`\`

### Example 8: Use DataType When Explicitly Requested

**Question**

> Find studies containing gene expression data.

**Response**

\`\`\`json
{
  "cypher": "MATCH (project:Project)-[contains:CONTAINS]->(file:File)-[is_data_type:IS_DATA_TYPE]->(data_type:DataType)\nWHERE toLower(data_type.name) CONTAINS toLower($data_type)\nWITH DISTINCT project, contains, file, is_data_type, data_type\nRETURN collect(DISTINCT {project: project, contains: contains, file: file, is_data_type: is_data_type, data_type: data_type}) AS rows",
  "params": {
    "data_type": "gene expression"
  },
  "error": null
}
\`\`\`

### Example 9: Separate Anatomy and Disease Terms

**Question**

> Find brain cancer studies.

**Response**

\`\`\`json
{
  "cypher": "MATCH (project:Project)-[contains:CONTAINS]->(subject:Subject)<-[sampled_from_subject:SAMPLED_FROM]-(biosample:Biosample)-[sampled_from_anatomy:SAMPLED_FROM]->(anatomy:Anatomy)\nMATCH (subject)-[tested_for:TESTED_FOR]->(disease:Disease)\nWHERE toLower(anatomy.name) CONTAINS toLower($anatomy)\n  AND toLower(disease.name) CONTAINS toLower($disease)\nWITH DISTINCT project, contains, subject, sampled_from_subject, biosample, sampled_from_anatomy, anatomy, tested_for, disease\nRETURN collect(DISTINCT {project: project, contains: contains, subject: subject, sampled_from_subject: sampled_from_subject, biosample: biosample, sampled_from_anatomy: sampled_from_anatomy, anatomy: anatomy, tested_for: tested_for, disease: disease}) AS rows",
  "params": {
    "anatomy": "brain",
    "disease": "cancer"
  },
  "error": null
}
\`\`\`

### Example 10: Separate Organism and Anatomy Terms

**Question**

> Find human liver studies.

**Response**

\`\`\`json
{
  "cypher": "MATCH (project:Project)-[contains:CONTAINS]->(subject:Subject)<-[sampled_from_subject:SAMPLED_FROM]-(biosample:Biosample)-[sampled_from_anatomy:SAMPLED_FROM]->(anatomy:Anatomy)\nMATCH (subject)-[associated_with:ASSOCIATED_WITH]->(taxonomy:NCBITaxonomy)\nWHERE toLower(anatomy.name) CONTAINS toLower($anatomy)\n  AND toLower(taxonomy.name) CONTAINS toLower($organism)\nWITH DISTINCT project, contains, subject, sampled_from_subject, biosample, sampled_from_anatomy, anatomy, associated_with, taxonomy\nRETURN collect(DISTINCT {project: project, contains: contains, subject: subject, sampled_from_subject: sampled_from_subject, biosample: biosample, sampled_from_anatomy: sampled_from_anatomy, anatomy: anatomy, associated_with: associated_with, taxonomy: taxonomy}) AS rows",
  "params": {
    "anatomy": "liver",
    "organism": "human"
  },
  "error": null
}
\`\`\`

### Example 11: Decompose Three Neighboring Terms

**Question**

> Find mouse lung adenocarcinoma subjects.

**Response**

\`\`\`json
{
  "cypher": "MATCH (subject:Subject)<-[sampled_from_subject:SAMPLED_FROM]-(biosample:Biosample)-[sampled_from_anatomy:SAMPLED_FROM]->(anatomy:Anatomy)\nMATCH (subject)-[tested_for:TESTED_FOR]->(disease:Disease)\nMATCH (subject)-[associated_with:ASSOCIATED_WITH]->(taxonomy:NCBITaxonomy)\nWHERE toLower(anatomy.name) CONTAINS toLower($anatomy)\n  AND toLower(disease.name) CONTAINS toLower($disease)\n AND toLower(taxonomy.name) CONTAINS toLower($organism)\nWITH DISTINCT subject, sampled_from_subject, biosample, sampled_from_anatomy, anatomy, tested_for, disease, associated_with, taxonomy\nRETURN collect(DISTINCT {subject: subject, sampled_from_subject: sampled_from_subject, biosample: biosample, sampled_from_anatomy: sampled_from_anatomy, anatomy: anatomy, tested_for: tested_for, disease: disease, associated_with: associated_with, taxonomy: taxonomy}) AS rows",
  "params": {
    "anatomy": "lung",
    "disease": "adenocarcinoma",
    "organism": "mouse"
  },
  "error": null
}
\`\`\`

### Example 12: Prefer Project When Project and Collection Are Both Reasonable

**Question**

> Find liver datasets.

**Response**

\`\`\`json
{
  "cypher": "MATCH (project:Project)-[contains:CONTAINS]->(biosample:Biosample)-[sampled_from:SAMPLED_FROM]->(anatomy:Anatomy)\nWHERE toLower(anatomy.name) CONTAINS toLower($anatomy)\nWITH DISTINCT project, contains, biosample, sampled_from, anatomy\nRETURN collect(DISTINCT {project: project, contains: contains, biosample: biosample, sampled_from: sampled_from, anatomy: anatomy}) AS rows",
  "params": {
    "anatomy": "liver"
  },
  "error": null
}
\`\`\`

### Example 13: Use Project When Explicitly Requested

**Question**

> Find projects containing brain cancer data.

**Response**

\`\`\`json
{
  "cypher": "MATCH (project:Project)-[contains:CONTAINS]->(biosample:Biosample)-[sampled_from:SAMPLED_FROM]->(anatomy:Anatomy)\nMATCH (biosample)-[tested_for:TESTED_FOR]->(disease:Disease)\nWHERE toLower(anatomy.name) CONTAINS toLower($anatomy)\n  AND toLower(disease.name) CONTAINS toLower($disease)\nWITH DISTINCT project, contains, biosample, sampled_from, anatomy, tested_for, disease\nRETURN collect(DISTINCT {project: project, contains: contains, biosample: biosample, sampled_from: sampled_from, anatomy: anatomy, tested_for: tested_for, disease: disease}) AS rows",
  "params": {
    "anatomy": "brain",
    "disease": "cancer"
  },
  "error": null
}
\`\`\`

### Example 14: Use Collection When Explicitly Requested

**Question**

> Find collections containing brain cancer data.
**Response**

\`\`\`json
{
  "cypher": "MATCH (collection:Collection)-[contains:CONTAINS]->(biosample:Biosample)-[sampled_from:SAMPLED_FROM]->(anatomy:Anatomy)\nMATCH (biosample)-[tested_for:TESTED_FOR]->(disease:Disease)\nWHERE toLower(anatomy.name) CONTAINS toLower($anatomy)\n  AND toLower(disease.name) CONTAINS toLower($disease)\nWITH DISTINCT collection, contains, biosample, sampled_from, anatomy, tested_for, disease\nRETURN collect(DISTINCT {collection: collection, contains: contains, biosample: biosample, sampled_from: sampled_from, anatomy: anatomy, tested_for: tested_for, disease: disease}) AS rows",
  "params": {
    "anatomy": "brain",
    "disease": "cancer"
  },
  "error": null
}
\`\`\`
`;
