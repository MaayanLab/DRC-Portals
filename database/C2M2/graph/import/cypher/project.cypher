LOAD CSV WITH HEADERS FROM 'file:///data/project.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (project:Project {local_id: row.local_id, persistent_id: row.persistent_id, creation_time: row.creation_time, abbreviation: row.abbreviation, name: row.name, description: row.description})
	WITH project, row
	MATCH (id_namespace:IDNamespace {id: row.id_namespace})
	MERGE (id_namespace)-[:CONTAINS]->(project)
} IN TRANSACTIONS OF 10000 ROWS
