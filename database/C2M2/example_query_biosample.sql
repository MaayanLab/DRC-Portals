set statement_timeout = 0;

--- The query below as a starting point to write the sql code to 
--- generat the table c2m2.ffl_biosample in the file biosample_fully_flattened.sql.

--- some queries on the ffl_biosample table;

select count(*) from c2m2.ffl_biosample_collection where searchable @@ to_tsquery('english', 'liver & cancer & asian');
select count(*) from c2m2.ffl_biosample_collection where searchable @@ to_tsquery('english', 'liver & cancer & asian & brain');
select count(*) from c2m2.ffl_biosample_collection where searchable @@ to_tsquery('english', 'liver & cancer & asian & organ');
select count(*) from c2m2.ffl_biosample_collection where searchable @@ to_tsquery('english', 'liver & cancer & asian & mouse');
select count(*) from c2m2.ffl_biosample_collection where searchable @@ to_tsquery('english', 'liver & cancer & asian & human');
select count(*) from c2m2.ffl_biosample_collection where searchable @@ to_tsquery('english', 'liver & cancer & asian & homo sapiens');
select count(*) from c2m2.ffl_biosample_collection where searchable @@ to_tsquery('english', 'liver & cancer & asian & homo & sapiens');
select count(*) from c2m2.ffl_biosample_collection where searchable @@ to_tsquery('english', 'liver & cancer & asian & male');
select count(*) from c2m2.ffl_biosample_collection where searchable @@ to_tsquery('english', 'liver & cancer');
select count(*) from c2m2.ffl_biosample_collection where searchable @@ to_tsquery('english', 'liver & cancer & brain');

select dcc_name, dcc_abbreviation, project_id_namespace,project_name, project_local_id,biosample_id_namespace, 
biosample_local_id from c2m2.ffl_biosample_collection where searchable @@ websearch_to_tsquery('english', 'blood');
select count(*) from (select dcc_name, dcc_abbreviation, project_id_namespace,project_name, project_local_id,biosample_id_namespace, 
biosample_local_id from c2m2.ffl_biosample_collection where searchable @@ websearch_to_tsquery('english', 'blood'));

--- To generate count of unique subject, biosample, etc, grouped by another set of columns
--- from fl_biosample local_id is biosample_local_id
select biosample_id_namespace,project_id_namespace,project_local_id,anatomy,disease,subject_local_id, 
count(distinct biosample_local_id) as count_bios, count(distinct subject_local_id) as count_sub, 
count(distinct collection_local_id) as count_col from c2m2.ffl_biosample 
where project_id_namespace ilike '%metab%' group by 
biosample_id_namespace,project_id_namespace,project_local_id,anatomy,disease,subject_local_id;
--- crosscheck as:
select count(*) from c2m2.biosample where project_local_id = 'PR000024';

select biosample_id_namespace,project_id_namespace,project_local_id,anatomy,disease,subject_local_id, 
count(distinct biosample_local_id) as count_bios, count(distinct subject_local_id) as count_sub, 
count(distinct collection_local_id) as count_col from c2m2.ffl_biosample_collection 
where project_id_namespace ilike '%4dn%' group by 
biosample_id_namespace,project_id_namespace,project_local_id,anatomy,disease,subject_local_id;
--- crosscheck as:
select count(*) from c2m2.biosample where project_local_id = '12a92962-8265-4fc0-b2f8-cf14f05db58b' and anatomy = 'CL:0000081';

--- from ffl_biosample_collection
select biosample_id_namespace,project_id_namespace,project_local_id,anatomy,disease,subject_local_id, 
count(distinct biosample_local_id) as count_bios, count(distinct subject_local_id) as count_sub, 
count(distinct collection_local_id) as count_col from c2m2.ffl_biosample_collection 
where project_id_namespace ilike '%metab%' group by 
biosample_id_namespace,project_id_namespace,project_local_id,anatomy,disease,subject_local_id;

select biosample_id_namespace,project_id_namespace,project_local_id,anatomy,disease,subject_local_id, 
count(distinct biosample_local_id) as count_bios, count(distinct subject_local_id) as count_sub, 
count(distinct collection_local_id) as count_col from c2m2.ffl_biosample_collection 
where project_id_namespace ilike '%4dn%' group by 
biosample_id_namespace,project_id_namespace,project_local_id,anatomy,disease,subject_local_id;

select biosample_id_namespace,project_id_namespace,project_local_id,anatomy,disease,subject_local_id, 
count(distinct biosample_local_id) as count_bios, count(distinct subject_local_id) as count_sub, 
count(distinct collection_local_id) as count_col from c2m2.ffl_biosample_collection 
where project_id_namespace ilike '%4dn%' and subject_local_id = '0f011b1e-b772-4f2a-8c24-cc55de28a994' group by 
biosample_id_namespace,project_id_namespace,project_local_id,anatomy,disease,subject_local_id;
--- crosscheck as:
select count(distinct collection_local_id) from c2m2.biosample_in_collection inner join c2m2.biosample_from_subject 
on c2m2.biosample_in_collection.biosample_local_id = c2m2.biosample_from_subject.biosample_local_id 
where subject_local_id = '0f011b1e-b772-4f2a-8c24-cc55de28a994';


