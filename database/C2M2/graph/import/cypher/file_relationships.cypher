LOAD CSV WITH HEADERS FROM 'file:///data/file.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (file:File {local_id: row.local_id, id_namespace: row.id_namespace, project_local_id: row.project_local_id})
	REMOVE file.id_namespace
	REMOVE file.project_local_id
	WITH file, row
	OPTIONAL MATCH (file_format:FileFormat {id: row.file_format})
	MERGE (file)-[:IS_FILE_FORMAT {_uuid: randomUUID()}]->(file_format)
	WITH file, row
	OPTIONAL MATCH (compression_format:FileFormat {id: row.compression_format})
	MERGE (file)-[:IS_FILE_FORMAT {_uuid: randomUUID()}]->(compression_format)
	WITH file, row
	OPTIONAL MATCH (analysis_type:AnalysisType {id: row.analysis_type})
	MERGE (file)-[:GENERATED_BY_ANALYSIS_TYPE {_uuid: randomUUID()}]->(analysis_type)
	WITH file, row
	OPTIONAL MATCH (data_type:DataType {id: row.data_type})
	MERGE (file)-[:IS_DATA_TYPE {_uuid: randomUUID()}]->(data_type)
	WITH file, row
	OPTIONAL MATCH (assay_type:AssayType {id: row.assay_type})
	MERGE (file)-[:GENERATED_BY_ASSAY_TYPE {_uuid: randomUUID()}]->(assay_type)
	WITH file, row
	MATCH (id_namespace:IDNamespace {id: row.id_namespace})
	MATCH (project:Project {local_id: row.project_local_id})<-[:CONTAINS]-(project_id_namespace:IDNamespace {id: row.project_id_namespace})
	MERGE (id_namespace)-[:CONTAINS {_uuid: randomUUID()}]->(file)<-[:CONTAINS {_uuid: randomUUID()}]-(project)
} IN TRANSACTIONS OF 10000 ROWS
