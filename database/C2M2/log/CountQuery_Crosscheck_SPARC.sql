/* =============== DCC short label: SPARC =============== */
select count(*) from sparc.file_in_collection where file_id_namespace IN ('SPARC.file:');
WITH counts AS (SELECT 
(select count(*) from c2m2.file_in_collection where file_id_namespace IN ('SPARC.file:')) AS count1, 
(select count(*) from sparc.file_in_collection) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'sparc.file_in_collection: Number of records do not match' 
ELSE 'sparc.file_in_collection: Number of records match' 
END AS count_match FROM counts;

select count(*) from sparc.subject_role_taxonomy where subject_id_namespace IN ('SPARC.subject:');
WITH counts AS (SELECT 
(select count(*) from c2m2.subject_role_taxonomy where subject_id_namespace IN ('SPARC.subject:')) AS count1, 
(select count(*) from sparc.subject_role_taxonomy) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'sparc.subject_role_taxonomy: Number of records do not match' 
ELSE 'sparc.subject_role_taxonomy: Number of records match' 
END AS count_match FROM counts;

select count(*) from sparc.biosample_in_collection where biosample_id_namespace IN ('SPARC.sample:');
WITH counts AS (SELECT 
(select count(*) from c2m2.biosample_in_collection where biosample_id_namespace IN ('SPARC.sample:')) AS count1, 
(select count(*) from sparc.biosample_in_collection) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'sparc.biosample_in_collection: Number of records do not match' 
ELSE 'sparc.biosample_in_collection: Number of records match' 
END AS count_match FROM counts;

select count(*) from sparc.file_describes_biosample where file_id_namespace IN ('SPARC.file:');
WITH counts AS (SELECT 
(select count(*) from c2m2.file_describes_biosample where file_id_namespace IN ('SPARC.file:')) AS count1, 
(select count(*) from sparc.file_describes_biosample) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'sparc.file_describes_biosample: Number of records do not match' 
ELSE 'sparc.file_describes_biosample: Number of records match' 
END AS count_match FROM counts;

select count(*) from sparc.file where id_namespace IN ('SPARC.file:');
WITH counts AS (SELECT 
(select count(*) from c2m2.file where id_namespace IN ('SPARC.file:')) AS count1, 
(select count(*) from sparc.file) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'sparc.file: Number of records do not match' 
ELSE 'sparc.file: Number of records match' 
END AS count_match FROM counts;

select count(*) from sparc.biosample_from_subject where biosample_id_namespace IN ('SPARC.sample:');
WITH counts AS (SELECT 
(select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('SPARC.sample:')) AS count1, 
(select count(*) from sparc.biosample_from_subject) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'sparc.biosample_from_subject: Number of records do not match' 
ELSE 'sparc.biosample_from_subject: Number of records match' 
END AS count_match FROM counts;

select count(*) from sparc.collection_defined_by_project where collection_id_namespace IN ('SPARC.collection:');
WITH counts AS (SELECT 
(select count(*) from c2m2.collection_defined_by_project where collection_id_namespace IN ('SPARC.collection:')) AS count1, 
(select count(*) from sparc.collection_defined_by_project) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'sparc.collection_defined_by_project: Number of records do not match' 
ELSE 'sparc.collection_defined_by_project: Number of records match' 
END AS count_match FROM counts;

select count(*) from sparc.project where id_namespace IN ('SPARC:', 'SPARC.project:');
WITH counts AS (SELECT 
(select count(*) from c2m2.project where id_namespace IN ('SPARC:', 'SPARC.project:')) AS count1, 
(select count(*) from sparc.project) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'sparc.project: Number of records do not match' 
ELSE 'sparc.project: Number of records match' 
END AS count_match FROM counts;

select count(*) from sparc.biosample where id_namespace IN ('SPARC.sample:');
WITH counts AS (SELECT 
(select count(*) from c2m2.biosample where id_namespace IN ('SPARC.sample:')) AS count1, 
(select count(*) from sparc.biosample) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'sparc.biosample: Number of records do not match' 
ELSE 'sparc.biosample: Number of records match' 
END AS count_match FROM counts;

select count(*) from sparc.file_describes_subject where file_id_namespace IN ('SPARC.file:');
WITH counts AS (SELECT 
(select count(*) from c2m2.file_describes_subject where file_id_namespace IN ('SPARC.file:')) AS count1, 
(select count(*) from sparc.file_describes_subject) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'sparc.file_describes_subject: Number of records do not match' 
ELSE 'sparc.file_describes_subject: Number of records match' 
END AS count_match FROM counts;

select count(*) from sparc.subject where id_namespace IN ('SPARC.subject:');
WITH counts AS (SELECT 
(select count(*) from c2m2.subject where id_namespace IN ('SPARC.subject:')) AS count1, 
(select count(*) from sparc.subject) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'sparc.subject: Number of records do not match' 
ELSE 'sparc.subject: Number of records match' 
END AS count_match FROM counts;

select count(*) from sparc.collection where id_namespace IN ('SPARC.collection:');
WITH counts AS (SELECT 
(select count(*) from c2m2.collection where id_namespace IN ('SPARC.collection:')) AS count1, 
(select count(*) from sparc.collection) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'sparc.collection: Number of records do not match' 
ELSE 'sparc.collection: Number of records match' 
END AS count_match FROM counts;

select count(*) from sparc.subject_in_collection where subject_id_namespace IN ('SPARC.subject:');
WITH counts AS (SELECT 
(select count(*) from c2m2.subject_in_collection where subject_id_namespace IN ('SPARC.subject:')) AS count1, 
(select count(*) from sparc.subject_in_collection) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'sparc.subject_in_collection: Number of records do not match' 
ELSE 'sparc.subject_in_collection: Number of records match' 
END AS count_match FROM counts;

select count(*) from sparc.project_in_project where parent_project_id_namespace IN ('SPARC:');
WITH counts AS (SELECT 
(select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('SPARC:')) AS count1, 
(select count(*) from sparc.project_in_project) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'sparc.project_in_project: Number of records do not match' 
ELSE 'sparc.project_in_project: Number of records match' 
END AS count_match FROM counts;


