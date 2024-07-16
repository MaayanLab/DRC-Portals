LOAD CSV WITH HEADERS FROM 'file:///data/id_namespace_dcc_id.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (id_namespace:IDNamespace {id: row.id_namespace_id})
	WITH id_namespace, row
	MATCH (dcc:DCC {id: row.dcc_id})
	MERGE (id_namespace)<-[:REGISTERED]-(dcc)
} IN TRANSACTIONS OF 10000 ROWS
