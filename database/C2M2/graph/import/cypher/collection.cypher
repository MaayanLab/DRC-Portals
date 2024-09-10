LOAD CSV WITH HEADERS FROM 'file:///data/collection.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (collection:Collection {local_id: row.local_id, id_namespace: row.id_namespace, persistent_id: row.persistent_id, creation_time: row.creation_time, abbreviation: row.abbreviation, name: row.name, description: row.description, has_time_series_data: row.has_time_series_data, _uuid: randomUUID()})
} IN TRANSACTIONS OF 10000 ROWS
