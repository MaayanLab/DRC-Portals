MATCH (dcc:DCC)-[old:CONTAINS]->(n:Project)
WITH dcc, properties(old) AS oldProps, n
CALL {
    WITH dcc, oldProps, n
    MERGE (dcc)-[new:DCC_CONTAINS_PROJECT]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (dcc:DCC)-[old:CONTAINS]->(n:Collection)
WITH dcc, properties(old) AS oldProps, n
CALL {
    WITH dcc, oldProps, n
    MERGE (dcc)-[new:DCC_CONTAINS_COLLECTION]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (dcc:DCC)-[old:CONTAINS]->(n:File)
WITH dcc, properties(old) AS oldProps, n
CALL {
    WITH dcc, oldProps, n
    MERGE (dcc)-[new:DCC_CONTAINS_FILE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (dcc:DCC)-[old:CONTAINS]->(n:Biosample)
WITH dcc, properties(old) AS oldProps, n
CALL {
    WITH dcc, oldProps, n
    MERGE (dcc)-[new:DCC_CONTAINS_BIOSAMPLE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (dcc:DCC)-[old:CONTAINS]->(n:Subject)
WITH dcc, properties(old) AS oldProps, n
CALL {
    WITH dcc, oldProps, n
    MERGE (dcc)-[new:DCC_CONTAINS_SUBJECT]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (idn:IDNamespace)-[old:CONTAINS]->(n:Project)
WITH idn, properties(old) AS oldProps, n
CALL {
    WITH idn, oldProps, n
    MERGE (idn)-[new:ID_NAMESPACE_CONTAINS_PROJECT]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (idn:IDNamespace)-[old:CONTAINS]->(n:Collection)
WITH idn, properties(old) AS oldProps, n
CALL {
    WITH idn, oldProps, n
    MERGE (idn)-[new:ID_NAMESPACE_CONTAINS_COLLECTION]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (idn:IDNamespace)-[old:CONTAINS]->(n:File)
WITH idn, properties(old) AS oldProps, n
CALL {
    WITH idn, oldProps, n
    MERGE (idn)-[new:ID_NAMESPACE_CONTAINS_FILE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (idn:IDNamespace)-[old:CONTAINS]->(n:Biosample)
WITH idn, properties(old) AS oldProps, n
CALL {
    WITH idn, oldProps, n
    MERGE (idn)-[new:ID_NAMESPACE_CONTAINS_BIOSAMPLE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (idn:IDNamespace)-[old:CONTAINS]->(n:Subject)
WITH idn, properties(old) AS oldProps, n
CALL {
    WITH idn, oldProps, n
    MERGE (idn)-[new:ID_NAMESPACE_CONTAINS_SUBJECT]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (project:Project)-[old:CONTAINS]->(n:File)
WITH project, properties(old) AS oldProps, n
CALL {
    WITH project, oldProps, n
    MERGE (project)-[new:PROJECT_CONTAINS_FILE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (project:Project)-[old:CONTAINS]->(n:Biosample)
WITH project, properties(old) AS oldProps, n
CALL {
    WITH project, oldProps, n
    MERGE (project)-[new:PROJECT_CONTAINS_BIOSAMPLE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (project:Project)-[old:CONTAINS]->(n:Subject)
WITH project, properties(old) AS oldProps, n
CALL {
    WITH project, oldProps, n
    MERGE (project)-[new:PROJECT_CONTAINS_SUBJECT]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:File)
WITH collection, properties(old) AS oldProps, n
CALL {
    WITH collection, oldProps, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_FILE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Biosample)
WITH collection, properties(old) AS oldProps, n
CALL {
    WITH collection, oldProps, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_BIOSAMPLE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Subject)
WITH collection, properties(old) AS oldProps, n
CALL {
    WITH collection, oldProps, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_SUBJECT]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Anatomy)
WITH collection, properties(old) AS oldProps, n
CALL {
    WITH collection, oldProps, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_ANATOMY]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Biofluid)
WITH collection, properties(old) AS oldProps, n
CALL {
    WITH collection, oldProps, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_BIOFLUID]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Compound)
WITH collection, properties(old) AS oldProps, n
CALL {
    WITH collection, oldProps, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_COMPOUND]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Disease)
WITH collection, properties(old) AS oldProps, n
CALL {
    WITH collection, oldProps, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_DISEASE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Gene)
WITH collection, properties(old) AS oldProps, n
CALL {
    WITH collection, oldProps, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_GENE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:NCBITaxonomy)
WITH collection, properties(old) AS oldProps, n
CALL {
    WITH collection, oldProps, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_NCBI_TAXONOMY]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Phenotype)
WITH collection, properties(old) AS oldProps, n
CALL {
    WITH collection, oldProps, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_PHENOTYPE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Protein)
WITH collection, properties(old) AS oldProps, n
CALL {
    WITH collection, oldProps, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_PROTEIN]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (collection:Collection)-[old:CONTAINS]->(n:Substance)
WITH collection, properties(old) AS oldProps, n
CALL {
    WITH collection, oldProps, n
    MERGE (collection)-[new:COLLECTION_CONTAINS_SUBSTANCE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (file:File)-[old:DESCRIBES]->(n:Biosample)
WITH file, properties(old) AS oldProps, n
CALL {
    WITH file, oldProps, n
    MERGE (file)-[new:FILE_DESCRIBES_BIOSAMPLE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (file:File)-[old:DESCRIBES]->(n:Subject)
WITH file, properties(old) AS oldProps, n
CALL {
    WITH file, oldProps, n
    MERGE (file)-[new:FILE_DESCRIBES_SUBJECT]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (biosample:Biosample)-[old:SAMPLED_FROM]->(n:Anatomy)
WITH biosample, properties(old) AS oldProps, n
CALL {
    WITH biosample, oldProps, n
    MERGE (biosample)-[new:BIOSAMPLE_SAMPLED_FROM_ANATOMY]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (biosample:Biosample)-[old:SAMPLED_FROM]->(n:Biofluid)
WITH biosample, properties(old) AS oldProps, n
CALL {
    WITH biosample, oldProps, n
    MERGE (biosample)-[new:BIOSAMPLE_SAMPLED_FROM_BIOFLUID]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (biosample:Biosample)-[old:SAMPLED_FROM]->(n:Subject)
WITH biosample, properties(old) AS oldProps, n
CALL {
    WITH biosample, oldProps, n
    MERGE (biosample)-[new:BIOSAMPLE_SAMPLED_FROM_SUBJECT]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (biosample:Biosample)-[old:TESTED_FOR]->(n:Disease)
WITH biosample, properties(old) AS oldProps, n
CALL {
    WITH biosample, oldProps, n
    MERGE (biosample)-[new:BIOSAMPLE_TESTED_FOR_DISEASE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (biosample:Biosample)-[old:TESTED_FOR]->(n:Phenotype)
WITH biosample, properties(old) AS oldProps, n
CALL {
    WITH biosample, oldProps, n
    MERGE (biosample)-[new:BIOSAMPLE_TESTED_FOR_PHENOTYPE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (biosample:Biosample)-[old:ASSOCIATED_WITH]->(n:Substance)
WITH biosample, properties(old) AS oldProps, n
CALL {
    WITH biosample, oldProps, n
    MERGE (biosample)-[new:BIOSAMPLE_ASSOCIATED_WITH_SUBSTANCE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (biosample:Biosample)-[old:ASSOCIATED_WITH]->(n:Gene)
WITH biosample, properties(old) AS oldProps, n
CALL {
    WITH biosample, oldProps, n
    MERGE (biosample)-[new:BIOSAMPLE_ASSOCIATED_WITH_GENE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (subject:Subject)-[old:ASSOCIATED_WITH]->(n:Substance)
WITH subject, properties(old) AS oldProps, n
CALL {
    WITH subject, oldProps, n
    MERGE (subject)-[new:SUBJECT_ASSOCIATED_WITH_SUBSTANCE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (subject:Subject)-[old:ASSOCIATED_WITH]->(n:NCBITaxonomy)
WITH subject, properties(old) AS oldProps, n
CALL {
    WITH subject, oldProps, n
    MERGE (subject)-[new:SUBJECT_ASSOCIATED_WITH_NCBI_TAXONOMY]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (subject:Subject)-[old:TESTED_FOR]->(n:Disease)
WITH subject, properties(old) AS oldProps, n
CALL {
    WITH subject, oldProps, n
    MERGE (subject)-[new:SUBJECT_TESTED_FOR_DISEASE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (subject:Subject)-[old:TESTED_FOR]->(n:Phenotype)
WITH subject, properties(old) AS oldProps, n
CALL {
    WITH subject, oldProps, n
    MERGE (subject)-[new:SUBJECT_TESTED_FOR_PHENOTYPE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (phenotype:Phenotype)-[old:ASSOCIATED_WITH]->(n:Gene)
WITH phenotype, properties(old) AS oldProps, n
CALL {
    WITH phenotype, oldProps, n
    MERGE (phenotype)-[new:PHENOTYPE_ASSOCIATED_WITH_GENE]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (gene:Gene)-[old:HAS_SOURCE]->(n:NCBITaxonomy)
WITH gene, properties(old) AS oldProps, n
CALL {
    WITH gene, oldProps, n
    MERGE (gene)-[new:GENE_HAS_SOURCE_NCBI_TAXONOMY]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (protein:Protein)-[old:HAS_SOURCE]->(n:NCBITaxonomy)
WITH protein, properties(old) AS oldProps, n
CALL {
    WITH protein, oldProps, n
    MERGE (protein)-[new:PROTEIN_HAS_SOURCE_NCBI_TAXONOMY]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;

MATCH (substance:Substance)-[old:ASSOCIATED_WITH]->(n:Compound)
WITH substance, properties(old) AS oldProps, n
CALL {
    WITH substance, oldProps, n
    MERGE (substance)-[new:SUBSTANCE_ASSOCIATED_WITH_COMPOUND]->(n)
    SET new = oldProps
    SET new._uuid = randomUUID()
} IN TRANSACTIONS OF 10000 ROWS;