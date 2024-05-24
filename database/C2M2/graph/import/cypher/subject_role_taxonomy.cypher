LOAD CSV WITH HEADERS FROM 'file:///data/subject_role_taxonomy.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (subject:Subject {local_id: row.subject_local_id})<-[:CONTAINS]-(subject_id_namespace:IDNamespace {id: row.subject_id_namespace})
	MATCH (ncbi_taxonomy:NCBITaxonomy {id: row.taxonomy_id})
	MERGE (subject)-[:ASSOCIATED_WITH {role_id: row.role_id}]-(ncbi_taxonomy)
} IN TRANSACTIONS OF 10000 ROWS
