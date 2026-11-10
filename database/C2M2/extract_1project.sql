--- This script is used to extract a subset of rows from various tables, corresponding to a single project, e.g.,
/* run in psql as \i extract_1project.sql */
/* Or on linux command prompt:psql -h localhost -U drc -d drc  -p [5432|5433] -a -f extract_1project.sql; */

--- Example psql code to write output to file
--- \set pr PR000633
--- \copy (SELECT distinct id_namespace, local_id, persistent_id, creation_time, abbreviation, name, description from c2m2.project where local_id = :'pr') TO project1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;

--- project
--- \copy (SELECT distinct local_id, persistent_id, creation_time, abbreviation, name, description 
---     from c2m2.project where local_id = 'PR000633') TO project1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;
\copy (SELECT distinct local_id, persistent_id, creation_time, abbreviation, name, description from c2m2.project where local_id = 'PR000633') TO project1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;

--- subject
/*
\copy (
SELECT distinct local_id, project_local_id, persistent_id, creation_time, granularity, sex, ethnicity, age_at_enrollment 
from c2m2.subject where project_local_id = 'PR000633'
) TO subject1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;
*/

\copy (SELECT distinct local_id, project_local_id, persistent_id, creation_time, granularity, sex, ethnicity, age_at_enrollment from c2m2.subject where project_local_id = 'PR000633') TO subject1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;

--- SELECT distinct local_id from c2m2.subject where project_local_id = 'PR000633';
--- To get local_id that can be used to query other subject_* tables after seeing the output of this on the psql prompt
SELECT string_agg(quote_literal(local_id), ', ') AS subject_ids FROM (SELECT DISTINCT local_id FROM c2m2.subject WHERE project_local_id = 'PR000633') t;

--- biosample
/*
\copy (
    SELECT distinct local_id, project_local_id, persistent_id, creation_time, sample_prep_method, anatomy, biofluid 
    from c2m2.biosample where project_local_id = 'PR000633'
) TO biosample1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;
*/

\copy (SELECT distinct local_id, project_local_id, persistent_id, creation_time, sample_prep_method, anatomy, biofluid from c2m2.biosample where project_local_id = 'PR000633') TO biosample1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;

SELECT distinct anatomy from c2m2.biosample where project_local_id = 'PR000633';
SELECT distinct biofluid from c2m2.biosample where project_local_id = 'PR000633';

--- file
--- \copy (SELECT * from c2m2.file where project_local_id = 'PR000633') TO file1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;
\copy (SELECT local_id, project_local_id, size_in_bytes, md5, filename, file_format, data_type, assay_type, analysis_type from c2m2.file where project_local_id = 'PR000633') TO file1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;

--- subject_disease
/*
\copy (
select c2m2.subject_disease.subject_local_id, c2m2.subject_disease.association_type, c2m2.subject_disease.disease 
from c2m2.subject left join c2m2.subject_disease 
on (c2m2.subject.local_id = c2m2.subject_disease.subject_local_id and
c2m2.subject.id_namespace = c2m2.subject_disease.subject_id_namespace) 
where c2m2.subject.project_local_id = 'PR000633'
) TO subject_disease1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;
*/

\copy (select c2m2.subject_disease.subject_local_id, c2m2.subject_disease.association_type, c2m2.subject_disease.disease from c2m2.subject left join c2m2.subject_disease on (c2m2.subject.local_id = c2m2.subject_disease.subject_local_id and c2m2.subject.id_namespace = c2m2.subject_disease.subject_id_namespace) where c2m2.subject.project_local_id = 'PR000633') TO subject_disease1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;

--- biosample_from_subject
\copy (select biosample_local_id, subject_local_id, age_at_sampling from c2m2.biosample_from_subject where subject_local_id in ('SU000953', 'SU000954', 'SU000955')) TO biosample_from_subject1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;

--- disease
\copy (select id,name,synonyms,description from c2m2.disease where id = 'DOID:9452') TO disease1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;

--- subject_role_taxonomy
\copy (select subject_local_id, role_id, taxonomy_id from c2m2.subject_role_taxonomy where subject_local_id IN ('SU000953', 'SU000954', 'SU000955')) TO subject_role_taxonomy1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;

--- IN synonyms, replace extra " in clean up
--- ncbi_taxonomy
\copy (select id, clade, name, description, synonyms from c2m2.ncbi_taxonomy where id = 'NCBI:txid9606') TO ncbi_taxonomy1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;

--- anatomy and biofluid
\copy (select id,name,synonyms,description from c2m2.anatomy where id = 'UBERON:0002107') TO anatomy1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;
\copy (select id,name,synonyms,description from c2m2.biofluid where id in ('UBERON:0001088', 'UBERON:0001969')) TO biofluid1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;

--- data_type and assay_type
\copy (select id,name,synonyms,description from c2m2.data_type where id = 'data:2536') TO data_type1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;
\copy (select id,name,synonyms,description from c2m2.assay_type where id in ('OBI:0000470')) TO assay_type1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;
