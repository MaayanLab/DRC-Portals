LOAD CSV WITH HEADERS FROM 'file:///data/subject_in_collection.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (collection:Collection {local_id: row.collection_local_id})<-[:CONTAINS]-(collection_id_namespace:IDNamespace {id: row.collection_id_namespace})
	MATCH (subject:Subject {local_id: row.subject_local_id})<-[:CONTAINS]-(subject_id_namespace:IDNamespace {id: row.subject_id_namespace})
	MERGE (collection)-[:CONTAINS]->(subject)
} IN TRANSACTIONS OF 10000 ROWS
