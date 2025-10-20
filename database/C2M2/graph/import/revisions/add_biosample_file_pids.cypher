MATCH (b:Biosample)
CALL {
	WITH b
	MATCH (b)<-[:FILE_DESCRIBES_BIOSAMPLE]-(f:File)
	WHERE f.persistent_id IS NOT NULL
	WITH b, collect(f.persistent_id) AS file_pids
	SET b._file_pids = file_pids
} IN TRANSACTIONS OF 10000 ROWS
