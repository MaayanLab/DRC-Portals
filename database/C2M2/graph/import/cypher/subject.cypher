LOAD CSV WITH HEADERS FROM 'file:///data/subject.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (subject:Subject {local_id: row.local_id, persistent_id: row.persistent_id, creation_time: row.creation_time, granularity: row.granularity, sex: row.sex, ethnicity: row.ethnicity, age_at_enrollment: row.age_at_enrollment})
	WITH subject, row
	MATCH (id_namespace:IDNamespace {id: row.id_namespace})
	MATCH (project:Project {local_id: row.project_local_id})<-[:CONTAINS]-(project_id_namespace:IDNamespace {id: row.project_id_namespace})
	OPTIONAL MATCH (subject_ethnicity:SubjectEthnicity {id: row.ethnicity})
	OPTIONAL MATCH (subject_granularity:SubjectGranularity {id: row.granularity})
	OPTIONAL MATCH (subject_sex:SubjectSex {id: row.sex})
	MERGE (subject)-[:IS_ETHNICITY]->(subject_ethnicity)
	MERGE (subject)-[:IS_GRANULARITY]->(subject_granularity)
	MERGE (subject)-[:IS_SEX]->(subject_sex)
	MERGE (id_namespace)-[:CONTAINS]->(subject)<-[:CONTAINS]-(project)
} IN TRANSACTIONS OF 10000 ROWS
