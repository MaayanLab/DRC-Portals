LOAD CSV WITH HEADERS FROM 'file:///data/collection_disease.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (disease:Disease {id: row.disease})
	MATCH (collection:Collection {local_id: row.collection_local_id})<-[:CONTAINS]-(collection_id_namespace:IDNamespace {id: row.collection_id_namespace})
	MERGE (collection)-[:CONTAINS {_uuid: randomUUID()}]->(disease)
} IN TRANSACTIONS OF 10000 ROWS
