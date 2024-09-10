LOAD CSV WITH HEADERS FROM 'file:///data/collection_anatomy.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (anatomy:Anatomy {id: row.anatomy})
	MATCH (collection:Collection {local_id: row.collection_local_id})<-[:CONTAINS]-(collection_id_namespace:IDNamespace {id: row.collection_id_namespace})
	MERGE (anatomy)<-[:CONTAINS {_uuid: randomUUID()}]-(collection)
} IN TRANSACTIONS OF 10000 ROWS
