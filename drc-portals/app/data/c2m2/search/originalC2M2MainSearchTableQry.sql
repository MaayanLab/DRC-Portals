WITH 
    /**** allres_full AS (
      SELECT  c2m2.ffl_biosample_collection.*,
        ts_rank_cd(searchable, websearch_to_tsquery('english', ${searchParams.q})) as "rank"
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
        ORDER BY rank DESC,  dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, gene_name, 
        protein_name, compound_name, data_type_name  , subject_local_id, biosample_local_id, collection_local_id
        LIMIT ${allres_filtered_maxrow_limit}     
    ), ****/
    allres_exp AS (
      SELECT /* No DISTINCT */
        ts_rank_cd(searchable, websearch_to_tsquery('english', ${searchParams.q})) AS rank,
        allres_full.dcc_name AS dcc_name,
        allres_full.dcc_abbreviation AS dcc_abbreviation,
        SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
        COALESCE(allres_full.project_local_id, 'Unspecified') AS project_local_id,
        COALESCE(allres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name,
        SPLIT_PART(allres_full.subject_role_taxonomy_taxonomy_id, ':', 2) as taxonomy_id,
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
        COALESCE(allres_full.project_name,    concat_ws('', 'Dummy: Biosample/Collection(s) from ', 
          SPLIT_PART(allres_full.dcc_abbreviation, '_', 1)) ) AS project_name,
        /**** c2m2.project.description AS project_description, ****/
        allres_full.project_persistent_id as project_persistent_id
        /**** UNNEST(allres_full.bios_array) as biosample_local_id, ****/ /**** SLOWER BUT ACCURATE ****/
        /**** allres_full.bios_array as bios_array, ****/ /**** FASTER but later, count incorrect if biosample in several collection; See matching line in allres CTE ****/
        /**** allres_full.subject_local_id as subject_local_id, ****/
        /**** allres_full.collection_local_id as collection_local_id ****/
      /**** FROM c2m2.ffl_biosample_collection_cmp as allres_full ****/
      FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} as allres_full 
      
      /**** Mano: 2024/08/09: Trying to combine allres_full and allres into one CTE ****/  
      WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
        
      /* OFFSET ${super_offset} */
      /* LIMIT ${super_limit} */ /* ${allres_filtered_maxrow_limit}      */
    ),

    allres AS (
      SELECT DISTINCT 
        rank,
        dcc_name,
        dcc_abbreviation,
        dcc_short_label,
        project_local_id,
        taxonomy_name,
        taxonomy_id,
        disease_name,
        disease,
        anatomy_name,
        anatomy,
        gene_name,
        gene,
        protein_name,
        protein,
        compound_name,
        compound,
        data_type_name,
        data_type,
        assay_type_name,
        assay_type,
        project_name,
        project_persistent_id,
        /**** COUNT(*)::INT ****/ -99 AS count,
        /**** COUNT(DISTINCT biosample_local_id)::INT AS count_bios, ****/ /**** SLOWER BUT ACCURATE ****/
        /**** SUM(ARRAY_LENGTH(bios_array,1 ))::INT ****/ -99 AS count_bios, /**** Wrong count if same bios in several collections, e.g., for HMP ****/
        /**** COUNT(DISTINCT subject_local_id)::INT ****/ -99 AS count_sub, 
        /**** COUNT(DISTINCT collection_local_id)::INT ****/ -99 AS count_col
      FROM allres_exp 
              
      /**** GROUP BY rank, dcc_name, dcc_abbreviation, dcc_short_label, project_local_id, taxonomy_name, taxonomy_id, 
        disease_name, disease, anatomy_name, anatomy, gene_name, gene, protein_name, protein, compound_name, compound,
        data_type_name, data_type, assay_type_name, assay_type, project_name, project_persistent_id ****/
      ORDER BY rank DESC, dcc_short_label, project_name , disease_name, taxonomy_name, anatomy_name, gene_name, 
        protein_name, compound_name, data_type_name, assay_type_name
      OFFSET ${super_offset}
      LIMIT ${super_limit} /* ${allres_filtered_maxrow_limit}      */
    ),

    allres_filtered_count AS (SELECT count(*)::int as filtered_count FROM allres /*${filterClause}*/),
    allres_filtered AS (
      SELECT allres.*, 
      concat_ws('', '/data/c2m2/record_info?q=', ${searchParams.q}, '&t=', 'dcc_name:', allres.dcc_name, 
      '|', 'project_local_id:', allres.project_local_id, '|', 'disease_name:', allres.disease_name, 
      '|', 'ncbi_taxonomy_name:', allres.taxonomy_name, '|', 'anatomy_name:', allres.anatomy_name, 
      '|', 'gene_name:', allres.gene_name, '|', 'protein_name:', allres.protein_name,
      '|', 'compound_name:', allres.compound_name, '|', 'data_type_name:', allres.data_type_name, '|', 'assay_type_name:', allres.assay_type_name) AS record_info_url
      FROM allres
      /*${filterClause}*/
      /*LIMIT ${allres_filtered_maxrow_limit}*/
    ),
    allres_limited AS (
      SELECT *
      FROM allres_filtered
      OFFSET ${offset}
      LIMIT ${limit}   
    ),
    total_count as (
      select count(*)::int as count
      from allres_filtered
    )
    
    SELECT
    (SELECT COALESCE(jsonb_agg(allres_limited.*), '[]'::jsonb) AS records FROM allres_limited ), 
    (SELECT count FROM total_count) as count,
    (SELECT filtered_count FROM allres_filtered_count) as all_count
  