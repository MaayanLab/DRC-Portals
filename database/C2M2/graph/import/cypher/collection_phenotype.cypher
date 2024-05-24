LOAD CSV WITH HEADERS FROM 'file:///data/collection_phenotype.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (phenotype:Phenotype {id: row.phenotype})
	MATCH (collection:Collection {local_id: row.collection_local_id})<-[:CONTAINS]-(collection_id_namespace:IDNamespace {id: row.collection_id_namespace})
	MERGE (collection)-[:CONTAINS]->(phenotype)
} IN TRANSACTIONS OF 10000 ROWS
