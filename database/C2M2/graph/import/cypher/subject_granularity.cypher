LOAD CSV WITH HEADERS FROM 'file:///data/subject_granularity.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (:SubjectGranularity {id: row.id, name: row.name, description: row.description, _uuid: randomUUID()})
} IN TRANSACTIONS OF 10000 ROWS
