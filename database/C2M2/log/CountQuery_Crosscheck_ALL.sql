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


/* =============== DCC short label: KidsFirst =============== */
select count(*) from kidsfirst.file where id_namespace IN ('kidsfirst:');
WITH counts AS (SELECT 
(select count(*) from c2m2.file where id_namespace IN ('kidsfirst:')) AS count1, 
(select count(*) from kidsfirst.file) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'kidsfirst.file: Number of records do not match' 
ELSE 'kidsfirst.file: Number of records match' 
END AS count_match FROM counts;

select count(*) from kidsfirst.subject_role_taxonomy where subject_id_namespace IN ('kidsfirst:');
WITH counts AS (SELECT 
(select count(*) from c2m2.subject_role_taxonomy where subject_id_namespace IN ('kidsfirst:')) AS count1, 
(select count(*) from kidsfirst.subject_role_taxonomy) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'kidsfirst.subject_role_taxonomy: Number of records do not match' 
ELSE 'kidsfirst.subject_role_taxonomy: Number of records match' 
END AS count_match FROM counts;

select count(*) from kidsfirst.project where id_namespace IN ('kidsfirst:');
WITH counts AS (SELECT 
(select count(*) from c2m2.project where id_namespace IN ('kidsfirst:')) AS count1, 
(select count(*) from kidsfirst.project) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'kidsfirst.project: Number of records do not match' 
ELSE 'kidsfirst.project: Number of records match' 
END AS count_match FROM counts;

select count(*) from kidsfirst.project_in_project where parent_project_id_namespace IN ('kidsfirst:');
WITH counts AS (SELECT 
(select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('kidsfirst:')) AS count1, 
(select count(*) from kidsfirst.project_in_project) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'kidsfirst.project_in_project: Number of records do not match' 
ELSE 'kidsfirst.project_in_project: Number of records match' 
END AS count_match FROM counts;

select count(*) from kidsfirst.subject where id_namespace IN ('kidsfirst:');
WITH counts AS (SELECT 
(select count(*) from c2m2.subject where id_namespace IN ('kidsfirst:')) AS count1, 
(select count(*) from kidsfirst.subject) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'kidsfirst.subject: Number of records do not match' 
ELSE 'kidsfirst.subject: Number of records match' 
END AS count_match FROM counts;

select count(*) from kidsfirst.biosample where id_namespace IN ('kidsfirst:');
WITH counts AS (SELECT 
(select count(*) from c2m2.biosample where id_namespace IN ('kidsfirst:')) AS count1, 
(select count(*) from kidsfirst.biosample) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'kidsfirst.biosample: Number of records do not match' 
ELSE 'kidsfirst.biosample: Number of records match' 
END AS count_match FROM counts;

select count(*) from kidsfirst.biosample_from_subject where biosample_id_namespace IN ('kidsfirst:');
WITH counts AS (SELECT 
(select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('kidsfirst:')) AS count1, 
(select count(*) from kidsfirst.biosample_from_subject) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'kidsfirst.biosample_from_subject: Number of records do not match' 
ELSE 'kidsfirst.biosample_from_subject: Number of records match' 
END AS count_match FROM counts;

select count(*) from kidsfirst.file_describes_subject where file_id_namespace IN ('kidsfirst:');
WITH counts AS (SELECT 
(select count(*) from c2m2.file_describes_subject where file_id_namespace IN ('kidsfirst:')) AS count1, 
(select count(*) from kidsfirst.file_describes_subject) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'kidsfirst.file_describes_subject: Number of records do not match' 
ELSE 'kidsfirst.file_describes_subject: Number of records match' 
END AS count_match FROM counts;

select count(*) from kidsfirst.file_describes_biosample where file_id_namespace IN ('kidsfirst:');
WITH counts AS (SELECT 
(select count(*) from c2m2.file_describes_biosample where file_id_namespace IN ('kidsfirst:')) AS count1, 
(select count(*) from kidsfirst.file_describes_biosample) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'kidsfirst.file_describes_biosample: Number of records do not match' 
ELSE 'kidsfirst.file_describes_biosample: Number of records match' 
END AS count_match FROM counts;

select count(*) from kidsfirst.subject_disease where subject_id_namespace IN ('kidsfirst:');
WITH counts AS (SELECT 
(select count(*) from c2m2.subject_disease where subject_id_namespace IN ('kidsfirst:')) AS count1, 
(select count(*) from kidsfirst.subject_disease) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'kidsfirst.subject_disease: Number of records do not match' 
ELSE 'kidsfirst.subject_disease: Number of records match' 
END AS count_match FROM counts;

select count(*) from kidsfirst.biosample_disease where biosample_id_namespace IN ('kidsfirst:');
WITH counts AS (SELECT 
(select count(*) from c2m2.biosample_disease where biosample_id_namespace IN ('kidsfirst:')) AS count1, 
(select count(*) from kidsfirst.biosample_disease) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'kidsfirst.biosample_disease: Number of records do not match' 
ELSE 'kidsfirst.biosample_disease: Number of records match' 
END AS count_match FROM counts;


/* =============== DCC short label: Metabolomics =============== */
select count(*) from metabolomics.biosample_from_subject where biosample_id_namespace IN ('https://www.metabolomicsworkbench.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('https://www.metabolomicsworkbench.org/')) AS count1, 
(select count(*) from metabolomics.biosample_from_subject) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'metabolomics.biosample_from_subject: Number of records do not match' 
ELSE 'metabolomics.biosample_from_subject: Number of records match' 
END AS count_match FROM counts;

select count(*) from metabolomics.biosample where id_namespace IN ('https://www.metabolomicsworkbench.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.biosample where id_namespace IN ('https://www.metabolomicsworkbench.org/')) AS count1, 
(select count(*) from metabolomics.biosample) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'metabolomics.biosample: Number of records do not match' 
ELSE 'metabolomics.biosample: Number of records match' 
END AS count_match FROM counts;

select count(*) from metabolomics.file where id_namespace IN ('https://www.metabolomicsworkbench.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.file where id_namespace IN ('https://www.metabolomicsworkbench.org/')) AS count1, 
(select count(*) from metabolomics.file) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'metabolomics.file: Number of records do not match' 
ELSE 'metabolomics.file: Number of records match' 
END AS count_match FROM counts;

select count(*) from metabolomics.project_in_project where parent_project_id_namespace IN ('https://www.metabolomicsworkbench.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('https://www.metabolomicsworkbench.org/')) AS count1, 
(select count(*) from metabolomics.project_in_project) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'metabolomics.project_in_project: Number of records do not match' 
ELSE 'metabolomics.project_in_project: Number of records match' 
END AS count_match FROM counts;

select count(*) from metabolomics.project where id_namespace IN ('https://www.metabolomicsworkbench.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.project where id_namespace IN ('https://www.metabolomicsworkbench.org/')) AS count1, 
(select count(*) from metabolomics.project) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'metabolomics.project: Number of records do not match' 
ELSE 'metabolomics.project: Number of records match' 
END AS count_match FROM counts;

select count(*) from metabolomics.subject_disease where subject_id_namespace IN ('https://www.metabolomicsworkbench.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.subject_disease where subject_id_namespace IN ('https://www.metabolomicsworkbench.org/')) AS count1, 
(select count(*) from metabolomics.subject_disease) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'metabolomics.subject_disease: Number of records do not match' 
ELSE 'metabolomics.subject_disease: Number of records match' 
END AS count_match FROM counts;

select count(*) from metabolomics.subject_phenotype where subject_id_namespace IN ('https://www.metabolomicsworkbench.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.subject_phenotype where subject_id_namespace IN ('https://www.metabolomicsworkbench.org/')) AS count1, 
(select count(*) from metabolomics.subject_phenotype) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'metabolomics.subject_phenotype: Number of records do not match' 
ELSE 'metabolomics.subject_phenotype: Number of records match' 
END AS count_match FROM counts;

select count(*) from metabolomics.subject_role_taxonomy where subject_id_namespace IN ('https://www.metabolomicsworkbench.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.subject_role_taxonomy where subject_id_namespace IN ('https://www.metabolomicsworkbench.org/')) AS count1, 
(select count(*) from metabolomics.subject_role_taxonomy) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'metabolomics.subject_role_taxonomy: Number of records do not match' 
ELSE 'metabolomics.subject_role_taxonomy: Number of records match' 
END AS count_match FROM counts;

select count(*) from metabolomics.subject where id_namespace IN ('https://www.metabolomicsworkbench.org/');
WITH counts AS (SELECT 
(select count(*) from c2m2.subject where id_namespace IN ('https://www.metabolomicsworkbench.org/')) AS count1, 
(select count(*) from metabolomics.subject) AS count2) 
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
THEN 'metabolomics.subject: Number of records do not match' 
ELSE 'metabolomics.subject: Number of records match' 
END AS count_match FROM counts;


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


