LOAD CSV WITH HEADERS FROM 'file:///data/biosample.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (biosample:Biosample {local_id: row.local_id, id_namespace: row.id_namespace, project_local_id: row.project_local_id})
	REMOVE biosample.id_namespace
	REMOVE biosample.project_local_id
	WITH biosample, row
	OPTIONAL MATCH (anatomy:Anatomy {id: row.anatomy})
	MERGE (biosample)-[:SAMPLED_FROM {_uuid: randomUUID()}]->(anatomy)
	WITH biosample, row
	OPTIONAL MATCH (biofluid:Biofluid {id: row.biofluid})
	MERGE (biosample)-[:SAMPLED_FROM {_uuid: randomUUID()}]->(biofluid)
	WITH biosample, row
	OPTIONAL MATCH (sample_prep_method:SamplePrepMethod {id: row.sample_prep_method})
	MERGE (biosample)-[:PREPPED_VIA {_uuid: randomUUID()}]->(sample_prep_method)
	WITH biosample, row
	MATCH (id_namespace:IDNamespace {id: row.id_namespace})
	MATCH (project:Project {local_id: row.project_local_id})<-[:CONTAINS]-(project_id_namespace:IDNamespace {id: row.project_id_namespace})
	MERGE (id_namespace)-[:CONTAINS {_uuid: randomUUID()}]->(biosample)<-[:CONTAINS {_uuid: randomUUID()}]-(project)
} IN TRANSACTIONS OF 10000 ROWS
