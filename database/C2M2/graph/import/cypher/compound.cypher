LOAD CSV WITH HEADERS FROM 'file:///data/compound.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (:Compound {id: row.id, name: row.name, description: row.description, synonyms: apoc.convert.fromJsonList(row.synonyms), _uuid: randomUUID()})
} IN TRANSACTIONS OF 10000 ROWS
