/* =============== DCC short label: 4DN =============== */
select count(*) from _4dn.file_in_collection where file_id_namespace IN ('https://data.4dnucleome.org');
WITH counts AS (SELECT 
(select count(*) from c2m2.file_in_collection where file_id_namespace IN ('https://data.4dnucleome.org')) AS count1, 
(select count(*) from _4dn.file_in_collection) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN '_4dn.file_in_collection: Number of records do not match' 
ELSE '_4dn.file_in_collection: Number of records match' 
END AS count_match FROM counts;

select count(*) from _4dn.subject_role_taxonomy where subject_id_namespace IN ('https://data.4dnucleome.org');
WITH counts AS (SELECT 
(select count(*) from c2m2.subject_role_taxonomy where subject_id_namespace IN ('https://data.4dnucleome.org')) AS count1, 
(select count(*) from _4dn.subject_role_taxonomy) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN '_4dn.subject_role_taxonomy: Number of records do not match' 
ELSE '_4dn.subject_role_taxonomy: Number of records match' 
END AS count_match FROM counts;

select count(*) from _4dn.biosample_in_collection where biosample_id_namespace IN ('https://data.4dnucleome.org');
WITH counts AS (SELECT 
(select count(*) from c2m2.biosample_in_collection where biosample_id_namespace IN ('https://data.4dnucleome.org')) AS count1, 
(select count(*) from _4dn.biosample_in_collection) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN '_4dn.biosample_in_collection: Number of records do not match' 
ELSE '_4dn.biosample_in_collection: Number of records match' 
END AS count_match FROM counts;

select count(*) from _4dn.file where id_namespace IN ('https://data.4dnucleome.org');
WITH counts AS (SELECT 
(select count(*) from c2m2.file where id_namespace IN ('https://data.4dnucleome.org')) AS count1, 
(select count(*) from _4dn.file) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN '_4dn.file: Number of records do not match' 
ELSE '_4dn.file: Number of records match' 
END AS count_match FROM counts;

select count(*) from _4dn.biosample_from_subject where biosample_id_namespace IN ('https://data.4dnucleome.org');
WITH counts AS (SELECT 
(select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('https://data.4dnucleome.org')) AS count1, 
(select count(*) from _4dn.biosample_from_subject) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN '_4dn.biosample_from_subject: Number of records do not match' 
ELSE '_4dn.biosample_from_subject: Number of records match' 
END AS count_match FROM counts;

select count(*) from _4dn.collection_in_collection where superset_collection_id_namespace IN ('https://data.4dnucleome.org');
WITH counts AS (SELECT 
(select count(*) from c2m2.collection_in_collection where superset_collection_id_namespace IN ('https://data.4dnucleome.org')) AS count1, 
(select count(*) from _4dn.collection_in_collection) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN '_4dn.collection_in_collection: Number of records do not match' 
ELSE '_4dn.collection_in_collection: Number of records match' 
END AS count_match FROM counts;

select count(*) from _4dn.collection_defined_by_project where collection_id_namespace IN ('https://data.4dnucleome.org');
WITH counts AS (SELECT 
(select count(*) from c2m2.collection_defined_by_project where collection_id_namespace IN ('https://data.4dnucleome.org')) AS count1, 
(select count(*) from _4dn.collection_defined_by_project) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN '_4dn.collection_defined_by_project: Number of records do not match' 
ELSE '_4dn.collection_defined_by_project: Number of records match' 
END AS count_match FROM counts;

select count(*) from _4dn.project where id_namespace IN ('https://data.4dnucleome.org');
WITH counts AS (SELECT 
(select count(*) from c2m2.project where id_namespace IN ('https://data.4dnucleome.org')) AS count1, 
(select count(*) from _4dn.project) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN '_4dn.project: Number of records do not match' 
ELSE '_4dn.project: Number of records match' 
END AS count_match FROM counts;

select count(*) from _4dn.biosample where id_namespace IN ('https://data.4dnucleome.org');
WITH counts AS (SELECT 
(select count(*) from c2m2.biosample where id_namespace IN ('https://data.4dnucleome.org')) AS count1, 
(select count(*) from _4dn.biosample) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN '_4dn.biosample: Number of records do not match' 
ELSE '_4dn.biosample: Number of records match' 
END AS count_match FROM counts;

select count(*) from _4dn.subject where id_namespace IN ('https://data.4dnucleome.org');
WITH counts AS (SELECT 
(select count(*) from c2m2.subject where id_namespace IN ('https://data.4dnucleome.org')) AS count1, 
(select count(*) from _4dn.subject) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN '_4dn.subject: Number of records do not match' 
ELSE '_4dn.subject: Number of records match' 
END AS count_match FROM counts;

select count(*) from _4dn.collection where id_namespace IN ('https://data.4dnucleome.org');
WITH counts AS (SELECT 
(select count(*) from c2m2.collection where id_namespace IN ('https://data.4dnucleome.org')) AS count1, 
(select count(*) from _4dn.collection) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN '_4dn.collection: Number of records do not match' 
ELSE '_4dn.collection: Number of records match' 
END AS count_match FROM counts;

select count(*) from _4dn.subject_in_collection where subject_id_namespace IN ('https://data.4dnucleome.org');
WITH counts AS (SELECT 
(select count(*) from c2m2.subject_in_collection where subject_id_namespace IN ('https://data.4dnucleome.org')) AS count1, 
(select count(*) from _4dn.subject_in_collection) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN '_4dn.subject_in_collection: Number of records do not match' 
ELSE '_4dn.subject_in_collection: Number of records match' 
END AS count_match FROM counts;

select count(*) from _4dn.project_in_project where parent_project_id_namespace IN ('https://data.4dnucleome.org');
WITH counts AS (SELECT 
(select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('https://data.4dnucleome.org')) AS count1, 
(select count(*) from _4dn.project_in_project) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN '_4dn.project_in_project: Number of records do not match' 
ELSE '_4dn.project_in_project: Number of records match' 
END AS count_match FROM counts;


