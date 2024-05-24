LOAD CSV WITH HEADERS FROM 'file:///data/biosample_from_subject.tsv' AS row FIELDTERMINATOR '\t'
CALL {
	WITH row
	MATCH (subject_id_namespace:IDNamespace {id: row.subject_id_namespace})-[:CONTAINS]->(subject:Subject {local_id: row.subject_local_id})
	MATCH (biosample_id_namespace:IDNamespace {id: row.biosample_id_namespace})-[:CONTAINS]->(biosample:Biosample {local_id: row.biosample_local_id})
	MERGE (subject)<-[sampled_from_rel:SAMPLED_FROM {age_at_sampling: COALESCE(row.age_at_sampling, -1)}]-(biosample)
	SET sampled_from_rel.age_at_sampling = row.age_at_sampling
} IN TRANSACTIONS OF 10000 ROWS
