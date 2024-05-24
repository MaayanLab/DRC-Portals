LOAD CSV WITH HEADERS FROM 'file:///data/collection.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (collection:Collection {local_id: row.local_id, persistent_id: row.persistent_id, creation_time: row.creation_time, abbreviation: row.abbreviation, name: row.name, description: row.description, has_time_series_data: row.has_time_series_data})
	WITH collection, row
	MATCH (id_namespace:IDNamespace {id: row.id_namespace})
	MERGE (id_namespace)-[:CONTAINS]->(collection)
} IN TRANSACTIONS OF 10000 ROWS
