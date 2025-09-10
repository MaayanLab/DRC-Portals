MATCH (f:File)
CALL {
	WITH f
	MATCH (f)<-[:PROJECT_CONTAINS_FILE]-(p:Project)
	WHERE p.persistent_id IS NOT NULL
    WITH f, p
    LIMIT 1
	SET f._project_pid = p.persistent_id
} IN TRANSACTIONS OF 10000 ROWS
