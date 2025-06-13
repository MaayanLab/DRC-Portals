LOAD CSV WITH HEADERS FROM 'file:///data/subject.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (subject:Subject {local_id: row.local_id, id_namespace: row.id_namespace, project_local_id: row.project_local_id})
	REMOVE subject.id_namespace
	REMOVE subject.project_local_id
	WITH subject, row
	OPTIONAL MATCH (subject_ethnicity:SubjectEthnicity {id: row.ethnicity})
	MERGE (subject)-[:IS_ETHNICITY {_uuid: randomUUID()}]->(subject_ethnicity)
	WITH subject, row
	OPTIONAL MATCH (subject_granularity:SubjectGranularity {id: row.granularity})
	MERGE (subject)-[:IS_GRANULARITY {_uuid: randomUUID()}]->(subject_granularity)
	WITH subject, row
	OPTIONAL MATCH (subject_sex:SubjectSex {id: row.sex})
	MERGE (subject)-[:IS_SEX {_uuid: randomUUID()}]->(subject_sex)
	WITH subject, row
	MATCH (id_namespace:IDNamespace {id: row.id_namespace})
	MATCH (project:Project {local_id: row.project_local_id})<-[:CONTAINS]-(project_id_namespace:IDNamespace {id: row.project_id_namespace})
	MERGE (id_namespace)-[:CONTAINS {_uuid: randomUUID()}]->(subject)<-[:CONTAINS {_uuid: randomUUID()}]-(project)
} IN TRANSACTIONS OF 10000 ROWS
