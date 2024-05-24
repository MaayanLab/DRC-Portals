LOAD CSV WITH HEADERS FROM 'file:///data/protein.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (protein:Protein {id: row.id, name: row.name, description: row.description, synonyms: apoc.convert.fromJsonList(row.synonyms)})
	WITH protein, row
	OPTIONAL MATCH (ncbi_taxonomy:NCBITaxonomy {id: row.organism})
	MERGE (protein)-[:HAS_SOURCE]->(ncbi_taxonomy)
} IN TRANSACTIONS OF 10000 ROWS
