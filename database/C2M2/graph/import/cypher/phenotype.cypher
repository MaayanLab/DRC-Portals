LOAD CSV WITH HEADERS FROM 'file:///data/phenotype.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (:Phenotype {id: row.id, name: row.name, description: row.description, synonyms: apoc.convert.fromJsonList(row.synonyms)})
} IN TRANSACTIONS OF 10000 ROWS
