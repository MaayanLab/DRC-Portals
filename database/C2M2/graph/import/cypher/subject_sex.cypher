LOAD CSV WITH HEADERS FROM 'file:///data/subject_sex.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (:SubjectSex {id: row.id, name: row.name, description: row.description})
} IN TRANSACTIONS OF 10000 ROWS
