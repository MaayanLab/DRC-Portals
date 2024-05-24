LOAD CSV WITH HEADERS FROM 'file:///data/subject_ethnicity.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (:SubjectEthnicity {id: row.id, name: row.name, description: row.description})
} IN TRANSACTIONS OF 10000 ROWS
