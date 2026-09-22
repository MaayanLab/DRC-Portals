export const MW_DOMAIN_RULES = `

### Projects and Studies

When a user asks a question filtering by project or study description, use a case-insensitive partial match against both the \`summary\` and \`title\` properties of the Project or Study node.

For example, if the user asks for "studies about diabetes", you may use:

\`\`\`cypher
WHERE toLower(study.summary) CONTAINS toLower(<term>) OR toLower(study.title) CONTAINS toLower(<term>)
\`\`\`

### Term Labels

The following labels represent controlled-vocabulary nodes:

'Class', 'Disease', 'Kingdom', 'Metabolite', 'RefMet', 'Species'

When a user supplies a value for one of these terms, use a case-insensitive partial match against the appropriate schema property:

\`\`\`cypher
WHERE toLower(n.<property>) CONTAINS toLower(<term>)
\`\`\`

If the user writes something that appears to be a term but is misspelled, e.g. "diavetes" instead of "diabetes" you may correct the spelling and use the corrected term in your response.
`;
