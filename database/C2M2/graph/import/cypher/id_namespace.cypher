LOAD CSV WITH HEADERS FROM 'file:///data/id_namespace.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (:IDNamespace {id: row.id, abbreviation: row.abbreviation, name: row.name, description: row.description, _uuid: randomUUID()})
} IN TRANSACTIONS OF 10000 ROWS
