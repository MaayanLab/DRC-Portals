LOAD CSV WITH HEADERS FROM 'file:///data/collection.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (collection:Collection {local_id: row.local_id, id_namespace: row.id_namespace})
	REMOVE collection.id_namespace
	WITH collection, row
	MATCH (id_namespace:IDNamespace {id: row.id_namespace})
	MERGE (id_namespace)-[:CONTAINS {_uuid: randomUUID()}]->(collection)
} IN TRANSACTIONS OF 10000 ROWS
