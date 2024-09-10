LOAD CSV WITH HEADERS FROM 'file:///data/biosample_in_collection.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (:IDNamespace {id: row.collection_id_namespace})-[:CONTAINS]->(collection:Collection {local_id: row.collection_local_id})
	MATCH (:IDNamespace {id: row.biosample_id_namespace})-[:CONTAINS]->(biosample:Biosample {local_id: row.biosample_local_id})
	MERGE (collection)-[:CONTAINS {_uuid: randomUUID()}]->(biosample)
} IN TRANSACTIONS OF 10000 ROWS
