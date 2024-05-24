LOAD CSV WITH HEADERS FROM 'file:///data/subject_substance.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (subject:Subject {local_id: row.subject_local_id})<-[:CONTAINS]-(subject_id_namespace:IDNamespace {id: row.subject_id_namespace})
	MATCH (substance:Substance {id: row.substance})
	MERGE (subject)-[:ASSOCIATED_WITH]-(substance)
} IN TRANSACTIONS OF 10000 ROWS
