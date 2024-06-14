/* =============== DCC short label: HuBMAP =============== */
select count(*) from hubmap.collection where id_namespace IN ('tag:hubmapconsortium.org,2023:');
WITH counts AS (SELECT 
(select count(*) from c2m2.collection where id_namespace IN ('tag:hubmapconsortium.org,2023:')) AS count1, 
(select count(*) from hubmap.collection) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'hubmap.collection: Number of records do not match' 
ELSE 'hubmap.collection: Number of records match' 
END AS count_match FROM counts;

select count(*) from hubmap.subject where id_namespace IN ('tag:hubmapconsortium.org,2023:');
WITH counts AS (SELECT 
(select count(*) from c2m2.subject where id_namespace IN ('tag:hubmapconsortium.org,2023:')) AS count1, 
(select count(*) from hubmap.subject) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'hubmap.subject: Number of records do not match' 
ELSE 'hubmap.subject: Number of records match' 
END AS count_match FROM counts;

select count(*) from hubmap.biosample_in_collection where biosample_id_namespace IN ('tag:hubmapconsortium.org,2023:');
WITH counts AS (SELECT 
(select count(*) from c2m2.biosample_in_collection where biosample_id_namespace IN ('tag:hubmapconsortium.org,2023:')) AS count1, 
(select count(*) from hubmap.biosample_in_collection) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'hubmap.biosample_in_collection: Number of records do not match' 
ELSE 'hubmap.biosample_in_collection: Number of records match' 
END AS count_match FROM counts;

select count(*) from hubmap.file_describes_collection where file_id_namespace IN ('tag:hubmapconsortium.org,2023:');
WITH counts AS (SELECT 
(select count(*) from c2m2.file_describes_collection where file_id_namespace IN ('tag:hubmapconsortium.org,2023:')) AS count1, 
(select count(*) from hubmap.file_describes_collection) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'hubmap.file_describes_collection: Number of records do not match' 
ELSE 'hubmap.file_describes_collection: Number of records match' 
END AS count_match FROM counts;

select count(*) from hubmap.subject_in_collection where subject_id_namespace IN ('tag:hubmapconsortium.org,2023:');
WITH counts AS (SELECT 
(select count(*) from c2m2.subject_in_collection where subject_id_namespace IN ('tag:hubmapconsortium.org,2023:')) AS count1, 
(select count(*) from hubmap.subject_in_collection) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'hubmap.subject_in_collection: Number of records do not match' 
ELSE 'hubmap.subject_in_collection: Number of records match' 
END AS count_match FROM counts;

select count(*) from hubmap.biosample_from_subject where biosample_id_namespace IN ('tag:hubmapconsortium.org,2023:');
WITH counts AS (SELECT 
(select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('tag:hubmapconsortium.org,2023:')) AS count1, 
(select count(*) from hubmap.biosample_from_subject) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'hubmap.biosample_from_subject: Number of records do not match' 
ELSE 'hubmap.biosample_from_subject: Number of records match' 
END AS count_match FROM counts;

select count(*) from hubmap.project where id_namespace IN ('tag:hubmapconsortium.org,2023:');
WITH counts AS (SELECT 
(select count(*) from c2m2.project where id_namespace IN ('tag:hubmapconsortium.org,2023:')) AS count1, 
(select count(*) from hubmap.project) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'hubmap.project: Number of records do not match' 
ELSE 'hubmap.project: Number of records match' 
END AS count_match FROM counts;

select count(*) from hubmap.file_in_collection where file_id_namespace IN ('tag:hubmapconsortium.org,2023:');
WITH counts AS (SELECT 
(select count(*) from c2m2.file_in_collection where file_id_namespace IN ('tag:hubmapconsortium.org,2023:')) AS count1, 
(select count(*) from hubmap.file_in_collection) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'hubmap.file_in_collection: Number of records do not match' 
ELSE 'hubmap.file_in_collection: Number of records match' 
END AS count_match FROM counts;

select count(*) from hubmap.file where id_namespace IN ('tag:hubmapconsortium.org,2023:');
WITH counts AS (SELECT 
(select count(*) from c2m2.file where id_namespace IN ('tag:hubmapconsortium.org,2023:')) AS count1, 
(select count(*) from hubmap.file) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'hubmap.file: Number of records do not match' 
ELSE 'hubmap.file: Number of records match' 
END AS count_match FROM counts;

select count(*) from hubmap.biosample where id_namespace IN ('tag:hubmapconsortium.org,2023:');
WITH counts AS (SELECT 
(select count(*) from c2m2.biosample where id_namespace IN ('tag:hubmapconsortium.org,2023:')) AS count1, 
(select count(*) from hubmap.biosample) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'hubmap.biosample: Number of records do not match' 
ELSE 'hubmap.biosample: Number of records match' 
END AS count_match FROM counts;

select count(*) from hubmap.project_in_project where parent_project_id_namespace IN ('tag:hubmapconsortium.org,2023:');
WITH counts AS (SELECT 
(select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('tag:hubmapconsortium.org,2023:')) AS count1, 
(select count(*) from hubmap.project_in_project) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'hubmap.project_in_project: Number of records do not match' 
ELSE 'hubmap.project_in_project: Number of records match' 
END AS count_match FROM counts;

select count(*) from hubmap.collection_defined_by_project where collection_id_namespace IN ('tag:hubmapconsortium.org,2023:');
WITH counts AS (SELECT 
(select count(*) from c2m2.collection_defined_by_project where collection_id_namespace IN ('tag:hubmapconsortium.org,2023:')) AS count1, 
(select count(*) from hubmap.collection_defined_by_project) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'hubmap.collection_defined_by_project: Number of records do not match' 
ELSE 'hubmap.collection_defined_by_project: Number of records match' 
END AS count_match FROM counts;


