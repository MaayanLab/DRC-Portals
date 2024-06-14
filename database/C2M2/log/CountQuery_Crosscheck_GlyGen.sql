/* =============== DCC short label: GlyGen =============== */
select count(*) from glygen.collection_compound where collection_id_namespace IN ('https://www.data.glygen.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.collection_compound where collection_id_namespace IN ('https://www.data.glygen.org/')) AS count1, 
(select count(*) from glygen.collection_compound) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'glygen.collection_compound: Number of records do not match' 
ELSE 'glygen.collection_compound: Number of records match' 
END AS count_match FROM counts;

select count(*) from glygen.file_describes_collection where file_id_namespace IN ('https://www.data.glygen.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.file_describes_collection where file_id_namespace IN ('https://www.data.glygen.org/')) AS count1, 
(select count(*) from glygen.file_describes_collection) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'glygen.file_describes_collection: Number of records do not match' 
ELSE 'glygen.file_describes_collection: Number of records match' 
END AS count_match FROM counts;

select count(*) from glygen.collection_defined_by_project where collection_id_namespace IN ('https://www.data.glygen.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.collection_defined_by_project where collection_id_namespace IN ('https://www.data.glygen.org/')) AS count1, 
(select count(*) from glygen.collection_defined_by_project) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'glygen.collection_defined_by_project: Number of records do not match' 
ELSE 'glygen.collection_defined_by_project: Number of records match' 
END AS count_match FROM counts;

select count(*) from glygen.file where id_namespace IN ('https://www.data.glygen.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.file where id_namespace IN ('https://www.data.glygen.org/')) AS count1, 
(select count(*) from glygen.file) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'glygen.file: Number of records do not match' 
ELSE 'glygen.file: Number of records match' 
END AS count_match FROM counts;

select count(*) from glygen.collection where id_namespace IN ('https://www.data.glygen.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.collection where id_namespace IN ('https://www.data.glygen.org/')) AS count1, 
(select count(*) from glygen.collection) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'glygen.collection: Number of records do not match' 
ELSE 'glygen.collection: Number of records match' 
END AS count_match FROM counts;

select count(*) from glygen.collection_protein where collection_id_namespace IN ('https://www.data.glygen.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.collection_protein where collection_id_namespace IN ('https://www.data.glygen.org/')) AS count1, 
(select count(*) from glygen.collection_protein) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'glygen.collection_protein: Number of records do not match' 
ELSE 'glygen.collection_protein: Number of records match' 
END AS count_match FROM counts;

select count(*) from glygen.project_in_project where parent_project_id_namespace IN ('https://www.data.glygen.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('https://www.data.glygen.org/')) AS count1, 
(select count(*) from glygen.project_in_project) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'glygen.project_in_project: Number of records do not match' 
ELSE 'glygen.project_in_project: Number of records match' 
END AS count_match FROM counts;

select count(*) from glygen.collection_taxonomy where collection_id_namespace IN ('https://www.data.glygen.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.collection_taxonomy where collection_id_namespace IN ('https://www.data.glygen.org/')) AS count1, 
(select count(*) from glygen.collection_taxonomy) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'glygen.collection_taxonomy: Number of records do not match' 
ELSE 'glygen.collection_taxonomy: Number of records match' 
END AS count_match FROM counts;

select count(*) from glygen.project where id_namespace IN ('https://www.data.glygen.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.project where id_namespace IN ('https://www.data.glygen.org/')) AS count1, 
(select count(*) from glygen.project) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'glygen.project: Number of records do not match' 
ELSE 'glygen.project: Number of records match' 
END AS count_match FROM counts;

select count(*) from glygen.collection_anatomy where collection_id_namespace IN ('https://www.data.glygen.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.collection_anatomy where collection_id_namespace IN ('https://www.data.glygen.org/')) AS count1, 
(select count(*) from glygen.collection_anatomy) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'glygen.collection_anatomy: Number of records do not match' 
ELSE 'glygen.collection_anatomy: Number of records match' 
END AS count_match FROM counts;


