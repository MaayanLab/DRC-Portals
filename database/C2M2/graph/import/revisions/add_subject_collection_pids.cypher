MATCH (s:Subject)
CALL {
	WITH s
	MATCH (s)<-[:COLLECTION_CONTAINS_SUBJECT]-(c:Collection)
	WHERE c.persistent_id IS NOT NULL
	WITH s, collect(c.persistent_id) AS collection_pids
	SET s._collection_pids = collection_pids
} IN TRANSACTIONS OF 10000 ROWS
