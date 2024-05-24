LOAD CSV WITH HEADERS FROM 'file:///data/subject_phenotype.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (subject:Subject {local_id: row.subject_local_id})<-[:CONTAINS]-(subject_id_namespace:IDNamespace {id: row.subject_id_namespace})
	MATCH (phenotype:Phenotype {id: row.phenotype})
	MERGE (subject)-[:TESTED_FOR {observed: row.association_type = "cfde_phenotype_association_type:1"}]->(phenotype)
} IN TRANSACTIONS OF 10000 ROWS
