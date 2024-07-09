WITH allres_full AS (
          SELECT DISTINCT c2m2.ffl_biosample_collection.*,
            ts_rank_cd(searchable, websearch_to_tsquery('english', ${searchParams.q})) as "rank"
            FROM c2m2.ffl_biosample_collection
            WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q}) 
            /*ORDER BY rank DESC , dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name */        
        ),
        allres AS (
          SELECT 
            allres_full.rank AS rank,
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
            c2m2.project.description AS project_description,
            allres_full.project_persistent_id as project_persistent_id,
            COUNT(*)::INT AS count,
            COUNT(DISTINCT biosample_local_id)::INT AS count_bios, 
            COUNT(DISTINCT subject_local_id)::INT AS count_sub, 
            COUNT(DISTINCT collection_local_id)::INT AS count_col
          FROM allres_full 
          LEFT JOIN c2m2.project ON (allres_full.project_id_namespace = c2m2.project.id_namespace AND 
            allres_full.project_local_id = c2m2.project.local_id) 
          /* LEFT JOIN c2m2.project_data_type ON (allres_full.project_id_namespace = c2m2.project_data_type.project_id_namespace AND 
            allres_full.project_local_id = c2m2.project_data_type.project_local_id) keep for some time */
          GROUP BY rank, dcc_name, dcc_abbreviation, dcc_short_label, project_local_id, taxonomy_name, taxonomy_id, 
            disease_name, disease, anatomy_name, anatomy, gene_name, gene, protein_name, protein, compound_name, compound,
            data_type_name, data_type, project_name, project_description, allres_full.project_persistent_id 
          ORDER BY rank DESC, dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name, gene_name, 
            protein_name, compound_name, data_type_name
        ),
        allres_filtered_count AS (SELECT count(*)::int as filtered_count FROM allres ${filterClause}),
        allres_filtered AS (
          SELECT allres.*, 
          concat_ws('', '/data/c2m2/record_info?q=', ${searchParams.q}, '&t=', 'dcc_name:', allres.dcc_name, 
          '|', 'project_local_id:', allres.project_local_id, '|', 'disease_name:', allres.disease_name, 
          '|', 'ncbi_taxonomy_name:', allres.taxonomy_name, '|', 'anatomy_name:', allres.anatomy_name, 
          '|', 'gene_name:', allres.gene_name, '|', 'protein_name:', allres.protein_name,
          '|', 'compound_name:', allres.compound_name, '|', 'data_type_name:', allres.data_type_name) AS record_info_url
          FROM allres
          ${filterClause}
          LIMIT ${allres_filtered_maxrow_limit}
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
        ),
        dcc_name_count AS (
          SELECT dcc_name, dcc_short_label, COUNT(*) AS count 
          FROM ${cascading_tablename}
          GROUP BY dcc_name, dcc_short_label ORDER BY dcc_short_label, dcc_name
        ),
        taxonomy_name_count AS (
          SELECT taxonomy_name, COUNT(*) AS count
          /* SELECT CASE WHEN taxonomy_name IS NULL THEN 'Unspecified' ELSE taxonomy_name END AS taxonomy_name, COUNT(*) AS count */
          FROM ${cascading_tablename}
          GROUP BY taxonomy_name ORDER BY taxonomy_name
        ),
        disease_name_count AS (
          SELECT disease_name, COUNT(*) AS count
          /* SELECT CASE WHEN disease_name IS NULL THEN 'Unspecified' ELSE disease_name END AS disease_name, COUNT(*) AS count */
          FROM ${cascading_tablename}
          GROUP BY disease_name ORDER BY disease_name
        ),
        anatomy_name_count AS (
          SELECT anatomy_name, COUNT(*) AS count
          /* SELECT CASE WHEN anatomy_name IS NULL THEN 'Unspecified' ELSE anatomy_name END AS anatomy_name, COUNT(*) AS count */
          FROM ${cascading_tablename} 
          GROUP BY anatomy_name ORDER BY anatomy_name
        ),
        project_name_count AS (
          SELECT project_name, COUNT(*) AS count 
          FROM ${cascading_tablename}
          GROUP BY project_name ORDER BY project_name
        ),
        gene_name_count AS (
          SELECT gene_name, COUNT(*) AS count 
          FROM ${cascading_tablename}
          GROUP BY gene_name ORDER BY gene_name
        ),
        protein_name_count AS (
          SELECT protein_name, COUNT(*) AS count 
          FROM ${cascading_tablename}
          GROUP BY protein_name ORDER BY protein_name
        ),
        compound_name_count AS (
          SELECT compound_name, COUNT(*) AS count 
          FROM ${cascading_tablename}
          GROUP BY compound_name ORDER BY compound_name
        ),
        data_type_name_count AS (
          SELECT data_type_name, COUNT(*) AS count 
          FROM ${cascading_tablename}
          GROUP BY data_type_name ORDER BY data_type_name
        )
        
        SELECT
        (SELECT COALESCE(jsonb_agg(allres_filtered.*), '[]'::jsonb) AS records_full FROM allres_filtered ), 
        (SELECT COALESCE(jsonb_agg(allres_limited.*), '[]'::jsonb) AS records FROM allres_limited ), 
        (SELECT count FROM total_count) as count,
        (SELECT filtered_count FROM allres_filtered_count) as all_count,
        (SELECT COALESCE(jsonb_agg(dcc_name_count.*), '[]'::jsonb) FROM dcc_name_count) AS dcc_filters,
          (SELECT COALESCE(jsonb_agg(taxonomy_name_count.*), '[]'::jsonb) FROM taxonomy_name_count) AS taxonomy_filters,
          (SELECT COALESCE(jsonb_agg(disease_name_count.*), '[]'::jsonb) FROM disease_name_count) AS disease_filters,
          (SELECT COALESCE(jsonb_agg(anatomy_name_count.*), '[]'::jsonb) FROM anatomy_name_count) AS anatomy_filters,
          (SELECT COALESCE(jsonb_agg(project_name_count.*), '[]'::jsonb) FROM project_name_count) AS project_filters,
          (SELECT COALESCE(jsonb_agg(gene_name_count.*), '[]'::jsonb) FROM gene_name_count) AS gene_filters,
          (SELECT COALESCE(jsonb_agg(protein_name_count.*), '[]'::jsonb) FROM protein_name_count) AS protein_filters,
          (SELECT COALESCE(jsonb_agg(compound_name_count.*), '[]'::jsonb) FROM compound_name_count) AS compound_filters,
          (SELECT COALESCE(jsonb_agg(data_type_name_count.*), '[]'::jsonb) FROM data_type_name_count) AS data_type_filters
          
          