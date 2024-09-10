LOAD CSV WITH HEADERS FROM 'file:///data/biosample.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (biosample:Biosample {local_id: row.local_id, persistent_id: row.persistent_id, id_namespace: row.id_namespace, project_local_id: row.project_local_id, creation_time: row.creation_time, _uuid: randomUUID()})
} IN TRANSACTIONS OF 10000 ROWS
