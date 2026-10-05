export const C2M2_PROMPT = `Domain rules override general query-construction preferences, but they do not override the Hard Constraints.

### DCC Abbreviations

The following DCCs (and their abbreviations) are represented in the schema:

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
WHERE toLower(dcc.abbreviation) CONTAINS toLower($dcc_abbreviation)
\`\`\`

### Controlled-Vocabulary Term Labels

The following labels represent controlled-vocabulary Term nodes:

- \`Anatomy\`
- \`Biofluid\`
- \`Compound\`
- \`Disease\`
- \`Gene\`
- \`NCBITaxonomy\`
- \`Phenotype\`
- \`Protein\`
- \`Substance\`
- \`AnalysisType\`
- \`AssayType\`
- \`DataType\`
- \`FileFormat\`
- \`SubjectGranularity\`
- \`SubjectSex\`
- \`SamplePrepMethod\`

When the user supplies a value for one of these Term types:

1. Use the appropriate Term label indicated by the question and schema.
2. Match against the appropriate searchable property defined for that
   label in the supplied schema.
3. Use case-insensitive partial matching.
4. Parameterize the term value.

Canonical form:

\`\`\`cypher
WHERE toLower(term.<property>) CONTAINS toLower($term)
\`\`\`

Do not assume a property exists unless it appears for that label in the
supplied schema.

If the user's value contains an obvious misspelling of a
controlled-vocabulary term, correct it only when the intended term is
unambiguous. Use the corrected value in \`params\`.

If the intended correction is ambiguous, preserve the user's original
value rather than guessing.

### SubjectEthnicity and SubjectRace

\`SubjectEthnicity\` and \`SubjectRace\` are special controlled-vocabulary
Term nodes that use exact matching rather than partial matching.

Valid \`SubjectRace\` names are:

- \`American Indian or Alaska Native\`
- \`Asian or Pacific Islander\`
- \`Black or African American\`
- \`White\`
- \`Other\`
- \`Asian\`
- \`Native Hawaiian or Other Pacific Islander\`

Valid \`SubjectEthnicity\` names are:

- \`Hispanic or Latino\`
- \`not Hispanic or Latino\`

When the user's value clearly corresponds to one of these values:

- Map race values only to \`SubjectRace\`.
- Map ethnicity values only to \`SubjectEthnicity\`.
- Use the exact canonical value listed above as the parameter value.
- Do not infer race from ethnicity or ethnicity from race.
- If the user explicitly supplies both a race and an ethnicity, both
  constraints may be used if the supplied schema supports both
  relationships.

Example:

User question:

> Find Latino Down's syndrome subjects.

Relevant filtering pattern:

\`\`\`cypher
MATCH (disease:Disease)<-[:TESTED_FOR]-(subject:Subject)-[:HAS_ETHNICITY]->(ethnicity:SubjectEthnicity)
WHERE ethnicity.name = $ethnicity
  AND toLower(disease.name) CONTAINS toLower($disease)
\`\`\`

Relevant parameters:

\`\`\`json
{
  "ethnicity": "Hispanic or Latino",
  "disease": "down's syndrome"
}
\`\`\`

Example:

User question:

> Find white diabetes subjects.

Relevant filtering pattern:

\`\`\`cypher
MATCH (disease:Disease)<-[:TESTED_FOR]-(subject:Subject)-[:HAS_RACE]->(race:SubjectRace)
WHERE race.name = $race
  AND toLower(disease.name) CONTAINS toLower($disease)
\`\`\`

Relevant parameters:

\`\`\`json
{
  "race": "White",
  "disease": "diabetes"
}
\`\`\`

### AssayType, AnalysisType, and DataType

\`AssayType\`, \`AnalysisType\`, and \`DataType\` may contain semantically overlapping terms.

When a user-supplied term could reasonably correspond to \`AssayType\` and one or both of the other labels, prefer \`AssayType\`.

Use \`AnalysisType\` or \`DataType\` when the user's wording clearly identifies that concept, when the term cannot reasonably be interpreted as an \`AssayType\`, or when the supplied schema does not provide an appropriate \`AssayType\` pathway for the requested entity.

Do not query multiple labels solely because the user's term could semantically match more than one of these labels. Use the single label that best represents the user's intent, giving \`AssayType\` priority when the choice is ambiguous.

### Decomposing Compound Search Terms

When two or more neighboring words or phrases in the user's question can reasonably be interpreted as separate schema entities or controlled-vocabulary terms, prefer decomposing them into separate constraints rather than searching for the entire phrase against a single Term node.

For each recognized term:

1. Identify the most appropriate schema label for that term.
2. Match each term separately using a valid schema pathway.
3. Apply all recognized constraints to the requested result entity.
4. Parameterize each term separately.

For example:

- "human liver" should normally be interpreted as \`NCBITaxonomy\` = "human" AND \`Anatomy\` = "liver", not \`Anatomy\` = "human liver".
- "brain cancer" should normally be interpreted as \`Anatomy\` = "brain" AND \`Disease\` = "cancer", not \`Disease\` = "brain cancer" or \`Anatomy\` = "brain cancer".
- "mouse lung adenocarcinoma" may be interpreted as \`NCBITaxonomy\` = "mouse", \`Anatomy\` = "lung", and \`Disease\` = "adenocarcinoma" when the supplied schema provides valid pathways for all three.

Prefer the decomposition that uses recognized schema entities and preserves all meaningful constraints expressed by the user.

Do not decompose a phrase when it is better represented as a single controlled-vocabulary term or when decomposition would change the user's intended meaning.

Do not invent additional constraints that are not expressed or strongly implied by the user's wording.

### Project vs. Collection

\`Project\` and \`Collection\` may represent semantically overlapping groupings of C2M2 data.

When the user's question could reasonably be answered using either a \`Project\` or a \`Collection\`, prefer \`Project\`.

Use \`Collection\` instead when the user's wording clearly and specifically refers to a collection, or when the supplied schema does not provide an appropriate \`Project\` pathway for the requested information.

Do not query both \`Project\` and \`Collection\` solely because either could satisfy an ambiguous request. Use the single entity that best represents the user's intent, giving \`Project\` priority when the choice is unclear.

For example:

- "Find liver datasets" should prefer a pathway through \`Project\` when both \`Project\` and \`Collection\` provide valid pathways.
- "Find projects containing liver data" should use \`Project\`.
- "Find collections containing liver data" should use \`Collection\`.

The \`Project\` preference is a tie-breaker for ambiguous requests. It does not override explicit user intent.
`;
