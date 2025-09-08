LOAD CSV WITH HEADERS FROM 'file:///data/biosample_substance.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (biosample:Biosample {local_id: row.biosample_local_id})<-[:CONTAINS]-(biosample_id_namespace:IDNamespace {id: row.biosample_id_namespace})
	MATCH (substance:Substance {id: row.substance})
	MERGE (biosample)-[:ASSOCIATED_WITH {_uuid: randomUUID()}]->(substance)
} IN TRANSACTIONS OF 10000 ROWS
