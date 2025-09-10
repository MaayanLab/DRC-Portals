LOAD CSV WITH HEADERS FROM 'file:///data/protein.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (protein:Protein {id: row.id})
	OPTIONAL MATCH (ncbi_taxonomy:NCBITaxonomy {id: row.organism})
	MERGE (protein)-[:HAS_SOURCE {_uuid: randomUUID()}]->(ncbi_taxonomy)
} IN TRANSACTIONS OF 10000 ROWS
