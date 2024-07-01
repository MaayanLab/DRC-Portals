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


