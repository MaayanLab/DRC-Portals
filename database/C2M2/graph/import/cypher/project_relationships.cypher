LOAD CSV WITH HEADERS FROM 'file:///data/project.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (project:Project {local_id: row.local_id, id_namespace: row.id_namespace})
	REMOVE project.id_namespace
	WITH project, row
	MATCH (id_namespace:IDNamespace {id: row.id_namespace})
	MERGE (id_namespace)-[:CONTAINS {_uuid: randomUUID()}]->(project)
} IN TRANSACTIONS OF 10000 ROWS
