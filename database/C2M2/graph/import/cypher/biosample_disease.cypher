LOAD CSV WITH HEADERS FROM 'file:///data/biosample_disease.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (biosample:Biosample {local_id: row.biosample_local_id})<-[:CONTAINS]-(biosample_id_namespace:IDNamespace {id: row.biosample_id_namespace})
	MATCH (disease:Disease {id: row.disease})
	MERGE (biosample)-[:TESTED_FOR {observed: row.association_type = "cfde_disease_association_type:1"}]->(disease)
} IN TRANSACTIONS OF 10000 ROWS
