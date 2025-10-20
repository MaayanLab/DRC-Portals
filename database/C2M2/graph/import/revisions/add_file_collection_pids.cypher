MATCH (f:File)
CALL {
	WITH f
	MATCH (f)<-[:COLLECTION_CONTAINS_FILE]-(c:Collection)
	WHERE c.persistent_id IS NOT NULL
	WITH f, collect(c.persistent_id) AS collection_pids
	SET f._collection_pids = collection_pids
} IN TRANSACTIONS OF 10000 ROWS