--- add a filter on anatomy
select project_name,anatomy_name,disease_name,subject_local_id,dcc_name from 
c2m2.ffl_biosample_collection where searchable @@ to_tsquery('english', 'liver & cancer & brain') and 
anatomy_name ilike '%liver%';

select project_name,anatomy_name,disease_name,subject_local_id,dcc_name from 
c2m2.ffl_biosample_collection where searchable @@ to_tsquery('english', 'liver & cancer & brain') and 
anatomy_name ilike '%brain%';

--- to debug whu null was showing up in DCC name/abbreviation
--- join with project_in_project was needed since parent_project_id_namespace is what is connected to dcc.project_id_namespace
--- hmp has nested parent-child project structure

select * from c2m2.project_in_project where child_project_id_namespace ilike '%hmp%';

--- kept here for reference DO NOT RUN AS WE DON'T CREATE THE TABLE FL_BIOSAMPLE anymore

--- COLUMNS TO SHOW TO USER ---

select 
    -- add concatenated name from several, and description from project only
    concat('Project: ', c2m2.project.name, ' | Species: ', c2m2.ncbi_taxonomy.name, ' | Anatomy: ', c2m2.anatomy.name,
        ' | Disease: ', c2m2.disease.name) as name, concat('Project: ', c2m2.project.description) as description,

    -- sample_prep_method, anatomy, disease, gene and substance are actually IDs.
    c2m2.fl_biosample.id_namespace as biosample_id_namespace, c2m2.fl_biosample.local_id as biosample_local_id, 
    c2m2.fl_biosample.project_id_namespace as project_id_namespace, c2m2.fl_biosample.project_local_id as project_local_id, 
    c2m2.fl_biosample.persistent_id as biosample_persistent_id, c2m2.fl_biosample.creation_time as biosample_creation_time, 
    c2m2.fl_biosample.sample_prep_method as sample_prep_method, c2m2.fl_biosample.anatomy as anatomy, 
    c2m2.fl_biosample.association_type AS biosample_disease_association_type, c2m2.fl_biosample.disease as disease,
    c2m2.fl_biosample.subject_id_namespace as subject_id_namespace, c2m2.fl_biosample.subject_local_id as subject_local_id, 
    c2m2.fl_biosample.age_at_sampling as biosample_age_at_sampling,
    c2m2.fl_biosample.gene as gene,
    c2m2.fl_biosample.collection_id_namespace as collection_id_namespace, c2m2.fl_biosample.collection_local_id as collection_local_id,
    c2m2.fl_biosample.substance as substance,

    c2m2.dcc.dcc_name as dcc_name, c2m2.dcc.dcc_abbreviation as dcc_abbreviation,

    c2m2.anatomy.name as anatomy_name, c2m2.anatomy.description as anatomy_description, c2m2.anatomy.synonyms as anatomy_synonyms,
    c2m2.gene.name as gene_name, c2m2.gene.description as gene_description, c2m2.gene.synonyms as gene_synonyms,
    c2m2.disease.name as disease_name, c2m2.disease.description as disease_description, c2m2.disease.synonyms as disease_synonyms,

    c2m2.subject.granularity as subject_granularity, c2m2.subject.sex as subject_sex, c2m2.subject.ethnicity as subject_ethnicity, 
    c2m2.subject.age_at_enrollment as subject_age_at_enrollment,

    c2m2.substance.name as substance_name, c2m2.substance.description as substance_description, 
    c2m2.substance.synonyms as substance_synonyms, c2m2.substance.compound as substance_compound,

    c2m2.compound.name as compound_name, c2m2.compound.description as compound_description, 
    c2m2.compound.synonyms as compound_synonyms,

    c2m2.project.name as project_name,  c2m2.project.abbreviation as project_abbreviation, c2m2.project.description as project_description, 

    c2m2.subject_role_taxonomy.taxonomy_id as subject_role_taxonomy_taxonomy_id,
    c2m2.ncbi_taxonomy.name as ncbi_taxonomy_name, c2m2.ncbi_taxonomy.description as ncbi_taxonomy_description, 
    c2m2.ncbi_taxonomy.synonyms as ncbi_taxonomy_synonyms,

    c2m2.collection.name as collection_name, c2m2.collection.abbreviation as collection_abbreviation, 
    c2m2.collection.description as collection_description, c2m2.collection.has_time_series_data as collection_has_time_series_data,

    c2m2.sample_prep_method.name as sample_prep_method_name, c2m2.sample_prep_method.description as sample_prep_method_description,
    c2m2.sample_prep_method.synonyms as sample_prep_method_synonyms

    -- keep adding other column names (I am going in the order of the table)

from c2m2.fl_biosample 

