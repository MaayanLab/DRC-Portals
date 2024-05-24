LOAD CSV WITH HEADERS FROM 'file:///data/gene.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (gene:Gene {id: row.id, name: row.name, description: row.description, synonyms: apoc.convert.fromJsonList(row.synonyms), organism: row.organism})
	WITH gene, row
	MATCH (ncbi_taxonomy:NCBITaxonomy {id: row.organism})
	MERGE (gene)-[:HAS_SOURCE]->(ncbi_taxonomy)
} IN TRANSACTIONS OF 10000 ROWS
