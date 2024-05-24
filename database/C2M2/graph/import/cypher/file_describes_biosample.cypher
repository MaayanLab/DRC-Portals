LOAD CSV WITH HEADERS FROM 'file:///data/file_describes_biosample.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (file:File {local_id: row.file_local_id})<-[:CONTAINS]-(file_id_namespace:IDNamespace {id: row.file_id_namespace})
	MATCH (biosample:Biosample {local_id: row.biosample_local_id})<-[:CONTAINS]-(biosample_id_namespace:IDNamespace {id: row.biosample_id_namespace})
	MERGE (file)-[:DESCRIBES]->(biosample)
} IN TRANSACTIONS OF 10000 ROWS
