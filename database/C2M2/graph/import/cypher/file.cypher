LOAD CSV WITH HEADERS FROM 'file:///data/file.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (file:File {local_id: row.local_id, id_namespace: row.id_namespace, project_local_id: row.project_local_id, persistent_id: row.persistent_id, creation_time: row.creation_time, size_in_bytes: row.size_in_bytes, uncompressed_size_in_bytes: row.uncompressed_size_in_bytes, sha256: row.sha256, md5: row.md5, filename: row.filename, mime_type: row.mime_type, dbgap_study_id: row.dbgap_study_id, _uuid: randomUUID()})
} IN TRANSACTIONS OF 10000 ROWS
