LOAD CSV WITH HEADERS FROM 'file:///data/collection_in_collection.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (:IDNamespace {id: row.superset_collection_id_namespace})-[:CONTAINS]->(superset_collection:Collection {local_id: row.superset_collection_local_id})
	MATCH (:IDNamespace {id: row.subset_collection_id_namespace})-[:CONTAINS]->(subset_collection:Collection {local_id: row.subset_collection_local_id})
	MERGE (superset_collection)-[:IS_SUPERSET_OF]->(subset_collection)
} IN TRANSACTIONS OF 10000 ROWS
