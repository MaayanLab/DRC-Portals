LOAD CSV WITH HEADERS FROM 'file:///data/collection_protein.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (protein:Protein {id: row.protein})
	MATCH (collection:Collection {local_id: row.collection_local_id})<-[:CONTAINS]-(collection_id_namespace:IDNamespace {id: row.collection_id_namespace})
	MERGE (collection)-[:CONTAINS {_uuid: randomUUID()}]->(protein)
} IN TRANSACTIONS OF 10000 ROWS
