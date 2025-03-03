WITH 
    allres AS (
      SELECT /* No DISTINCT */
        ts_rank_cd(searchable, websearch_to_tsquery('english', 'parkinson')) AS rank,
        allres_full.dcc_name AS dcc_name,
        allres_full.dcc_abbreviation AS dcc_abbreviation,
        SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
        COALESCE(allres_full.project_local_id, 'Unspecified') AS project_local_id,
        COALESCE(allres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name,
        SPLIT_PART(allres_full.subject_role_taxonomy_taxonomy_id, ':', 2) AS taxonomy_id,
        COALESCE(allres_full.disease_name, 'Unspecified') AS disease_name,
        REPLACE(allres_full.disease, ':', '_') AS disease,
        COALESCE(allres_full.anatomy_name, 'Unspecified') AS anatomy_name,
        REPLACE(allres_full.anatomy, ':', '_') AS anatomy,
        COALESCE(allres_full.gene_name, 'Unspecified') AS gene_name,
        allres_full.gene AS gene,
        COALESCE(allres_full.protein_name, 'Unspecified') AS protein_name,
        allres_full.protein AS protein,
        COALESCE(allres_full.compound_name, 'Unspecified') AS compound_name,
        allres_full.substance_compound AS compound,
        COALESCE(allres_full.data_type_name, 'Unspecified') AS data_type_name,
        REPLACE(allres_full.data_type_id, ':', '_') AS data_type,
        COALESCE(allres_full.assay_type_name, 'Unspecified') AS assay_type_name,
        REPLACE(allres_full.assay_type_id, ':', '_') AS assay_type,
        COALESCE(allres_full.project_name, concat_ws('', 'Dummy: Biosample/Collection(s) from ', 
          SPLIT_PART(allres_full.dcc_abbreviation, '_', 1)) ) AS project_name,
        allres_full.project_persistent_id AS project_persistent_id
      FROM c2m2."ffl_biosample_collection_cmp" AS allres_full 
      WHERE searchable @@ websearch_to_tsquery('english', 'parkinson')
      ORDER BY rank DESC, dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name, gene_name, 
        protein_name, compound_name, data_type_name, assay_type_name
      OFFSET 140
      LIMIT 100
    ),
    allres_filtered AS (
      SELECT allres.*, 
      concat_ws('', '/data/c2m2/record_info?q=', 'parkinson', '&t=', 'dcc_name:', allres.dcc_name, 
      '|project_local_id:', allres.project_local_id, 
      '|disease_name:', allres.disease_name, 
      '|ncbi_taxonomy_name:', allres.taxonomy_name, 
      '|anatomy_name:', allres.anatomy_name, 
      '|gene_name:', allres.gene_name, 
      '|protein_name:', allres.protein_name,
      '|compound_name:', allres.compound_name, 
      '|data_type_name:', allres.data_type_name, 
      '|assay_type_name:', allres.assay_type_name) AS record_info_url
      FROM allres
    ),
    filtered_count AS (
        SELECT count(*)::int AS count
        FROM allres_filtered
    ),
    allres_limited AS (
      SELECT *
      FROM allres_filtered
      LIMIT 10
    )
SELECT allres_limited.*, (SELECT count FROM filtered_count) AS filtered_count
FROM allres_limited;


