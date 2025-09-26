LOAD CSV WITH HEADERS FROM 'file:///data/gene.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (gene:Gene {id: row.id, name: row.name, description: row.description, synonyms: apoc.convert.fromJsonList(row.synonyms), organism: row.organism, _uuid: randomUUID()})
} IN TRANSACTIONS OF 10000 ROWS
