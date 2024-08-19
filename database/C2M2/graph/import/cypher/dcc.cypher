LOAD CSV WITH HEADERS FROM 'file:///data/dcc.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (dcc:DCC {id: row.id, name: row.dcc_name, abbreviation: row.dcc_abbreviation, description: row.dcc_description, contact_email: row.contact_email, contact_name: row.contact_name, url: row.dcc_url})
} IN TRANSACTIONS OF 10000 ROWS
