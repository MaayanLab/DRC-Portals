LOAD CSV WITH HEADERS FROM 'file:///data/collection_taxonomy.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (ncbi_taxonomy:NCBITaxonomy {id: row.taxon})
	MATCH (collection:Collection {local_id: row.collection_local_id})<-[:CONTAINS]-(collection_id_namespace:IDNamespace {id: row.collection_id_namespace})
	MERGE (collection)-[:CONTAINS {_uuid: randomUUID()}]->(ncbi_taxonomy)
} IN TRANSACTIONS OF 10000 ROWS
