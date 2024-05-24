LOAD CSV WITH HEADERS FROM 'file:///data/phenotype_gene.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (phenotype:Phenotype {id: row.phenotype})
	MATCH (gene:Gene {id: row.gene})
	MERGE (phenotype)-[:ASSOCIATED_WITH]-(gene)
} IN TRANSACTIONS OF 10000 ROWS
