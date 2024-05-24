LOAD CSV WITH HEADERS FROM 'file:///data/biosample.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (biosample:Biosample {local_id: row.local_id, persistent_id: row.persistent_id, creation_time: row.creation_time})
	WITH biosample, row
	MATCH (id_namespace:IDNamespace {id: row.id_namespace})
	MATCH (project:Project {local_id: row.project_local_id})<-[:CONTAINS]-(project_id_namespace:IDNamespace {id: row.project_id_namespace})
	OPTIONAL MATCH (anatomy:Anatomy {id: row.anatomy})
	OPTIONAL MATCH (sample_prep_method:SamplePrepMethod {id: row.sample_prep_method})
	MERGE (biosample)-[:SAMPLED_FROM]->(anatomy)
	MERGE (biosample)-[:PREPPED_VIA]->(sample_prep_method)
	MERGE (id_namespace)-[:CONTAINS]->(biosample)<-[:CONTAINS]-(project)
} IN TRANSACTIONS OF 10000 ROWS
