LOAD CSV WITH HEADERS FROM 'file:///data/protein_gene.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (protein:Protein {id: row.protein})
	MATCH (gene:Gene {id: row.gene})
	MERGE (protein)-[:ASSOCIATED_WITH {_uuid: randomUUID()}]-(gene)
} IN TRANSACTIONS OF 10000 ROWS
