LOAD CSV WITH HEADERS FROM 'file:///data/subject.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (subject:Subject {local_id: row.local_id, id_namespace: row.id_namespace, project_local_id: row.project_local_id, persistent_id: row.persistent_id, creation_time: row.creation_time, granularity: row.granularity, sex: row.sex, ethnicity: row.ethnicity, age_at_enrollment: row.age_at_enrollment, _uuid: randomUUID()})
} IN TRANSACTIONS OF 10000 ROWS
