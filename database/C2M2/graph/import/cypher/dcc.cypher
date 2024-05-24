LOAD CSV WITH HEADERS FROM 'file:///data/dcc.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (dcc:DCC {id: row.id, name: row.dcc_name, abbreviation: row.dcc_abbreviation, description: row.dcc_description, contact_email: row.contact_email, contact_name: row.contact_name, url: row.dcc_url})
	WITH dcc, row
	MATCH (project:Project {local_id: row.project_local_id})<-[:CONTAINS]-(project_id_namespace:IDNamespace {id: row.project_id_namespace})
	MERGE (dcc)-[:PRODUCED]->(project)
} IN TRANSACTIONS OF 10000 ROWS
