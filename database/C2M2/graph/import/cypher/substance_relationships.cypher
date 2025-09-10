LOAD CSV WITH HEADERS FROM 'file:///data/substance.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (substance:Substance {id: row.id})MATCH (compound:Compound {id: row.compound})
	MERGE (substance)-[:ASSOCIATED_WITH {_uuid: randomUUID()}]-(compound)
} IN TRANSACTIONS OF 10000 ROWS
