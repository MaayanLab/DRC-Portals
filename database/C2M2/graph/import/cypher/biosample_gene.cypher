LOAD CSV WITH HEADERS FROM 'file:///data/biosample_gene.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (gene:Gene {id: row.gene})
	MATCH (biosample:Biosample {local_id: row.biosample_local_id})<-[:CONTAINS]-(biosample_id_namespace:IDNamespace {id: row.biosample_id_namespace})
	MERGE (biosample)-[:ASSOCIATED_WITH {_uuid: randomUUID()}]->(gene)
} IN TRANSACTIONS OF 10000 ROWS
