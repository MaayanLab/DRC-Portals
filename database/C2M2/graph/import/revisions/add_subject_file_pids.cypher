MATCH (s:Subject)
CALL {
	WITH s
	MATCH (s)<-[:FILE_DESCRIBES_SUBJECT]-(f:File)
	WHERE f.persistent_id IS NOT NULL
	WITH s, collect(f.persistent_id) AS file_pids
	SET s._collection_pids = file_pids
} IN TRANSACTIONS OF 10000 ROWS
