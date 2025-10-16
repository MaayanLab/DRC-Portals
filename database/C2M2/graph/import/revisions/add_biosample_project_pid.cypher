MATCH (b:Biosample)
CALL {
	WITH b
	MATCH (b)<-[:PROJECT_CONTAINS_BIOSAMPLE]-(p:Project)
	WHERE p.persistent_id IS NOT NULL
    WITH b, p
    LIMIT 1
	SET b._project_pid = p.persistent_id
} IN TRANSACTIONS OF 10000 ROWS
