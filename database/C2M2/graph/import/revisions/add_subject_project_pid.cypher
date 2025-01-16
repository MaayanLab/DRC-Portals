MATCH (s:Subject)
CALL {
	WITH s
	MATCH (s)<-[:PROJECT_CONTAINS_SUBJECT]-(p:Project)
	WHERE p.persistent_id IS NOT NULL
    WITH s, p
    LIMIT 1
	SET s._project_pid = p.persistent_id
} IN TRANSACTIONS OF 10000 ROWS
