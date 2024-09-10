LOAD CSV WITH HEADERS FROM 'file:///data/subject_race_cv.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (:SubjectRace {id: row.id, name: row.name, description: row.description, _uuid: randomUUID()})
} IN TRANSACTIONS OF 10000 ROWS