--- JOIN ALL TABLES --- full outer join or inner join or left join or right join?

    left join c2m2.dcc
        on (c2m2.fl_biosample.project_id_namespace = c2m2.dcc.project_id_namespace)

    left join c2m2.anatomy
        on (c2m2.fl_biosample.anatomy = c2m2.anatomy.id)

    left join c2m2.disease
        on (c2m2.fl_biosample.disease = c2m2.disease.id)

    left join c2m2.gene
        on (c2m2.fl_biosample.gene = c2m2.gene.id)

    left join c2m2.substance
        on (c2m2.fl_biosample.substance = c2m2.substance.id)

    left join c2m2.compound
        on (c2m2.substance.compound = c2m2.compound.id)

    left join c2m2.project
        on (c2m2.fl_biosample.project_local_id = c2m2.project.local_id and
        c2m2.fl_biosample.project_id_namespace = c2m2.project.id_namespace) 
        /* we are not defining the new table fl_biosample; just creating and populating it directly.
        We need to keep track of mapping of the columns in the new table as they relate to the original tables.*/
    
    left join c2m2.subject /* Could right-join make more sense here; likely no */
        on (c2m2.fl_biosample.subject_local_id = c2m2.subject.local_id and
        c2m2.fl_biosample.project_id_namespace = c2m2.subject.project_id_namespace)

    /* join with subject_role_taxonomy and ncbi_taxonomy */
    left join c2m2.subject_role_taxonomy
        on (c2m2.fl_biosample.subject_local_id = c2m2.subject_role_taxonomy.subject_local_id and
        c2m2.subject.id_namespace = c2m2.subject_role_taxonomy.subject_id_namespace)

    left join c2m2.ncbi_taxonomy
        on (c2m2.subject_role_taxonomy.taxonomy_id = c2m2.ncbi_taxonomy.id)

    left join c2m2.collection
        on (c2m2.fl_biosample.collection_local_id = c2m2.collection.local_id and
        c2m2.fl_biosample.collection_id_namespace = c2m2.collection.id_namespace)
    
    left join c2m2.sample_prep_method
        on (c2m2.fl_biosample.sample_prep_method = c2m2.sample_prep_method.id)

    /* Do not join with subject_race yet since race.tsv is not created and ingested (or directly created using psql) */
    /* Same thing for the sex and ethnicity tables */

--- CONDITIONS FOR SEARCH TERM ---

    where
        c2m2.anatomy.name like '%liver biopsy%' or
        c2m2.anatomy.description like '%liver biopsy%' or
        c2m2.anatomy.synonyms like '%liver biopsy%' or

        c2m2.gene.name like '%liver biopsy%' or
        c2m2.gene.description like '%liver biopsy%' or
        c2m2.gene.synonyms like '%liver biopsy%' or

        c2m2.disease.name like '%liver biopsy%' or
        c2m2.disease.description like '%liver biopsy%' or
        c2m2.disease.synonyms like '%liver biopsy%' or

        c2m2.subject.sex like '%liver biopsy%' or
        c2m2.subject.ethnicity like '%liver biopsy%' or

        c2m2.project.name like '%liver biopsy%' or
        c2m2.project.abbreviation like '%liver biopsy%' or
        c2m2.project.description like '%liver biopsy%' or 

        c2m2.ncbi_taxonomy.name like '%liver biopsy%' or
        c2m2.ncbi_taxonomy.description like '%liver biopsy%' or 
        c2m2.ncbi_taxonomy.synonyms like '%liver biopsy%' or

        -- include substance/compund name/description/synonyms too?

        c2m2.collection.name like '%liver biopsy%' or
        c2m2.collection.abbreviation like '%liver biopsy%' or
        c2m2.collection.description like '%liver biopsy%' or

        c2m2.sample_prep_method.name like '%liver biopsy%' or
        c2m2.sample_prep_method.description like '%liver biopsy%' or
        c2m2.sample_prep_method.synonyms like '%liver biopsy%'
        limit 5;

--- Mano: 2024/03/13: To estimate time taken by allres_full, all_res, allres_filtered etc
-----------------------------------------------------------------------------------------------
   --- allres_full
   EXPLAIN (ANALYZE)
   SELECT DISTINCT c2m2.ffl_biosample_collection.*,
    ts_rank_cd(searchable, websearch_to_tsquery('english', 'blood')) as "rank"
    FROM c2m2.ffl_biosample_collection
    WHERE searchable @@ websearch_to_tsquery('english', 'blood');

