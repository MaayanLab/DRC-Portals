MATCH (b:Biosample)
CALL {
	WITH b
	MATCH (b)<-[:COLLECTION_CONTAINS_BIOSAMPLE]-(c:Collection)
	WHERE c.persistent_id IS NOT NULL
	WITH b, collect(c.persistent_id) AS collection_pids
	SET b._collection_pids = collection_pids
} IN TRANSACTIONS OF 10000 ROWS
