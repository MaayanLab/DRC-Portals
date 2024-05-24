LOAD CSV WITH HEADERS FROM 'file:///data/file.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	CREATE (file:File {local_id: row.local_id, persistent_id: row.persistent_id, creation_time: row.creation_time, size_in_bytes: row.size_in_bytes, uncompressed_size_in_bytes: row.uncompressed_size_in_bytes, sha256: row.sha256, md5: row.md5, filename: row.filename, mime_type: row.mime_type, dbgap_study_id: row.dbgap_study_id})
	WITH file, row
	MATCH (id_namespace:IDNamespace {id: row.id_namespace})
	MATCH (project:Project {local_id: row.project_local_id})<-[:CONTAINS]-(project_id_namespace:IDNamespace {id: row.project_id_namespace})
	OPTIONAL MATCH (file_format:FileFormat {id: row.file_format})
	OPTIONAL MATCH (compression_format:FileFormat {id: row.compression_format})
	OPTIONAL MATCH (analysis_type:AnalysisType {id: row.analysis_type})
	OPTIONAL MATCH (data_type:DataType {id: row.data_type})
	OPTIONAL MATCH (assay_type:AssayType {id: row.assay_type})
	MERGE (file)-[:IS_FILE_FORMAT]->(file_format)
	MERGE (file)-[:IS_FILE_FORMAT]->(compression_format)
	MERGE (file)-[:GENERATED_BY_ANALYSIS_TYPE]->(analysis_type)
	MERGE (file)-[:IS_DATA_TYPE]->(data_type)
	MERGE (file)-[:GENERATED_BY_ASSAY_TYPE]->(assay_type)
	MERGE (id_namespace)-[:CONTAINS]->(file)<-[:CONTAINS]-(project)
} IN TRANSACTIONS OF 10000 ROWS