-----------------------------------------------------------------------------------------------
   --- allres_full and allres (combined)
   EXPLAIN (ANALYZE)
    SELECT 
    allres_full.rank AS rank,
    allres_full.dcc_name AS dcc_name,
    allres_full.dcc_abbreviation AS dcc_abbreviation,
    SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
    allres_full.project_local_id AS project_local_id,
    COALESCE(allres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name,
    SPLIT_PART(allres_full.subject_role_taxonomy_taxonomy_id, ':', 2) as taxonomy_id,
    COALESCE(allres_full.disease_name, 'Unspecified') AS disease_name,
    REPLACE(allres_full.disease, ':', '_') AS disease,
    COALESCE(allres_full.anatomy_name, 'Unspecified') AS anatomy_name,
    REPLACE(allres_full.anatomy, ':', '_') AS anatomy,
    COALESCE(allres_full.gene_name, 'Unspecified') AS gene_name,
    allres_full.gene AS gene,
    COALESCE(allres_full.data_type_name, 'Unspecified') AS data_type_name,
    REPLACE(allres_full.data_type_id, ':', '_') AS data_type,
    allres_full.project_name AS project_name,
    c2m2.project.description AS project_description,
    COUNT(*)::INT AS count,
    COUNT(DISTINCT biosample_local_id)::INT AS count_bios, 
    COUNT(DISTINCT subject_local_id)::INT AS count_sub, 
    COUNT(DISTINCT collection_local_id)::INT AS count_col
  FROM (SELECT DISTINCT c2m2.ffl_biosample_collection.*,
        ts_rank_cd(searchable, websearch_to_tsquery('english', 'blood')) as "rank"
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', 'blood')
    ) allres_full 
  LEFT JOIN c2m2.project ON (allres_full.project_id_namespace = c2m2.project.id_namespace AND 
    allres_full.project_local_id = c2m2.project.local_id) 
  GROUP BY rank, dcc_name, dcc_abbreviation, dcc_short_label, project_local_id, taxonomy_name, taxonomy_id, 
    disease_name, disease, anatomy_name, anatomy, gene_name, gene, data_type_name, data_type, 
    project_name, project_description 
  ORDER BY rank DESC, dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name, gene_name, data_type_name
  limit 10
  ;

-----------------------------------------------------------------------------------------------
--- allres_full, allres, allres_filtered combined
EXPLAIN (ANALYZE)
WITH allres_full AS (
  SELECT DISTINCT c2m2.ffl_biosample_collection.*,
    ts_rank_cd(searchable, websearch_to_tsquery('english', 'blood')) as "rank"
    FROM c2m2.ffl_biosample_collection
    WHERE searchable @@ websearch_to_tsquery('english', 'blood') 
),
allres AS (
  SELECT 
    allres_full.rank AS rank,
    allres_full.dcc_name AS dcc_name,
    allres_full.dcc_abbreviation AS dcc_abbreviation,
    SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
    allres_full.project_local_id AS project_local_id,
    COALESCE(allres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name,
    SPLIT_PART(allres_full.subject_role_taxonomy_taxonomy_id, ':', 2) as taxonomy_id,
    COALESCE(allres_full.disease_name, 'Unspecified') AS disease_name,
    REPLACE(allres_full.disease, ':', '_') AS disease,
    COALESCE(allres_full.anatomy_name, 'Unspecified') AS anatomy_name,
    REPLACE(allres_full.anatomy, ':', '_') AS anatomy,
    COALESCE(allres_full.gene_name, 'Unspecified') AS gene_name,
    allres_full.gene AS gene,
    COALESCE(allres_full.data_type_name, 'Unspecified') AS data_type_name,
    REPLACE(allres_full.data_type_id, ':', '_') AS data_type,
    allres_full.project_name AS project_name,
    c2m2.project.description AS project_description,
    COUNT(*)::INT AS count,
    COUNT(DISTINCT biosample_local_id)::INT AS count_bios, 
    COUNT(DISTINCT subject_local_id)::INT AS count_sub, 
    COUNT(DISTINCT collection_local_id)::INT AS count_col
  FROM allres_full 
  LEFT JOIN c2m2.project ON (allres_full.project_id_namespace = c2m2.project.id_namespace AND 
    allres_full.project_local_id = c2m2.project.local_id) 
  GROUP BY rank, dcc_name, dcc_abbreviation, dcc_short_label, project_local_id, taxonomy_name, taxonomy_id, 
    disease_name, disease, anatomy_name, anatomy, gene_name, gene, data_type_name, data_type, 
    project_name, project_description 
  ORDER BY rank DESC, dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name, gene_name, data_type_name
)
SELECT * from (
  SELECT allres.*, 
  concat_ws('', '/data/c2m2/record_info?q=', 'blood', '&t=', 'dcc_name:', allres.dcc_name, 
  '|', 'project_local_id:', allres.project_local_id, '|', 'disease_name:', allres.disease_name, 
  '|', 'ncbi_taxonomy_name:', allres.taxonomy_name, '|', 'anatomy_name:', allres.anatomy_name, 
  '|', 'gene_name:', allres.gene_name, '|', 'data_type_name:', allres.data_type_name) AS record_info_url
  FROM allres where allres.disease_name = 'cancer'
) allres_filtered;


-----------------------------------------------------------------------------------------------
--- entire CTE in search/page.tsc
/**/ \set myq 'blood'; \set my_disease 'cancer'; /**/
/* \set myq 'blood'; \set my_disease 'carcinoma'; */
/*  \set myq 'brain'; \set my_disease 'malignant astrocytoma';  */
/* \set myq 'liver'; \set my_disease 'cancer'; */
/* \set myq 'intestine'; \set my_disease 'cancer'; */
/* \set myq 'parkinson'; \set my_disease 'cancer';  */

EXPLAIN (ANALYZE)
WITH allres_full AS (
  SELECT DISTINCT c2m2.ffl_biosample_collection.*,
    ts_rank_cd(searchable, websearch_to_tsquery('english', :'myq')) as "rank"
    FROM c2m2.ffl_biosample_collection
    WHERE searchable @@ websearch_to_tsquery('english', :'myq') 
),
allres AS (
  SELECT 
    allres_full.rank AS rank,
    allres_full.dcc_name AS dcc_name,
    allres_full.dcc_abbreviation AS dcc_abbreviation,
    SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
    allres_full.project_local_id AS project_local_id,
    COALESCE(allres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name,
    SPLIT_PART(allres_full.subject_role_taxonomy_taxonomy_id, ':', 2) as taxonomy_id,
    COALESCE(allres_full.disease_name, 'Unspecified') AS disease_name,
    REPLACE(allres_full.disease, ':', '_') AS disease,
    COALESCE(allres_full.anatomy_name, 'Unspecified') AS anatomy_name,
    REPLACE(allres_full.anatomy, ':', '_') AS anatomy,
    COALESCE(allres_full.gene_name, 'Unspecified') AS gene_name,
    allres_full.gene AS gene,
    COALESCE(allres_full.data_type_name, 'Unspecified') AS data_type_name,
    REPLACE(allres_full.data_type_id, ':', '_') AS data_type,
    allres_full.project_name AS project_name,
    c2m2.project.description AS project_description,
    COUNT(*)::INT AS count,
    COUNT(DISTINCT biosample_local_id)::INT AS count_bios, 
    COUNT(DISTINCT subject_local_id)::INT AS count_sub, 
    COUNT(DISTINCT collection_local_id)::INT AS count_col
  FROM allres_full 
  LEFT JOIN c2m2.project ON (allres_full.project_id_namespace = c2m2.project.id_namespace AND 
    allres_full.project_local_id = c2m2.project.local_id) 
  GROUP BY rank, dcc_name, dcc_abbreviation, dcc_short_label, project_local_id, taxonomy_name, taxonomy_id, 
    disease_name, disease, anatomy_name, anatomy, gene_name, gene, data_type_name, data_type, 
    project_name, project_description 
  ORDER BY rank DESC, dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name, gene_name, data_type_name
),
allres_filtered AS (
  SELECT allres.*, 
  concat_ws('', '/data/c2m2/record_info?q=', :'myq', '&t=', 'dcc_name:', allres.dcc_name, 
  '|', 'project_local_id:', allres.project_local_id, '|', 'disease_name:', allres.disease_name, 
  '|', 'ncbi_taxonomy_name:', allres.taxonomy_name, '|', 'anatomy_name:', allres.anatomy_name, 
  '|', 'gene_name:', allres.gene_name, '|', 'data_type_name:', allres.data_type_name) AS record_info_url
  FROM allres /* where allres.disease_name = :'my_disease' */
),
allres_limited AS (
  SELECT *
  FROM allres_filtered
  OFFSET 0
  LIMIT 10   
),
total_count as (
  select count(*)::int as count
  from allres_filtered
),
dcc_name_count AS (
  SELECT dcc_name, dcc_short_label, COUNT(*) AS count 
  FROM allres_filtered
  GROUP BY dcc_name, dcc_short_label ORDER BY dcc_short_label, dcc_name
),
taxonomy_name_count AS (
  SELECT taxonomy_name, COUNT(*) AS count
  FROM allres_filtered
  GROUP BY taxonomy_name ORDER BY taxonomy_name
),
disease_name_count AS (
  SELECT disease_name, COUNT(*) AS count
  FROM allres_filtered
  GROUP BY disease_name ORDER BY disease_name
),
anatomy_name_count AS (
  SELECT anatomy_name, COUNT(*) AS count
  FROM allres_filtered
  GROUP BY anatomy_name ORDER BY anatomy_name
),
project_name_count AS (
  SELECT project_name, COUNT(*) AS count 
  FROM allres_filtered
  GROUP BY project_name ORDER BY project_name
),
gene_name_count AS (
  SELECT gene_name, COUNT(*) AS count 
  FROM allres_filtered
  GROUP BY gene_name ORDER BY gene_name
),
data_type_name_count AS (
  SELECT data_type_name, COUNT(*) AS count 
  FROM allres_filtered
  GROUP BY data_type_name ORDER BY data_type_name
)

SELECT
(SELECT COALESCE(jsonb_agg(allres_limited.*), '[]'::jsonb) FROM allres_limited) AS records, 
  (SELECT count FROM total_count) as count,
  (SELECT COALESCE(jsonb_agg(dcc_name_count.*), '[]'::jsonb) FROM dcc_name_count) AS dcc_filters,
  (SELECT COALESCE(jsonb_agg(taxonomy_name_count.*), '[]'::jsonb) FROM taxonomy_name_count) AS taxonomy_filters,
  (SELECT COALESCE(jsonb_agg(disease_name_count.*), '[]'::jsonb) FROM disease_name_count) AS disease_filters,
  (SELECT COALESCE(jsonb_agg(anatomy_name_count.*), '[]'::jsonb) FROM anatomy_name_count) AS anatomy_filters,
  (SELECT COALESCE(jsonb_agg(project_name_count.*), '[]'::jsonb) FROM project_name_count) AS project_filters,
  (SELECT COALESCE(jsonb_agg(gene_name_count.*), '[]'::jsonb) FROM gene_name_count) AS gene_filters,
  (SELECT COALESCE(jsonb_agg(data_type_name_count.*), '[]'::jsonb) FROM data_type_name_count) AS data_type_filters
;

--- Time taken
--- brain 4.2 6000 
--- blood 22 13800
--- intestine 9 12600
--- liver 3.6 7200
--- parkinson 0.086 64
--- carcinoma 37.2 59600
--- neuroblastoma 0.86 620
--- cancer 43.9 59800

--- test effect of master limit or no limit
EXPLAIN (ANALYZE)
SELECT  count(*) from (select c2m2.ffl_biosample_collection.*,
        ts_rank_cd(searchable, websearch_to_tsquery('english', 'blood')) as "rank"
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', 'blood')
        ORDER BY rank DESC,  dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, gene_name, 
        protein_name, compound_name, data_type_name  , subject_local_id, biosample_local_id, collection_local_id);

--- Find time for just count vs. getting actual records
EXPLAIN (ANALYZE)
      SELECT  count(*) from (SELECT c2m2.ffl_biosample_collection.*,
        ts_rank_cd(searchable, websearch_to_tsquery('english', 'blood')) as "rank"
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', 'blood')
        ORDER BY rank DESC,  dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, gene_name, 
        protein_name, compound_name, data_type_name  , subject_local_id, biosample_local_id, collection_local_id
        LIMIT 200000);

EXPLAIN (ANALYZE)
      SELECT  c2m2.ffl_biosample_collection.*,
        ts_rank_cd(searchable, websearch_to_tsquery('english', 'blood')) as "rank"
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', 'blood')
        ORDER BY rank DESC,  dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, gene_name, 
        protein_name, compound_name, data_type_name  , subject_local_id, biosample_local_id, collection_local_id
        LIMIT 200000;

--- liver
EXPLAIN (ANALYZE)
      SELECT  c2m2.ffl_biosample_collection.*,
        ts_rank_cd(searchable, websearch_to_tsquery('english', 'liver')) as "rank"
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', 'liver')
        ORDER BY rank DESC,  dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, gene_name, 
        protein_name, compound_name, data_type_name  , subject_local_id, biosample_local_id, collection_local_id
        LIMIT 200000;

--- actual full query
/**/ \set myq 'liver'; \set my_disease 'cancer'; /**/
--- If large enough work_mem, then sort happens in RAM as opposed to disk; but these disks also are very fast
set work_mem = '64MB'; /* set LOCAL work_mem = '64MB'; or 256MB or 512MB, not much difference for blood 31 vs 30s */
/* See lines like: Sort Method: external merge  Disk          &     Sort Method: quicksort */
EXPLAIN (ANALYZE)
    WITH 
    allres AS (
      SELECT 
        ts_rank_cd(searchable, websearch_to_tsquery('english', 'blood')) AS rank,
        allres_full.dcc_name AS dcc_name,
        allres_full.dcc_abbreviation AS dcc_abbreviation,
        SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
        COALESCE(allres_full.project_local_id, 'Unspecified') AS project_local_id, /* added Unspecified as needed in record_info_col */
        /* CASE WHEN allres_full.ncbi_taxonomy_name IS NULL THEN 'Unspecified' ELSE allres_full.ncbi_taxonomy_name END AS taxonomy_name, */
        COALESCE(allres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name,
        SPLIT_PART(allres_full.subject_role_taxonomy_taxonomy_id, ':', 2) as taxonomy_id,
        /* CASE WHEN allres_full.disease_name IS NULL THEN 'Unspecified' ELSE allres_full.disease_name END AS disease_name, */
        COALESCE(allres_full.disease_name, 'Unspecified') AS disease_name,
        REPLACE(allres_full.disease, ':', '_') AS disease,
        /* CASE WHEN allres_full.anatomy_name IS NULL THEN 'Unspecified' ELSE allres_full.anatomy_name END AS anatomy_name, */
        COALESCE(allres_full.anatomy_name, 'Unspecified') AS anatomy_name,
        REPLACE(allres_full.anatomy, ':', '_') AS anatomy,
        /* CASE WHEN allres_full.gene_name IS NULL THEN 'Unspecified' ELSE allres_full.gene_name END AS gene_name, */
        COALESCE(allres_full.gene_name, 'Unspecified') AS gene_name,
        allres_full.gene AS gene,
        COALESCE(allres_full.protein_name, 'Unspecified') AS protein_name,
        allres_full.protein AS protein,
        COALESCE(allres_full.compound_name, 'Unspecified') AS compound_name,
        allres_full.substance_compound AS compound,
        COALESCE(allres_full.data_type_name, 'Unspecified') AS data_type_name,
        REPLACE(allres_full.data_type_id, ':', '_') AS data_type,
        /* allres_full.project_name AS project_name, */
        COALESCE(allres_full.project_name, 
          concat_ws('', 'Dummy: Biosample/Collection(s) from ', SPLIT_PART(allres_full.dcc_abbreviation, '_', 1))) AS project_name,
        /**** c2m2.project.description AS project_description, ****/
        allres_full.project_persistent_id as project_persistent_id,
        COUNT(*)::INT AS count,
        COUNT(DISTINCT biosample_local_id)::INT AS count_bios, 
        COUNT(DISTINCT subject_local_id)::INT AS count_sub, 
        COUNT(DISTINCT collection_local_id)::INT AS count_col
      FROM c2m2.ffl_biosample_collection as allres_full 
      /**** LEFT JOIN c2m2.project ON (allres_full.project_id_namespace = c2m2.project.id_namespace AND 
        allres_full.project_local_id = c2m2.project.local_id) ****/
      /* LEFT JOIN c2m2.project_data_type ON (allres_full.project_id_namespace = c2m2.project_data_type.project_id_namespace AND 
        allres_full.project_local_id = c2m2.project_data_type.project_local_id) keep for some time */

      /**** Mano: 2024/08/09: Trying to combine allres_full and allres into one CTE ****/  
      WHERE searchable @@ websearch_to_tsquery('english', 'blood')
        
      GROUP BY rank, dcc_name, dcc_abbreviation, dcc_short_label, project_local_id, taxonomy_name, taxonomy_id, 
        disease_name, disease, anatomy_name, anatomy, gene_name, gene, protein_name, protein, compound_name, compound,
        data_type_name, data_type, project_name /**** , project_description ****/ , allres_full.project_persistent_id 
      ORDER BY rank DESC, dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name, gene_name, 
        protein_name, compound_name, data_type_name /* DONOT INCLUDE THESE THREE: , subject_local_id, biosample_local_id, collection_local_id */
      OFFSET 0
      LIMIT 50000 /* ${allres_filtered_maxrow_limit}      */
    ),
    allres_filtered_count AS (SELECT count(*)::int as filtered_count FROM allres /*${filterClause}*/),
    allres_filtered AS (
      SELECT allres.*, 
      concat_ws('', '/data/c2m2/record_info?q=', 'blood', '&t=', 'dcc_name:', allres.dcc_name, 
      '|', 'project_local_id:', allres.project_local_id, '|', 'disease_name:', allres.disease_name, 
      '|', 'ncbi_taxonomy_name:', allres.taxonomy_name, '|', 'anatomy_name:', allres.anatomy_name, 
      '|', 'gene_name:', allres.gene_name, '|', 'protein_name:', allres.protein_name,
      '|', 'compound_name:', allres.compound_name, '|', 'data_type_name:', allres.data_type_name) AS record_info_url
      FROM allres
      /*${filterClause}*/
      /*LIMIT ${allres_filtered_maxrow_limit}*/
    ),
    allres_limited AS (
      SELECT *
      FROM allres_filtered
      OFFSET 0
      LIMIT 10   
    ),
    total_count as (
      select count(*)::int as count
      from allres_filtered
    )
    
    SELECT
    (SELECT COALESCE(jsonb_agg(allres_limited.*), '[]'::jsonb) AS records FROM allres_limited ), 
    (SELECT count FROM total_count) as count,
    (SELECT filtered_count FROM allres_filtered_count) as all_count
;

--- Figure out the anomaly of searching for metabol or metabolomics and DCC filter MW
--- metabol gives 1191, metabolomics gives 2254 (same as on the web/ngrok)
select count(*) from (
      SELECT DISTINCT 
        ts_rank_cd(searchable, websearch_to_tsquery('english', 'metabolomics')) AS rank,
        allres_full.dcc_name AS dcc_name,
        allres_full.dcc_abbreviation AS dcc_abbreviation,
        SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
        COALESCE(allres_full.project_local_id, 'Unspecified') AS project_local_id, /* added Unspecified as needed in record_info_col */
        /* CASE WHEN allres_full.ncbi_taxonomy_name IS NULL THEN 'Unspecified' ELSE allres_full.ncbi_taxonomy_name END AS taxonomy_name, */
        COALESCE(allres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name,
        SPLIT_PART(allres_full.subject_role_taxonomy_taxonomy_id, ':', 2) as taxonomy_id,
        /* CASE WHEN allres_full.disease_name IS NULL THEN 'Unspecified' ELSE allres_full.disease_name END AS disease_name, */
        COALESCE(allres_full.disease_name, 'Unspecified') AS disease_name,
        REPLACE(allres_full.disease, ':', '_') AS disease,
        /* CASE WHEN allres_full.anatomy_name IS NULL THEN 'Unspecified' ELSE allres_full.anatomy_name END AS anatomy_name, */
        COALESCE(allres_full.anatomy_name, 'Unspecified') AS anatomy_name,
        REPLACE(allres_full.anatomy, ':', '_') AS anatomy,
        /* CASE WHEN allres_full.gene_name IS NULL THEN 'Unspecified' ELSE allres_full.gene_name END AS gene_name, */
        COALESCE(allres_full.gene_name, 'Unspecified') AS gene_name,
        allres_full.gene AS gene,
        COALESCE(allres_full.protein_name, 'Unspecified') AS protein_name,
        allres_full.protein AS protein,
        COALESCE(allres_full.compound_name, 'Unspecified') AS compound_name,
        allres_full.substance_compound AS compound,
        COALESCE(allres_full.data_type_name, 'Unspecified') AS data_type_name,
        REPLACE(allres_full.data_type_id, ':', '_') AS data_type,
        /* allres_full.project_name AS project_name, */
        COALESCE(allres_full.project_name, 
          concat_ws('', 'Dummy: Biosample/Collection(s) from ', SPLIT_PART(allres_full.dcc_abbreviation, '_', 1))) AS project_name,
        /**** c2m2.project.description AS project_description, ****/
        allres_full.project_persistent_id as project_persistent_id,
        COUNT(*)::INT AS count,
        /**** COUNT(DISTINCT biosample_local_id)::INT ****/ -99 AS count_bios, 
        COUNT(DISTINCT subject_local_id)::INT AS count_sub, 
        COUNT(DISTINCT collection_local_id)::INT AS count_col
      /**** FROM c2m2.ffl_biosample_collection_cmp as allres_full ****/
      FROM c2m2."ffl_biosample_collection_cmp" as allres_full 
      
      /**** LEFT JOIN c2m2.project ON (allres_full.project_id_namespace = c2m2.project.id_namespace AND 
        allres_full.project_local_id = c2m2.project.local_id) ****/
      /* LEFT JOIN c2m2.project_data_type ON (allres_full.project_id_namespace = c2m2.project_data_type.project_id_namespace AND 
        allres_full.project_local_id = c2m2.project_data_type.project_local_id) keep for some time */

      /**** Mano: 2024/08/09: Trying to combine allres_full and allres into one CTE ****/  
      WHERE searchable @@ websearch_to_tsquery('english', 'metabolomics')
        and ("allres_full"."dcc_name" = 'UCSD Metabolomics Workbench')
        
      GROUP BY rank, dcc_name, dcc_abbreviation, dcc_short_label, project_local_id, taxonomy_name, taxonomy_id, 
        disease_name, disease, anatomy_name, anatomy, gene_name, gene, protein_name, protein, compound_name, compound,
        data_type_name, data_type, project_name /**** , project_description ****/ , allres_full.project_persistent_id 
      ORDER BY rank DESC, dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name, gene_name, 
        protein_name, compound_name, data_type_name /* DONOT INCLUDE THESE THREE: , subject_local_id, biosample_local_id, collection_local_id */
      OFFSET 0
      LIMIT 10000000 /* $10      */
);


--- Test if project_data_type can be generated with a simpler query
select count(*) from (select distinct c2m2.file.project_id_namespace, c2m2.file.project_local_id,
    c2m2.file.data_type, c2m2.file.assay_type from 
    c2m2.project 
    left join c2m2.file
        on (c2m2.project.local_id = c2m2.file.project_local_id and
        c2m2.project.id_namespace = c2m2.file.project_id_namespace)
    );
  
  select count(*) from (select distinct project_id_namespace, project_local_id,
    data_type, assay_type from c2m2.file);


(select distinct c2m2.file.project_id_namespace, c2m2.file.project_local_id,
    c2m2.file.data_type, c2m2.file.assay_type from 
    c2m2.project 
    left join c2m2.file
        on (c2m2.project.local_id = c2m2.file.project_local_id and
        c2m2.project.id_namespace = c2m2.file.project_id_namespace)
)
except
(select distinct project_id_namespace, project_local_id, data_type, assay_type from c2m2.file);


----->
project_id_namespace | project_local_id | data_type | assay_type 
----------------------+------------------+-----------+------------
                      |                  |           | 
(1 row)

------------------------
--- Add assay_type filter in C2M2 main search results page; suggested during the demo during August12 DRC/KC meeting.

--- This will require adding assay_type (and related information) into ffl_biosample and ffl_collection (which are then combined into ffl_biosample_collection), resulting in about 15% more rows (and make the search a bit slower correspondingly) as per the counts below.
select count(*) from (select distinct project_local_id, data_type, assay_type from c2m2.file);
4934

select count(*) from (select distinct project_local_id, data_type from c2m2.file);
4276

---- substantial increase if add all others from file
select count(*) from (select distinct project_local_id, file_format, data_type, assay_type, analysis_type from c2m2.file);
7127
