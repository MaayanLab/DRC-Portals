LOAD CSV WITH HEADERS FROM 'file:///data/data_type.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (:DataType {id: row.id, name: row.name, description: row.description, synonyms: apoc.convert.fromJsonList(row.synonyms)})
} IN TRANSACTIONS OF 10000 ROWS
