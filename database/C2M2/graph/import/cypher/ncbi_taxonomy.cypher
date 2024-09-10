LOAD CSV WITH HEADERS FROM 'file:///data/ncbi_taxonomy.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (:NCBITaxonomy {id: row.id, clade: row.clade, name: row.name, description: row.description, synonyms: apoc.convert.fromJsonList(row.synonyms), _uuid: randomUUID()})
} IN TRANSACTIONS OF 10000 ROWS
