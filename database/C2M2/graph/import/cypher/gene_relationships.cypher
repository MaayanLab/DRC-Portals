LOAD CSV WITH HEADERS FROM 'file:///data/gene.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (gene:Gene {id: row.id})
	MATCH (ncbi_taxonomy:NCBITaxonomy {id: row.organism})
	MERGE (gene)-[:HAS_SOURCE {_uuid: randomUUID()}]->(ncbi_taxonomy)
} IN TRANSACTIONS OF 10000 ROWS
