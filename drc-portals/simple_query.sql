WITH allres_full AS (
    SELECT DISTINCT c2m2.ffl_biosample.*,
        ts_rank_cd(searchable, websearch_to_tsquery('english', $1)) as "rank"
      FROM c2m2.ffl_biosample
      WHERE searchable @@ websearch_to_tsquery('english', $2)  AND ("c2m2"."ffl_biosample"."dcc_name" = 'UCSD Metabolomics Workbench') AND ("c2m2"."ffl_biosample"."project_local_id" = 'PR000667') AND ("c2m2"."ffl_biosample"."disease_name" is null) AND ("c2m2"."ffl_biosample"."ncbi_taxonomy_name" = 'Homo sapiens') AND ("c2m2"."ffl_biosample"."anatomy_name" = 'liver')
      ORDER BY rank DESC
  ),
  allres AS (
    SELECT 
      allres_full.dcc_name AS dcc_name,
      allres_full.dcc_abbreviation AS dcc_abbreviation,
      SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
      CASE WHEN allres_full.ncbi_taxonomy_name IS NULL THEN 'Unspecified' ELSE allres_full.ncbi_taxonomy_name END AS taxonomy_name,
      CASE WHEN allres_full.disease_name IS NULL THEN 'Unspecified' ELSE allres_full.disease_name END AS disease_name,
      CASE WHEN allres_full.anatomy_name IS NULL THEN 'Unspecified' ELSE allres_full.anatomy_name END AS anatomy_name,
      allres_full.project_name AS project_name,
      c2m2.project.description AS project_description,
      c2m2.anatomy.description AS anatomy_description,
      c2m2.disease.description AS disease_description,
      COUNT(*)::INT AS count,
      COUNT(DISTINCT biosample_local_id)::INT AS count_bios, 
      COUNT(DISTINCT subject_local_id)::INT AS count_sub, 
      COUNT(DISTINCT collection_local_id)::INT AS count_col
    FROM allres_full 
    LEFT JOIN c2m2.project ON (allres_full.project_id_namespace = c2m2.project.id_namespace AND 
      allres_full.project_local_id = c2m2.project.local_id) 
    LEFT JOIN c2m2.anatomy ON (allres_full.anatomy = c2m2.anatomy.id)
    LEFT JOIN c2m2.disease ON (allres_full.disease = c2m2.disease.id)
    GROUP BY dcc_name, dcc_abbreviation, dcc_short_label, taxonomy_name, disease_name, anatomy_name, project_name, project_description, anatomy_description, disease_description
    /*GROUP BY dcc_name, dcc_abbreviation, dcc_short_label, taxonomy_name, disease_name, anatomy_name, project_name, project_description, rank*/
    ORDER BY  dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name /*rank DESC*/
  ),
  biosamples_table as (
    SELECT DISTINCT
      allres_full.biosample_id_namespace,
      allres_full.biosample_local_id,
      allres_full.project_id_namespace,
      allres_full.project_local_id,
      allres_full.biosample_persistent_id,
      allres_full.biosample_creation_time,
      allres_full.sample_prep_method_name,
      allres_full.anatomy_name,
      allres_full.disease_name,
      allres_full.disease_association_type_name,
      allres_full.subject_id_namespace,
      allres_full.subject_local_id,
      allres_full.biosample_age_at_sampling,
      allres_full.gene_name,
      allres_full.substance_name

    FROM allres_full

  ),
   count_bios AS (
    select count(*)::int as count
      from biosamples_table
  ),
  /*sample_prep_method_name_count AS (
    SELECT CASE WHEN sample_prep_method_name IS NULL THEN 'Unspecified' ELSE sample_prep_method_name END AS sample_prep_method_name, COUNT(*) AS count
    FROM  biosamples_table
    GROUP BY sample_prep_method_name ORDER BY sample_prep_method_name
  ), 
  collections_table as (
    SELECT DISTINCT
      allres_full.biosample_id_namespace,
      allres_full.biosample_local_id,      
      c2m2.collection.*

      FROM allres_full 

      LEFT JOIN c2m2.collection ON (allres_full.collection_id_namespace = c2m2.collection.id_namespace AND allres_full.collection_local_id = c2m2.collection.local_id)

      WHERE allres_full.collection_local_id is not null
  ),
  count_col as (
    select count(*)::int as count
      from collections_table
  ),*/
  /* Mano - We can also add the columns persistent_id and creation_time*/
  /*
  subjects_table as (
    
    SELECT DISTINCT
      allres_full.biosample_id_namespace,
      allres_full.biosample_local_id,
      allres_full.subject_id_namespace,
      allres_full.subject_local_id,
      allres_full.subject_race_name,
      allres_full.subject_granularity_name,
      allres_full.subject_sex_name,
      allres_full.subject_ethnicity_name,
      allres_full.subject_role_name,
      allres_full.age_at_enrollment

    FROM allres_full
  ),
  count_sub as (
    select count(*)::int as count
      from subjects_table
  )
  */
  SELECT
  (SELECT COALESCE(jsonb_agg(allres.*), '[]'::jsonb) AS records FROM allres), 
  (SELECT count FROM count_bios) as count_bios,
  (SELECT COALESCE(jsonb_agg(biosamples_table.*), '[]'::jsonb) FROM biosamples_table) AS biosamples_table
  /* (SELECT COALESCE(jsonb_agg(sample_prep_method_name_count.*), '[]'::jsonb) FROM sample_prep_method_name_count) AS sample_prep_method_name_filters,
  (SELECT count FROM count_col) as count_col,
  (SELECT COALESCE(jsonb_agg(collections_table.*), '[]'::jsonb) FROM collections_table) AS collections_table,
  (SELECT count FROM count_sub) as count_sub,
  (SELECT COALESCE(jsonb_agg(subjects_table.*), '[]'::jsonb) FROM subjects_table) AS subjects_table */
    ;


    WITH allres_full AS (
    SELECT DISTINCT c2m2.ffl_biosample.*,
        ts_rank_cd(searchable, websearch_to_tsquery('english', 'liver')) as "rank"
      FROM c2m2.ffl_biosample
      WHERE searchable @@ websearch_to_tsquery('english', 'liver')  AND ("c2m2"."ffl_biosample"."dcc_name" = 'UCSD Metabolomics Workbench') AND ("c2m2"."ffl_biosample"."project_local_id" = 'PR000667') AND ("c2m2"."ffl_biosample"."disease_name" is null) AND ("c2m2"."ffl_biosample"."ncbi_taxonomy_name" = 'Homo sapiens') AND ("c2m2"."ffl_biosample"."anatomy_name" = 'liver')
      ORDER BY rank DESC
  ),
  allres AS (
    SELECT 
      allres_full.dcc_name AS dcc_name,
      allres_full.dcc_abbreviation AS dcc_abbreviation,
      SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
      CASE WHEN allres_full.ncbi_taxonomy_name IS NULL THEN 'Unspecified' ELSE allres_full.ncbi_taxonomy_name END AS taxonomy_name,
      CASE WHEN allres_full.disease_name IS NULL THEN 'Unspecified' ELSE allres_full.disease_name END AS disease_name,
      CASE WHEN allres_full.anatomy_name IS NULL THEN 'Unspecified' ELSE allres_full.anatomy_name END AS anatomy_name,
      allres_full.project_name AS project_name,
      c2m2.project.description AS project_description,
      c2m2.anatomy.description AS anatomy_description,
      c2m2.disease.description AS disease_description,
      COUNT(*)::INT AS count,
      COUNT(DISTINCT biosample_local_id)::INT AS count_bios, 
      COUNT(DISTINCT subject_local_id)::INT AS count_sub, 
      COUNT(DISTINCT collection_local_id)::INT AS count_col
    FROM allres_full 
    LEFT JOIN c2m2.project ON (allres_full.project_id_namespace = c2m2.project.id_namespace AND 
      allres_full.project_local_id = c2m2.project.local_id) 
    LEFT JOIN c2m2.anatomy ON (allres_full.anatomy = c2m2.anatomy.id)
    LEFT JOIN c2m2.disease ON (allres_full.disease = c2m2.disease.id)
    GROUP BY dcc_name, dcc_abbreviation, dcc_short_label, taxonomy_name, disease_name, anatomy_name, project_name, project_description, anatomy_description, disease_description
    /*GROUP BY dcc_name, dcc_abbreviation, dcc_short_label, taxonomy_name, disease_name, anatomy_name, project_name, project_description, rank*/
    ORDER BY  dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name /*rank DESC*/
  ),
  biosamples_table as (
    SELECT DISTINCT
      allres_full.biosample_id_namespace,
      allres_full.biosample_local_id,
      allres_full.project_id_namespace,
      allres_full.project_local_id,
      allres_full.biosample_persistent_id,
      allres_full.biosample_creation_time,
      allres_full.sample_prep_method_name,
      allres_full.anatomy_name,
      allres_full.disease_name,
      allres_full.disease_association_type_name,
      allres_full.subject_id_namespace,
      allres_full.subject_local_id,
      allres_full.biosample_age_at_sampling,
      allres_full.gene_name,
      allres_full.substance_name

    FROM allres_full

  ),
   count_bios AS (
    select count(*)::int as count
      from biosamples_table
  ) SELECT
  (SELECT COALESCE(jsonb_agg(allres.*), '[]'::jsonb) AS records FROM allres), 
  (SELECT count FROM count_bios) as count_bios,
  (SELECT COALESCE(jsonb_agg(biosamples_table.*), '[]'::jsonb) FROM biosamples_table) AS biosamples_table
  ;

  WITH allres_full AS (
  SELECT DISTINCT c2m2.ffl_biosample.*,
    ts_rank_cd(searchable, websearch_to_tsquery('english', 'liver')) as "rank"
    FROM c2m2.ffl_biosample
    WHERE searchable @@ websearch_to_tsquery('english', 'liver') 
    /*ORDER BY rank DESC , dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name */

),
allres AS (
  SELECT 
    allres_full.rank AS rank,
    allres_full.dcc_name AS dcc_name,
    allres_full.dcc_abbreviation AS dcc_abbreviation,
    SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
    allres_full.project_local_id AS project_local_id,
    CASE WHEN allres_full.ncbi_taxonomy_name IS NULL THEN 'Unspecified' ELSE allres_full.ncbi_taxonomy_name END AS taxonomy_name,
    CASE WHEN allres_full.disease_name IS NULL THEN 'Unspecified' ELSE allres_full.disease_name END AS disease_name,
    CASE WHEN allres_full.anatomy_name IS NULL THEN 'Unspecified' ELSE allres_full.anatomy_name END AS anatomy_name,
    CASE WHEN allres_full.gene_name IS NULL THEN 'Unspecified' ELSE allres_full.gene_name END AS gene_name,
    allres_full.project_name AS project_name,
    c2m2.project.description AS project_description,
    COUNT(*)::INT AS count,
    COUNT(DISTINCT biosample_local_id)::INT AS count_bios, 
    COUNT(DISTINCT subject_local_id)::INT AS count_sub, 
    COUNT(DISTINCT collection_local_id)::INT AS count_col
  FROM allres_full 
  LEFT JOIN c2m2.project ON (allres_full.project_id_namespace = c2m2.project.id_namespace AND 
    allres_full.project_local_id = c2m2.project.local_id) 
  GROUP BY rank, dcc_name, dcc_abbreviation, dcc_short_label, project_local_id, taxonomy_name, disease_name, anatomy_name, gene_name, project_name, project_description 
  ORDER BY  rank DESC , disease_name, taxonomy_name, anatomy_name , gene_name, dcc_short_label, project_name 
),
allres_filtered AS (
  SELECT allres.*, 
  concat_ws('', '/data/c2m2/record_info?q=', 'liver', '&t=', 'dcc_name:', allres.dcc_name, '|', 'project_local_id:', allres.project_local_id,
  '|', 'disease_name:', allres.disease_name, '|', 'ncbi_taxonomy_name:', allres.taxonomy_name, '|', 'anatomy_name:', allres.anatomy_name '|', 'gene_name:', allres.gene_name) AS record_info_url
 FROM allres
  
) SELECT * from allres_filtered limit 5;