LOAD CSV WITH HEADERS FROM 'file:///data/project.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (project:Project {local_id: row.local_id, id_namespace: row.id_namespace, persistent_id: row.persistent_id, creation_time: row.creation_time, abbreviation: row.abbreviation, name: row.name, description: row.description, _uuid: randomUUID()})
} IN TRANSACTIONS OF 10000 ROWS
