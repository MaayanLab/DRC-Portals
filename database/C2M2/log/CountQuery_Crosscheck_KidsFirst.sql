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


