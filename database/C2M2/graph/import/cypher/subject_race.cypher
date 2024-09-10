LOAD CSV WITH HEADERS FROM 'file:///data/subject_race.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (subject_race:SubjectRace {id: row.race})
	MATCH (subject:Subject {local_id: row.subject_local_id})<-[:CONTAINS]-(subject_id_namespace:IDNamespace {id: row.subject_id_namespace})
	MERGE (subject)-[:IS_RACE {_uuid: randomUUID()}]->(subject_race)
} IN TRANSACTIONS OF 10000 ROWS
