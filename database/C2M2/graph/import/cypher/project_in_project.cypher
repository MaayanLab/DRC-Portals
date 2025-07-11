LOAD CSV WITH HEADERS FROM 'file:///data/project_in_project.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (:IDNamespace {id: row.parent_project_id_namespace})-[:CONTAINS]->(parent_project:Project {local_id: row.parent_project_local_id})
	MATCH (:IDNamespace {id: row.child_project_id_namespace})-[:CONTAINS]->(child_project:Project {local_id: row.child_project_local_id})
	MERGE (parent_project)-[:IS_PARENT_OF {_uuid: randomUUID()}]->(child_project)
} IN TRANSACTIONS OF 10000 ROWS
