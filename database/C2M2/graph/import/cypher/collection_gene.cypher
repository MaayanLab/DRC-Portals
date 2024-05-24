LOAD CSV WITH HEADERS FROM 'file:///data/collection_gene.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (gene:Gene {id: row.gene})
	MATCH (collection:Collection {local_id: row.collection_local_id})<-[:CONTAINS]-(collection_id_namespace:IDNamespace {id: row.collection_id_namespace})
	MERGE (collection)-[:CONTAINS]->(gene)
} IN TRANSACTIONS OF 10000 ROWS
