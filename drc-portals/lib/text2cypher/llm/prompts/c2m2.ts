// TODO: Should the model attempt to auto-correct misspelled terms given by the user? E.g. "diavetes" -> "diabetes"
//  - If we end up using the Synonym fulltext index, this can be offloaded to the search, but for now probably good to let the model attempt to correct misspellings
//  - We really need to add this constraint, it's very possible that the user asks something like, "Find male subjects..." and with the
//  current filtering method, "female" can be matched because we're doing a partial substring match.

// TODO: Add a rule where Synonyms should be queried *first* when the user question references a CV term, e.g., if the user asks:
// "Find subjects tested for diabetes", the model should first query Synonym nodes using the full text index on Synonym.name, and then use
// the top result as an entrypoint in the main query.

// TODO: It seems like (at least with gemma4) the model is not able to easily distinguish between AnalysisType and AssayType, and will sometimes return the wrong one.

export const COMPACT_C2M2_DOMAIN_RULES = `

### DCCs

The following DCCs are represented in the schema:

  - Genotype-Tissue Expression Project (GTEx)
  - GlyGen (GlyGen)
  - The Human Microbiome Project (HMP)
  - HuBMAP (HuBMAP)
  - Illuminating the Druggable Genome (IDG)
  - The Gabriella Miller Kids First Pediatric Research Program (KFDRC)
  - Library of Integrated Network-based Cellular Signatures (LINCS)
  - UCSD Metabolomics Workbench (MW)
  - MoTrPAC Molecular Transducers of Physical Activity Consortium (MoTrPAC)
  - Stimulating Peripheral Activity to Relieve Conditions (SPARC)
  - 4D Nucleome Data Coordination and Integration Center (4DN_DCIC)
  - The Extracellular Communication Consortium Data Coordination Center (ERCC_DCC)
  - Cell Maps for Artificial Intelligence (cm4ai)
  - Artificial Intelligence Ready and Exploratory Atlas for Diabetes Insights (aireadi)
  - Somatic Cell Genome Editing (SCGE)
  - SenNet (SenNet)

When a user asks about a DCC, use a case-insensitive partial match against the \`abbreviation\` property of the DCC node, using the abbreviations for each DCC as listed above.

\`\`\`cypher
WHERE toLower(dcc.abbreviation) CONTAINS toLower(<dcc_abbreviation>)
\`\`\`

### Term Labels

The following labels represent controlled-vocabulary Term nodes:

'Anatomy', 'Biofluid', 'Compound', 'Disease', 'Gene', 'NCBITaxonomy', 'Phenotype', 'Protein', 'Substance', 'AnalysisType', 'AssayType', 'DataType', 'FileFormat', 'SubjectEthnicity', 'SubjectGranularity', 'SubjectRace', 'SubjectSex', 'SamplePrepMethod'.

When a user supplies a value for one of these Terms, use a case-insensitive partial match against the appropriate schema property:

\`\`\`cypher
WHERE toLower(n.<property>) CONTAINS toLower(<term>)
\`\`\`

If the user writes something that appears to be a CV term but is misspelled, e.g. "diavetes" instead of "diabetes" you may correct the spelling and use the corrected term in your response.
`;
