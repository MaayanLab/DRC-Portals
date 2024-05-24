LOAD CSV WITH HEADERS FROM 'file:///data/phenotype_disease.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (phenotype:Phenotype {id: row.phenotype})
	MATCH (disease:Disease {id: row.disease})
	MERGE (phenotype)-[:ASSOCIATED_WITH]-(disease)
} IN TRANSACTIONS OF 10000 ROWS
