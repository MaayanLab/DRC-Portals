LOAD CSV WITH HEADERS FROM 'file:///data/file_in_collection.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (collection:Collection {local_id: row.collection_local_id})<-[:CONTAINS]-(collection_id_namespace:IDNamespace {id: row.collection_id_namespace})
	MATCH (file:File {local_id: row.file_local_id})<-[:CONTAINS]-(file_id_namespace:IDNamespace {id: row.file_id_namespace})
	MERGE (collection)-[:CONTAINS {_uuid: randomUUID()}]->(file)
} IN TRANSACTIONS OF 10000 ROWS
