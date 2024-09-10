LOAD CSV WITH HEADERS FROM 'file:///data/collection_defined_by_project.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (project:Project {local_id: row.project_local_id})<-[:CONTAINS]-(project_id_namespace:IDNamespace {id: row.project_id_namespace})
	MATCH (collection:Collection {local_id: row.collection_local_id})<-[:CONTAINS]-(collection_id_namespace:IDNamespace {id: row.collection_id_namespace})
	MERGE (project)<-[:DEFINED_BY {_uuid: randomUUID()}]-(collection)
} IN TRANSACTIONS OF 10000 ROWS
