MATCH (dcc:DCC)-[old:CONTAINS]->(n:Project)
CALL {
    WITH dcc, old, n
    MERGE (dcc)-[new:DCC_CONTAINS_PROJECT]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (dcc:DCC)-[old:CONTAINS]->(n:Collection)
CALL {
    WITH dcc, old, n
    MERGE (dcc)-[new:DCC_CONTAINS_COLLECTION]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (dcc:DCC)-[old:CONTAINS]->(n:File)
CALL {
    WITH dcc, old, n
    MERGE (dcc)-[new:DCC_CONTAINS_FILE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (dcc:DCC)-[old:CONTAINS]->(n:Biosample)
CALL {
    WITH dcc, old, n
    MERGE (dcc)-[new:DCC_CONTAINS_BIOSAMPLE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (dcc:DCC)-[old:CONTAINS]->(n:Subject)
CALL {
    WITH dcc, old, n
    MERGE (dcc)-[new:DCC_CONTAINS_SUBJECT]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (idn:IDNamespace)-[old:CONTAINS]->(n:Project)
CALL {
    WITH idn, old, n
    MERGE (idn)-[new:ID_NAMESPACE_CONTAINS_PROJECT]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (idn:IDNamespace)-[old:CONTAINS]->(n:Collection)
CALL {
    WITH idn, old, n
    MERGE (idn)-[new:ID_NAMESPACE_CONTAINS_COLLECTION]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (idn:IDNamespace)-[old:CONTAINS]->(n:File)
CALL {
    WITH idn, old, n
    MERGE (idn)-[new:ID_NAMESPACE_CONTAINS_FILE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (idn:IDNamespace)-[old:CONTAINS]->(n:Biosample)
CALL {
    WITH idn, old, n
    MERGE (idn)-[new:ID_NAMESPACE_CONTAINS_BIOSAMPLE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (idn:IDNamespace)-[old:CONTAINS]->(n:Subject)
CALL {
    WITH idn, old, n
    MERGE (idn)-[new:ID_NAMESPACE_CONTAINS_SUBJECT]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;


MATCH (project:Project)-[old:CONTAINS]->(n:File)
CALL {
    WITH project, old, n
    MERGE (project)-[new:PROJECT_CONTAINS_FILE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (project:Project)-[old:CONTAINS]->(n:Biosample)
CALL {
    WITH project, old, n
    MERGE (project)-[new:PROJECT_CONTAINS_BIOSAMPLE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (project:Project)-[old:CONTAINS]->(n:Subject)
CALL {
    WITH project, old, n
    MERGE (project)-[new:PROJECT_CONTAINS_SUBJECT]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:File)
CALL {
    WITH collection, old, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_FILE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Biosample)
CALL {
    WITH collection, old, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_BIOSAMPLE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Subject)
CALL {
    WITH collection, old, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_SUBJECT]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Anatomy)
CALL {
    WITH collection, old, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_ANATOMY]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Biofluid)
CALL {
    WITH collection, old, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_BIOFLUID]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Compound)
CALL {
    WITH collection, old, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_COMPOUND]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Disease)
CALL {
    WITH collection, old, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_DISEASE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Gene)
CALL {
    WITH collection, old, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_GENE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:NCBITaxonomy)
CALL {
    WITH collection, old, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_NCBI_TAXONOMY]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Phenotype)
CALL {
    WITH collection, old, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_PHENOTYPE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Protein)
CALL {
    WITH collection, old, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_PROTEIN]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Substance)
CALL {
    WITH collection, old, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_SUBSTANCE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (file:File)-[old:DESCRIBES]->(n:Biosample)
CALL {
    WITH file, old, n
    MERGE (file)-[new:FILE_DESCRIBES_BIOSAMPLE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (file:File)-[old:DESCRIBES]->(n:Subject)
CALL {
    WITH file, old, n
    MERGE (file)-[new:FILE_DESCRIBES_SUBJECT]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (biosample:Biosample)-[old:SAMPLED_FROM]->(n:Anatomy)
CALL {
    WITH biosample, old, n
    MERGE (biosample)-[new:BIOSAMPLE_SAMPLED_FROM_ANATOMY]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (biosample:Biosample)-[old:SAMPLED_FROM]->(n:Biofluid)
CALL {
    WITH biosample, old, n
    MERGE (biosample)-[new:BIOSAMPLE_SAMPLED_FROM_BIOFLUID]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (biosample:Biosample)-[old:SAMPLED_FROM]->(n:Subject)
CALL {
    WITH biosample, old, n
    MERGE (biosample)-[new:BIOSAMPLE_SAMPLED_FROM_SUBJECT]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (biosample:Biosample)-[old:TESTED_FOR]->(n:Disease)
CALL {
    WITH biosample, old, n
    MERGE (biosample)-[new:BIOSAMPLE_TESTED_FOR_DISEASE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (biosample:Biosample)-[old:TESTED_FOR]->(n:Phenotype)
CALL {
    WITH biosample, old, n
    MERGE (biosample)-[new:BIOSAMPLE_TESTED_FOR_PHENOTYPE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (biosample:Biosample)-[old:ASSOCIATED_WITH]->(n:Substance)
CALL {
    WITH biosample, old, n
    MERGE (biosample)-[new:BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (biosample:Biosample)-[old:ASSOCIATED_WITH]->(n:Gene)
CALL {
    WITH biosample, old, n
    MERGE (biosample)-[new:BIOSAMPLE_ASSOCIATED_WITH_GENE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (subject:Subject)-[old:ASSOCIATED_WITH]->(n:Substance)
CALL {
    WITH subject, old, n
    MERGE (subject)-[new:SUBJECT_ASSOCIATED_WITH_SUBSTANCE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (subject:Subject)-[old:ASSOCIATED_WITH]->(n:NCBITaxonomy)
CALL {
    WITH subject, old, n
    MERGE (subject)-[new:SUBJECT_ASSOCIATED_WITH_NCBI_TAXONOMY]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (subject:Subject)-[old:TESTED_FOR]->(n:Disease)
CALL {
    WITH subject, old, n
    MERGE (subject)-[new:SUBJECT_TESTED_FOR_DISEASE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (subject:Subject)-[old:TESTED_FOR]->(n:Phenotype)
CALL {
    WITH subject, old, n
    MERGE (subject)-[new:SUBJECT_TESTED_FOR_PHENOTYPE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (phenotype:Phenotype)-[old:ASSOCIATED_WITH]->(n:Gene)
CALL {
    WITH phenotype, old, n
    MERGE (phenotype)-[new:PHENOTYPE_ASSOCIATED_WITH_GENE]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (gene:Gene)-[old:HAS_SOURCE]->(n:NCBITaxonomy)
CALL {
    WITH gene, old, n
    MERGE (gene)-[new:GENE_HAS_SOURCE_NCBI_TAXONOMY]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (protein:Protein)-[old:HAS_SOURCE]->(n:NCBITaxonomy)
CALL {
    WITH protein, old, n
    MERGE (protein)-[new:PROTEIN_HAS_SOURCE_NCBI_TAXONOMY]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (substance:Substance)-[old:ASSOCIATED_WITH]->(n:Compound)
CALL {
    WITH substance, old, n
    MERGE (substance)-[new:SUBSTANCE_ASSOCIATED_WITH_COMPOUND]->(n)
    SET new = properties(old)
} IN TRANSACTIONS OF 10000 ROWS;