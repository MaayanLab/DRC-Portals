LOAD CSV WITH HEADERS FROM 'file:///data/disease_association_type.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (:DiseaseAssociationType {id: row.id, name: row.name, description: row.description})
} IN TRANSACTIONS OF 10000 ROWS
