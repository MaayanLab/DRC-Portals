LOAD CSV WITH HEADERS FROM 'file:///data/subject_role.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (:SubjectRole {id: row.id, name: row.name, description: row.description})
} IN TRANSACTIONS OF 10000 ROWS
