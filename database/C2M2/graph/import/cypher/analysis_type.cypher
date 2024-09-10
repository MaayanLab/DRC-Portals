LOAD CSV WITH HEADERS FROM 'file:///data/analysis_type.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (:AnalysisType {id: row.id, name: row.name, description: row.description, synonyms: apoc.convert.fromJsonList(row.synonyms), _uuid: randomUUID()})
} IN TRANSACTIONS OF 10000 ROWS
