LOAD CSV WITH HEADERS FROM 'file:///data/file_describes_subject.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (file:File {local_id: row.file_local_id})<-[:CONTAINS]-(file_id_namespace:IDNamespace {id: row.file_id_namespace})
	MATCH (subject:Subject {local_id: row.subject_local_id})<-[:CONTAINS]-(subject_id_namespace:IDNamespace {id: row.subject_id_namespace})
	MERGE (file)-[:DESCRIBES]->(subject)
} IN TRANSACTIONS OF 10000 ROWS
