set statement_timeout = 0;
/* Some basic queries to check time taken by parts of queries that produce different tables 
on the record_info pages.
*/

--- spread of counts over a combination of column values
--- From lincs and hubmap, THERE IS ONE COMBINATION WITH 1m+ AND 6m+ ROWS
drc=> select id_namespace, project_local_id, assay_type, data_type, count(*) from lincs.file group by id_namespace, project_local_id, assay_type, data_type;
drc=> select id_namespace, project_local_id, assay_type, data_type, count(*) from hubmap.file group by id_namespace, project_local_id, assay_type, data_type;

---------------------------------------------------- From FileProjTableComponent.tsx
--- Full query: takes 12-13 seconds, due to 2 scans on file
EXPLAIN (ANALYZE)
WITH allres_full AS (
                SELECT DISTINCT c2m2.ffl_biosample_collection.*,
                    ts_rank_cd(searchable, websearch_to_tsquery('english', 'liver')) as "rank"
                FROM c2m2.ffl_biosample_collection
                WHERE searchable @@ websearch_to_tsquery('english', 'liver')
                and ("c2m2"."ffl_biosample_collection"."dcc_name" ILIKE 'UCSD Metabolomics Workbench') AND 
                ("c2m2"."ffl_biosample_collection"."project_local_id" ILIKE 'PR000667') AND 
                ("c2m2"."ffl_biosample_collection"."disease_name" ILIKE 'steatotic liver disease') AND 
                ("c2m2"."ffl_biosample_collection"."ncbi_taxonomy_name" ILIKE 'Homo sapiens') AND 
                ("c2m2"."ffl_biosample_collection"."anatomy_name" ILIKE 'liver') AND 
                ("c2m2"."ffl_biosample_collection"."biofluid_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."gene_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."protein_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."compound_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."data_type_name" ILIKE 'Mass spectrometry data') AND 
                ("c2m2"."ffl_biosample_collection"."assay_type_name" ILIKE 'gas chromatography mass spectrometry assay')
                ORDER BY rank DESC
                /* OFFSET 0
                LIMIT 100 */
            ), 
            unique_info AS ( /* has extra fields, but OK in case needed later*/
            SELECT DISTINCT 
                allres_full.dcc_name,
                allres_full.dcc_abbreviation,
                allres_full.project_local_id, 
                allres_full.project_id_namespace,
                allres_full.ncbi_taxonomy_name as taxonomy_name,
                allres_full.subject_role_taxonomy_taxonomy_id as taxonomy_id,
                allres_full.disease_name,
                allres_full.disease,
                allres_full.anatomy_name,
                allres_full.anatomy,
                allres_full.biofluid_name,
                allres_full.biofluid,
                allres_full.gene, 
                allres_full.gene_name,
                allres_full.protein, 
                allres_full.protein_name,
                allres_full.substance_compound as compound, 
                allres_full.compound_name,
                allres_full.data_type_id AS data_type, 
                allres_full.data_type_name,
                allres_full.assay_type_id AS assay_type, /****/
                allres_full.assay_type_name /****/
            FROM allres_full
        ),
            /* create file_table_keycol */
            /* Mano: 2024/05/03: below using file_table_keycol instead of file_table (since file_count_limit is applied) */
             /* For some DCCs, e.g., hubmap, it may list many many files (> 1M) for some projects */
            file_table_keycol AS (
            SELECT DISTINCT 
                f.id_namespace,
                f.local_id,
                f.project_id_namespace,
                f.project_local_id
            FROM c2m2.file AS f
            INNER JOIN unique_info AS ui ON (f.project_local_id = ui.project_local_id 
                                    AND f.project_id_namespace = ui.project_id_namespace
                                    AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) /****/ /* 2024/03/07 match data type */
                                    AND ((f.assay_type = ui.assay_type) OR (f.assay_type IS NULL AND ui.assay_type IS NULL)) ) /****/
            ),
            file_table AS (
            SELECT DISTINCT 
                f.id_namespace,
                f.local_id,
                f.project_id_namespace, f.project_local_id, f.persistent_id, f.access_url, f.creation_time,
                f.size_in_bytes, f.uncompressed_size_in_bytes, f.sha256, f.md5, f.filename,
                f.file_format, ff.name AS compression_format,  f.mime_type, f.dbgap_study_id,
                ui.data_type_name, ui.assay_type_name, aty.name AS analysis_type_name /****/
                /**** dt.name AS data_type_name, at.name AS assay_type_name, aty.name AS analysis_type_name ****/
                FROM c2m2.file AS f INNER JOIN unique_info ui ON (f.project_local_id = ui.project_local_id 
                AND f.project_id_namespace = ui.project_id_namespace
                AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL))  /****/
                AND ((f.assay_type = ui.assay_type) OR (f.assay_type IS NULL AND ui.assay_type IS NULL)) ) /****/
                /**** LEFT JOIN c2m2.data_type AS dt ON f.data_type = dt.id
                LEFT JOIN c2m2.assay_type AS at ON f.assay_type = at.id ****/
                LEFT JOIN c2m2.analysis_type AS aty ON f.analysis_type = aty.id
                LEFT JOIN c2m2.file_format AS ff ON f.compression_format = ff.id
             limit 200000 
            )
            , 
            file_table_limited as (
            SELECT * 
            FROM file_table
            /* OFFSET 0 
            LIMIT 10 */
            ), /* Mano */
            count_file AS (
            select count(*)::int as count
                from file_table_keycol
            )
            SELECT
            (SELECT count FROM count_file) as count_file,
            (SELECT COALESCE(jsonb_agg(file_table_limited.*), '[]'::jsonb) FROM file_table_limited) AS file_table,
            (SELECT COALESCE(jsonb_agg(file_table.*), '[]'::jsonb) FROM file_table) AS file_table_full
            ;
/*         ["liver","liver","UCSD Metabolomics Workbench","PR000667","steatotic liver disease","Homo sapiens","liver","Mass spectrometry data",
         "gas chromatography mass spectrometry assay",0,200000,0,10]
*/

--- Top part of query: takes 6-7 seconds, due to scan on file
EXPLAIN (ANALYZE)
WITH allres_full AS (
                SELECT DISTINCT c2m2.ffl_biosample_collection.*,
                    ts_rank_cd(searchable, websearch_to_tsquery('english', 'liver')) as "rank"
                FROM c2m2.ffl_biosample_collection
                WHERE searchable @@ websearch_to_tsquery('english', 'liver')
                and ("c2m2"."ffl_biosample_collection"."dcc_name" ILIKE 'UCSD Metabolomics Workbench') AND 
                ("c2m2"."ffl_biosample_collection"."project_local_id" ILIKE 'PR000667') AND 
                ("c2m2"."ffl_biosample_collection"."disease_name" ILIKE 'steatotic liver disease') AND 
                ("c2m2"."ffl_biosample_collection"."ncbi_taxonomy_name" ILIKE 'Homo sapiens') AND 
                ("c2m2"."ffl_biosample_collection"."anatomy_name" ILIKE 'liver') AND 
                ("c2m2"."ffl_biosample_collection"."biofluid_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."gene_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."protein_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."compound_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."data_type_name" ILIKE 'Mass spectrometry data') AND 
                ("c2m2"."ffl_biosample_collection"."assay_type_name" ILIKE 'gas chromatography mass spectrometry assay')
                ORDER BY rank DESC
                /* OFFSET 0
                LIMIT 100 */
            ), 
            unique_info AS ( /* has extra fields, but OK in case needed later*/
            SELECT DISTINCT 
                allres_full.dcc_name,
                allres_full.dcc_abbreviation,
                allres_full.project_local_id, 
                allres_full.project_id_namespace,
                allres_full.ncbi_taxonomy_name as taxonomy_name,
                allres_full.subject_role_taxonomy_taxonomy_id as taxonomy_id,
                allres_full.disease_name,
                allres_full.disease,
                allres_full.anatomy_name,
                allres_full.anatomy,
                allres_full.biofluid_name,
                allres_full.biofluid,
                allres_full.gene, 
                allres_full.gene_name,
                allres_full.protein, 
                allres_full.protein_name,
                allres_full.substance_compound as compound, 
                allres_full.compound_name,
                allres_full.data_type_id AS data_type, 
                allres_full.data_type_name,
                allres_full.assay_type_id AS assay_type, /****/
                allres_full.assay_type_name /****/
            FROM allres_full
        ),
            /* create file_table_keycol */
            /* Mano: 2024/05/03: below using file_table_keycol instead of file_table (since file_count_limit is applied) */
             /* For some DCCs, e.g., hubmap, it may list many many files (> 1M) for some projects */
            file_table_keycol AS (
            SELECT DISTINCT 
                f.id_namespace,
                f.local_id,
                f.project_id_namespace,
                f.project_local_id
            FROM c2m2.file AS f
            INNER JOIN unique_info AS ui ON (f.project_local_id = ui.project_local_id 
                                    AND f.project_id_namespace = ui.project_id_namespace
                                    AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) /****/ /* 2024/03/07 match data type */
                                    AND ((f.assay_type = ui.assay_type) OR (f.assay_type IS NULL AND ui.assay_type IS NULL)) ) /****/
            ),
            count_file AS (
            select count(*)::int as count
                from file_table_keycol
            )
            SELECT
            (SELECT count FROM count_file) as count_file
            ;

--- Exclude even file_table_keycol
EXPLAIN (ANALYZE)
WITH allres_full AS (
                SELECT DISTINCT c2m2.ffl_biosample_collection.*,
                    ts_rank_cd(searchable, websearch_to_tsquery('english', 'liver')) as "rank"
                FROM c2m2.ffl_biosample_collection
                WHERE searchable @@ websearch_to_tsquery('english', 'liver')
                and ("c2m2"."ffl_biosample_collection"."dcc_name" ILIKE 'UCSD Metabolomics Workbench') AND 
                ("c2m2"."ffl_biosample_collection"."project_local_id" ILIKE 'PR000667') AND 
                ("c2m2"."ffl_biosample_collection"."disease_name" ILIKE 'steatotic liver disease') AND 
                ("c2m2"."ffl_biosample_collection"."ncbi_taxonomy_name" ILIKE 'Homo sapiens') AND 
                ("c2m2"."ffl_biosample_collection"."anatomy_name" ILIKE 'liver') AND 
                ("c2m2"."ffl_biosample_collection"."biofluid_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."gene_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."protein_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."compound_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."data_type_name" ILIKE 'Mass spectrometry data') AND 
                ("c2m2"."ffl_biosample_collection"."assay_type_name" ILIKE 'gas chromatography mass spectrometry assay')
                ORDER BY rank DESC
                /* OFFSET 0
                LIMIT 100 */
            ), 
            unique_info AS ( /* has extra fields, but OK in case needed later*/
            SELECT DISTINCT 
                allres_full.dcc_name,
                allres_full.dcc_abbreviation,
                allres_full.project_local_id, 
                allres_full.project_id_namespace,
                allres_full.ncbi_taxonomy_name as taxonomy_name,
                allres_full.subject_role_taxonomy_taxonomy_id as taxonomy_id,
                allres_full.disease_name,
                allres_full.disease,
                allres_full.anatomy_name,
                allres_full.anatomy,
                allres_full.biofluid_name,
                allres_full.biofluid,
                allres_full.gene, 
                allres_full.gene_name,
                allres_full.protein, 
                allres_full.protein_name,
                allres_full.substance_compound as compound, 
                allres_full.compound_name,
                allres_full.data_type_id AS data_type, 
                allres_full.data_type_name,
                allres_full.assay_type_id AS assay_type, /****/
                allres_full.assay_type_name /****/
            FROM allres_full
        ),
            count_ui AS (
            select count(*)::int as count
                from unique_info
            )
            SELECT
            (SELECT count FROM count_ui) as count_ui
            ;

---------------------------------------------------------------------------------------------------------
--- Modified version
--- Top part of query: takes 6-7 seconds, due to scan on file
EXPLAIN (ANALYZE)
WITH allres_full AS (
                SELECT DISTINCT c2m2.ffl_biosample_collection.*,
                    ts_rank_cd(searchable, websearch_to_tsquery('english', 'liver')) as "rank"
                FROM c2m2.ffl_biosample_collection
                WHERE searchable @@ websearch_to_tsquery('english', 'liver')
                and ("c2m2"."ffl_biosample_collection"."dcc_name" ILIKE 'UCSD Metabolomics Workbench') AND 
                ("c2m2"."ffl_biosample_collection"."project_local_id" ILIKE 'PR000667') AND 
                ("c2m2"."ffl_biosample_collection"."disease_name" ILIKE 'steatotic liver disease') AND 
                ("c2m2"."ffl_biosample_collection"."ncbi_taxonomy_name" ILIKE 'Homo sapiens') AND 
                ("c2m2"."ffl_biosample_collection"."anatomy_name" ILIKE 'liver') AND 
                ("c2m2"."ffl_biosample_collection"."biofluid_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."gene_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."protein_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."compound_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."data_type_name" ILIKE 'Mass spectrometry data') AND 
                ("c2m2"."ffl_biosample_collection"."assay_type_name" ILIKE 'gas chromatography mass spectrometry assay')
                ORDER BY rank DESC
                /* OFFSET 0
                LIMIT 100 */
            ), 
            unique_info AS ( /* has extra fields, but OK in case needed later*/
            SELECT DISTINCT 
                allres_full.dcc_name,
                allres_full.dcc_abbreviation,
                allres_full.project_local_id, 
                allres_full.project_id_namespace,
                allres_full.ncbi_taxonomy_name as taxonomy_name,
                allres_full.subject_role_taxonomy_taxonomy_id as taxonomy_id,
                allres_full.disease_name,
                allres_full.disease,
                allres_full.anatomy_name,
                allres_full.anatomy,
                allres_full.biofluid_name,
                allres_full.biofluid,
                allres_full.gene, 
                allres_full.gene_name,
                allres_full.protein, 
                allres_full.protein_name,
                allres_full.substance_compound as compound, 
                allres_full.compound_name,
                allres_full.data_type_id AS data_type, 
                allres_full.data_type_name,
                allres_full.assay_type_id AS assay_type, /****/
                allres_full.assay_type_name /****/
            FROM allres_full
        ),
            /* create file_table_keycol */
            /* Mano: 2024/05/03: below using file_table_keycol instead of file_table (since file_count_limit is applied) */
             /* For some DCCs, e.g., hubmap, it may list many many files (> 1M) for some projects */
            file_table_keycol AS (
            /* SELECT DISTINCT f.id_namespace, f.local_id, f.project_id_namespace, f.project_local_id */
            /* Make a subtable with all columns and use that later since just a simple scan through the file table takes long */
            SELECT DISTINCT f.*
            FROM c2m2.file AS f
            INNER JOIN unique_info AS ui ON (f.project_local_id = ui.project_local_id 
                                    AND f.project_id_namespace = ui.project_id_namespace
                                    AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) /****/ /* 2024/03/07 match data type */
                                    AND ((f.assay_type = ui.assay_type) OR (f.assay_type IS NULL AND ui.assay_type IS NULL)) ) /****/
            ),
            file_table AS (
            SELECT DISTINCT 
                f.id_namespace,
                f.local_id,
                f.project_id_namespace, f.project_local_id, f.persistent_id, f.access_url, f.creation_time,
                f.size_in_bytes, f.uncompressed_size_in_bytes, f.sha256, f.md5, f.filename,
                f.file_format, ff.name AS compression_format,  f.mime_type, f.dbgap_study_id,
                ui.data_type_name, ui.assay_type_name, aty.name AS analysis_type_name /****/
                FROM /* c2m2.file */ file_table_keycol AS f INNER JOIN unique_info ui ON (f.project_local_id = ui.project_local_id 
                AND f.project_id_namespace = ui.project_id_namespace
                AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL))  /****/
                AND ((f.assay_type = ui.assay_type) OR (f.assay_type IS NULL AND ui.assay_type IS NULL)) ) /****/
                LEFT JOIN c2m2.analysis_type AS aty ON f.analysis_type = aty.id
                LEFT JOIN c2m2.file_format AS ff ON f.compression_format = ff.id
             limit 200000 
            )
            , 
            file_table_limited as (
            SELECT * 
            FROM file_table
            /* OFFSET 0 
            LIMIT 10 */
            ), /* Mano */
            count_file AS (
            select count(*)::int as count
                from file_table_keycol
            )
            SELECT
            (SELECT count FROM count_file) as count_file,
            (SELECT COALESCE(jsonb_agg(file_table_limited.*), '[]'::jsonb) FROM file_table_limited) AS file_table,
            (SELECT COALESCE(jsonb_agg(file_table.*), '[]'::jsonb) FROM file_table) AS file_table_full
            ;

--- Top part of query: exclude file_table
EXPLAIN (ANALYZE)
WITH allres_full AS (
                SELECT DISTINCT c2m2.ffl_biosample_collection.*,
                    ts_rank_cd(searchable, websearch_to_tsquery('english', 'liver')) as "rank"
                FROM c2m2.ffl_biosample_collection
                WHERE searchable @@ websearch_to_tsquery('english', 'liver')
                and ("c2m2"."ffl_biosample_collection"."dcc_name" ILIKE 'UCSD Metabolomics Workbench') AND 
                ("c2m2"."ffl_biosample_collection"."project_local_id" ILIKE 'PR000667') AND 
                ("c2m2"."ffl_biosample_collection"."disease_name" ILIKE 'steatotic liver disease') AND 
                ("c2m2"."ffl_biosample_collection"."ncbi_taxonomy_name" ILIKE 'Homo sapiens') AND 
                ("c2m2"."ffl_biosample_collection"."anatomy_name" ILIKE 'liver') AND 
                ("c2m2"."ffl_biosample_collection"."biofluid_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."gene_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."protein_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."compound_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."data_type_name" ILIKE 'Mass spectrometry data') AND 
                ("c2m2"."ffl_biosample_collection"."assay_type_name" ILIKE 'gas chromatography mass spectrometry assay')
                ORDER BY rank DESC
                /* OFFSET 0
                LIMIT 100 */
            ), 
            unique_info AS ( /* has extra fields, but OK in case needed later*/
            SELECT DISTINCT 
                allres_full.dcc_name,
                allres_full.dcc_abbreviation,
                allres_full.project_local_id, 
                allres_full.project_id_namespace,
                allres_full.ncbi_taxonomy_name as taxonomy_name,
                allres_full.subject_role_taxonomy_taxonomy_id as taxonomy_id,
                allres_full.disease_name,
                allres_full.disease,
                allres_full.anatomy_name,
                allres_full.anatomy,
                allres_full.biofluid_name,
                allres_full.biofluid,
                allres_full.gene, 
                allres_full.gene_name,
                allres_full.protein, 
                allres_full.protein_name,
                allres_full.substance_compound as compound, 
                allres_full.compound_name,
                allres_full.data_type_id AS data_type, 
                allres_full.data_type_name,
                allres_full.assay_type_id AS assay_type, /****/
                allres_full.assay_type_name /****/
            FROM allres_full
        ),
            /* create file_table_keycol */
            /* Mano: 2024/05/03: below using file_table_keycol instead of file_table (since file_count_limit is applied) */
             /* For some DCCs, e.g., hubmap, it may list many many files (> 1M) for some projects */
            file_table_keycol AS (
            /* SELECT DISTINCT f.id_namespace, f.local_id, f.project_id_namespace, f.project_local_id */
            /* Make a subtable with all columns and use that later since just a simple scan through the file table takes long */
            SELECT DISTINCT f.*
            FROM c2m2.file AS f
            INNER JOIN unique_info AS ui ON (f.project_local_id = ui.project_local_id 
                                    AND f.project_id_namespace = ui.project_id_namespace
                                    AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) /****/ /* 2024/03/07 match data type */
                                    AND ((f.assay_type = ui.assay_type) OR (f.assay_type IS NULL AND ui.assay_type IS NULL)) ) /****/
            ),
            count_file AS (
            select count(*)::int as count
                from file_table_keycol
            )
            SELECT
            (SELECT count FROM count_file) as count_file
            ;

--- Part 1 of the CTE
--- Wil ILIKE on all takes about 100-106ms; with = on some, it takes 84-90 ms, wil = on all, 75-80
--- Go with ILIKE due to its flexibility
EXPLAIN (ANALYZE)
WITH allres_full AS (
                SELECT DISTINCT c2m2.ffl_biosample_collection.*,
                    ts_rank_cd(searchable, websearch_to_tsquery('english', 'liver')) as "rank"
                FROM c2m2.ffl_biosample_collection
                WHERE searchable @@ websearch_to_tsquery('english', 'liver')
                and ("c2m2"."ffl_biosample_collection"."dcc_name" = 'UCSD Metabolomics Workbench') AND 
                ("c2m2"."ffl_biosample_collection"."project_local_id" = 'PR000667') AND 
                ("c2m2"."ffl_biosample_collection"."disease_name" = 'steatotic liver disease') AND 
                ("c2m2"."ffl_biosample_collection"."ncbi_taxonomy_name" = 'Homo sapiens') AND 
                ("c2m2"."ffl_biosample_collection"."anatomy_name" = 'liver') AND 
                ("c2m2"."ffl_biosample_collection"."biofluid_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."gene_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."protein_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."compound_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."data_type_name" = 'Mass spectrometry data') AND 
                ("c2m2"."ffl_biosample_collection"."assay_type_name" = 'gas chromatography mass spectrometry assay')
                ORDER BY rank DESC
                /* OFFSET 0
                LIMIT 100 */
            ) 
            SELECT
            (SELECT count(*) FROM allres_full) as count_allres_full
            ;

--- Exclude even file_table_keycol, include only some columns in unique_info
--- excluding columns in unique_info doesn't make much difference (~ 5-10 ms)
EXPLAIN (ANALYZE)
WITH allres_full AS (
                SELECT DISTINCT c2m2.ffl_biosample_collection.*,
                    ts_rank_cd(searchable, websearch_to_tsquery('english', 'liver')) as "rank"
                FROM c2m2.ffl_biosample_collection
                WHERE searchable @@ websearch_to_tsquery('english', 'liver')
                and ("c2m2"."ffl_biosample_collection"."dcc_name" ILIKE 'UCSD Metabolomics Workbench') AND 
                ("c2m2"."ffl_biosample_collection"."project_local_id" ILIKE 'PR000667') AND 
                ("c2m2"."ffl_biosample_collection"."disease_name" ILIKE 'steatotic liver disease') AND 
                ("c2m2"."ffl_biosample_collection"."ncbi_taxonomy_name" ILIKE 'Homo sapiens') AND 
                ("c2m2"."ffl_biosample_collection"."anatomy_name" ILIKE 'liver') AND 
                ("c2m2"."ffl_biosample_collection"."biofluid_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."gene_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."protein_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."compound_name" is null) AND 
                ("c2m2"."ffl_biosample_collection"."data_type_name" ILIKE 'Mass spectrometry data') AND 
                ("c2m2"."ffl_biosample_collection"."assay_type_name" ILIKE 'gas chromatography mass spectrometry assay')
                ORDER BY rank DESC
                /* OFFSET 0
                LIMIT 100 */
            ), 
            unique_info AS ( /* has extra fields, but OK in case needed later*/
            SELECT DISTINCT 
                allres_full.project_local_id, 
                allres_full.project_id_namespace,
                allres_full.data_type_id AS data_type, 
                allres_full.data_type_name,
                allres_full.assay_type_id AS assay_type, /****/
                allres_full.assay_type_name /****/
            FROM allres_full
        ),
            count_ui AS (
            select count(*)::int as count
                from unique_info
            )
            SELECT
            (SELECT count FROM count_ui) as count_ui
            ;

------------------------------------ from fileBiosamplesComponent.stx ----------------------
--- Full query after optimization
--- Example from SPARC
--- ["liver","liver","Stimulating Peripheral Activity to Relieve Conditions","OT2OD023864","Mus musculus",
--- "celiac ganglion","experimental measurement","electrophysiology assay",200000,0,10]
--- Takes about 135-140 ms
EXPLAIN (ANALYZE)
WITH allres_full AS (
                SELECT DISTINCT c2m2.ffl_biosample_collection.*,
                    ts_rank_cd(searchable, websearch_to_tsquery('english', 'liver')) as "rank"
                FROM c2m2.ffl_biosample_collection
                WHERE searchable @@ websearch_to_tsquery('english', 'liver')
                and ("c2m2"."ffl_biosample_collection"."dcc_name" ILIKE 'Stimulating Peripheral Activity to Relieve Conditions') 
                AND ("c2m2"."ffl_biosample_collection"."project_local_id" ILIKE 'OT2OD023864') 
                AND ("c2m2"."ffl_biosample_collection"."disease_name" is null) 
                AND ("c2m2"."ffl_biosample_collection"."ncbi_taxonomy_name" ILIKE 'Mus musculus') 
                AND ("c2m2"."ffl_biosample_collection"."anatomy_name" ILIKE 'celiac ganglion') 
                AND ("c2m2"."ffl_biosample_collection"."biofluid_name" is null) 
                AND ("c2m2"."ffl_biosample_collection"."gene_name" is null) 
                AND ("c2m2"."ffl_biosample_collection"."protein_name" is null) 
                AND ("c2m2"."ffl_biosample_collection"."compound_name" is null) 
                AND ("c2m2"."ffl_biosample_collection"."data_type_name" ILIKE 'experimental measurement') 
                AND ("c2m2"."ffl_biosample_collection"."assay_type_name" ILIKE 'electrophysiology assay')
                ORDER BY rank DESC
            ), 
            unique_info AS ( /* has extra fields, but OK in case needed later*/
            SELECT DISTINCT 
                allres_full.dcc_name,
                allres_full.dcc_abbreviation,
                allres_full.project_local_id, 
                allres_full.project_id_namespace,
                allres_full.ncbi_taxonomy_name as taxonomy_name,
                allres_full.subject_role_taxonomy_taxonomy_id as taxonomy_id,
                allres_full.disease_name,
                allres_full.disease,
                allres_full.anatomy_name,
                allres_full.anatomy,
                allres_full.biofluid_name,
                allres_full.biofluid,
                allres_full.gene, 
                allres_full.gene_name,
                allres_full.protein, 
                allres_full.protein_name,
                allres_full.substance_compound as compound, 
                allres_full.compound_name,
                allres_full.data_type_id AS data_type, 
                allres_full.data_type_name,
                allres_full.assay_type_id AS assay_type, /****/
                allres_full.assay_type_name /****/
            FROM allres_full
            ),
            bios_info AS (
                SELECT DISTINCT 
                  allres_full.biosample_id_namespace,
                  allres_full.biosample_local_id
                FROM allres_full
            ), /* 2024/03/07 */
            file_table_keycol AS (                
                /* SELECT DISTINCT f.id_namespace, f.local_id, f.project_id_namespace, f.project_local_id */
                SELECT DISTINCT f.*
                FROM c2m2.file AS f
                INNER JOIN unique_info AS ui ON (f.project_local_id = ui.project_local_id 
                                        AND f.project_id_namespace = ui.project_id_namespace
                                        AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) /****/ /* 2024/03/07 match data type */
                                        AND ((f.assay_type = ui.assay_type) OR (f.assay_type IS NULL AND ui.assay_type IS NULL)) ) /****/
            ),
            file_bios_table_keycol AS (
                SELECT DISTINCT fdb.*,
                f.project_id_namespace, f.project_local_id, f.persistent_id, f.access_url, f.creation_time,
                f.size_in_bytes, f.uncompressed_size_in_bytes, f.sha256, f.md5, f.filename,
                f.file_format, ff.name AS compression_format,  f.mime_type, f.dbgap_study_id,
                ui.data_type_name, ui.assay_type_name, aty.name AS analysis_type_name /****/
                FROM c2m2.file_describes_biosample fdb
                /**? INNER JOIN file_table_keycol ftk ON (ftk.local_id = fdb.file_local_id AND ftk.id_namespace = fdb.file_id_namespace) */
                INNER JOIN file_table_keycol f ON (f.local_id = fdb.file_local_id AND f.id_namespace = fdb.file_id_namespace)
                INNER JOIN bios_info ON 
                (bios_info.biosample_local_id = fdb.biosample_local_id AND bios_info.biosample_id_namespace = fdb.biosample_id_namespace) /* 2024/03/07 match biosample */
                /**? NOT NEEDED--dueto-file_table_keycol INNER JOIN c2m2.file AS f ON (f.local_id = ftk.local_id AND f.id_namespace = ftk.id_namespace) */
                INNER JOIN unique_info ui ON 
                ((f.project_local_id = ui.project_local_id)
                    AND (f.project_id_namespace = ui.project_id_namespace)
                    AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) /****/
                    AND ((f.assay_type = ui.assay_type) OR (f.assay_type IS NULL AND ui.assay_type IS NULL)) ) /****/
                LEFT JOIN c2m2.analysis_type AS aty ON f.analysis_type = aty.id
                LEFT JOIN c2m2.file_format AS ff ON f.compression_format = ff.id
                ), /* Mano */
                file_bios_table AS (
                    SELECT * from file_bios_table_keycol
                    limit 200000    
                ),
                file_bios_table_limited as (
                    SELECT * 
                    FROM file_bios_table
                    OFFSET 0
                    LIMIT 10
                ), /* Mano */
                count_file_bios AS (
                    select count(*)::int as count
                        from file_bios_table_keycol
                ) /* Mano */ 
                SELECT
                (SELECT count FROM count_file_bios) as count_file_bios,
                (SELECT COALESCE(jsonb_agg(file_bios_table_limited.*), '[]'::jsonb) FROM file_bios_table_limited) AS file_bios_table,
                (SELECT COALESCE(jsonb_agg(file_bios_table.*), '[]'::jsonb) FROM file_bios_table) AS file_bios_table_full
;

--- Before full optimization, with file_table_keycol used twice in join: not much different, more by just 5-10 ms
EXPLAIN (ANALYZE)
WITH allres_full AS (
                SELECT DISTINCT c2m2.ffl_biosample_collection.*,
                    ts_rank_cd(searchable, websearch_to_tsquery('english', 'liver')) as "rank"
                FROM c2m2.ffl_biosample_collection
                WHERE searchable @@ websearch_to_tsquery('english', 'liver')
                and ("c2m2"."ffl_biosample_collection"."dcc_name" ILIKE 'Stimulating Peripheral Activity to Relieve Conditions') 
                AND ("c2m2"."ffl_biosample_collection"."project_local_id" ILIKE 'OT2OD023864') 
                AND ("c2m2"."ffl_biosample_collection"."disease_name" is null) 
                AND ("c2m2"."ffl_biosample_collection"."ncbi_taxonomy_name" ILIKE 'Mus musculus') 
                AND ("c2m2"."ffl_biosample_collection"."anatomy_name" ILIKE 'celiac ganglion') 
                AND ("c2m2"."ffl_biosample_collection"."biofluid_name" is null) 
                AND ("c2m2"."ffl_biosample_collection"."gene_name" is null) 
                AND ("c2m2"."ffl_biosample_collection"."protein_name" is null) 
                AND ("c2m2"."ffl_biosample_collection"."compound_name" is null) 
                AND ("c2m2"."ffl_biosample_collection"."data_type_name" ILIKE 'experimental measurement') 
                AND ("c2m2"."ffl_biosample_collection"."assay_type_name" ILIKE 'electrophysiology assay')
                ORDER BY rank DESC
            ), 
            unique_info AS ( /* has extra fields, but OK in case needed later*/
            SELECT DISTINCT 
                allres_full.dcc_name,
                allres_full.dcc_abbreviation,
                allres_full.project_local_id, 
                allres_full.project_id_namespace,
                allres_full.ncbi_taxonomy_name as taxonomy_name,
                allres_full.subject_role_taxonomy_taxonomy_id as taxonomy_id,
                allres_full.disease_name,
                allres_full.disease,
                allres_full.anatomy_name,
                allres_full.anatomy,
                allres_full.biofluid_name,
                allres_full.biofluid,
                allres_full.gene, 
                allres_full.gene_name,
                allres_full.protein, 
                allres_full.protein_name,
                allres_full.substance_compound as compound, 
                allres_full.compound_name,
                allres_full.data_type_id AS data_type, 
                allres_full.data_type_name,
                allres_full.assay_type_id AS assay_type, /****/
                allres_full.assay_type_name /****/
            FROM allres_full
            ),
            bios_info AS (
                SELECT DISTINCT 
                  allres_full.biosample_id_namespace,
                  allres_full.biosample_local_id
                FROM allres_full
            ), /* 2024/03/07 */
            file_table_keycol AS (                
                /* SELECT DISTINCT f.id_namespace, f.local_id, f.project_id_namespace, f.project_local_id */
                SELECT DISTINCT f.*
                FROM c2m2.file AS f
                INNER JOIN unique_info AS ui ON (f.project_local_id = ui.project_local_id 
                                        AND f.project_id_namespace = ui.project_id_namespace
                                        AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) /****/ /* 2024/03/07 match data type */
                                        AND ((f.assay_type = ui.assay_type) OR (f.assay_type IS NULL AND ui.assay_type IS NULL)) ) /****/
            ),
            file_bios_table_keycol AS (
                SELECT DISTINCT fdb.*,
                f.project_id_namespace, f.project_local_id, f.persistent_id, f.access_url, f.creation_time,
                f.size_in_bytes, f.uncompressed_size_in_bytes, f.sha256, f.md5, f.filename,
                f.file_format, ff.name AS compression_format,  f.mime_type, f.dbgap_study_id,
                ui.data_type_name, ui.assay_type_name, aty.name AS analysis_type_name /****/
                FROM c2m2.file_describes_biosample fdb
                INNER JOIN file_table_keycol ftk ON (ftk.local_id = fdb.file_local_id AND ftk.id_namespace = fdb.file_id_namespace)
                INNER JOIN bios_info ON 
                (bios_info.biosample_local_id = fdb.biosample_local_id AND bios_info.biosample_id_namespace = fdb.biosample_id_namespace) /* 2024/03/07 match biosample */
                INNER JOIN /* c2m2.file */ file_table_keycol AS f ON (f.local_id = ftk.local_id AND f.id_namespace = ftk.id_namespace)
                INNER JOIN unique_info ui ON 
                ((f.project_local_id = ui.project_local_id)
                    AND (f.project_id_namespace = ui.project_id_namespace)
                    AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) /****/
                    AND ((f.assay_type = ui.assay_type) OR (f.assay_type IS NULL AND ui.assay_type IS NULL)) ) /****/
                LEFT JOIN c2m2.analysis_type AS aty ON f.analysis_type = aty.id
                LEFT JOIN c2m2.file_format AS ff ON f.compression_format = ff.id
                ), /* Mano */
                file_bios_table AS (
                    SELECT * from file_bios_table_keycol
                    limit 200000    
                ),
                file_bios_table_limited as (
                    SELECT * 
                    FROM file_bios_table
                    OFFSET 0
                    LIMIT 10
                ), /* Mano */
                count_file_bios AS (
                    select count(*)::int as count
                        from file_bios_table_keycol
                ) /* Mano */ 
                SELECT
                (SELECT count FROM count_file_bios) as count_file_bios,
                (SELECT COALESCE(jsonb_agg(file_bios_table_limited.*), '[]'::jsonb) FROM file_bios_table_limited) AS file_bios_table,
                (SELECT COALESCE(jsonb_agg(file_bios_table.*), '[]'::jsonb) FROM file_bios_table) AS file_bios_table_full
;

--- Before full optimization, with join with c2m2.file: almost no difference, may be 5-10 ms slower
EXPLAIN (ANALYZE)
WITH allres_full AS (
                SELECT DISTINCT c2m2.ffl_biosample_collection.*,
                    ts_rank_cd(searchable, websearch_to_tsquery('english', 'liver')) as "rank"
                FROM c2m2.ffl_biosample_collection
                WHERE searchable @@ websearch_to_tsquery('english', 'liver')
                and ("c2m2"."ffl_biosample_collection"."dcc_name" ILIKE 'Stimulating Peripheral Activity to Relieve Conditions') 
                AND ("c2m2"."ffl_biosample_collection"."project_local_id" ILIKE 'OT2OD023864') 
                AND ("c2m2"."ffl_biosample_collection"."disease_name" is null) 
                AND ("c2m2"."ffl_biosample_collection"."ncbi_taxonomy_name" ILIKE 'Mus musculus') 
                AND ("c2m2"."ffl_biosample_collection"."anatomy_name" ILIKE 'celiac ganglion') 
                AND ("c2m2"."ffl_biosample_collection"."biofluid_name" is null) 
                AND ("c2m2"."ffl_biosample_collection"."gene_name" is null) 
                AND ("c2m2"."ffl_biosample_collection"."protein_name" is null) 
                AND ("c2m2"."ffl_biosample_collection"."compound_name" is null) 
                AND ("c2m2"."ffl_biosample_collection"."data_type_name" ILIKE 'experimental measurement') 
                AND ("c2m2"."ffl_biosample_collection"."assay_type_name" ILIKE 'electrophysiology assay')
                ORDER BY rank DESC
            ), 
            unique_info AS ( /* has extra fields, but OK in case needed later*/
            SELECT DISTINCT 
                allres_full.dcc_name,
                allres_full.dcc_abbreviation,
                allres_full.project_local_id, 
                allres_full.project_id_namespace,
                allres_full.ncbi_taxonomy_name as taxonomy_name,
                allres_full.subject_role_taxonomy_taxonomy_id as taxonomy_id,
                allres_full.disease_name,
                allres_full.disease,
                allres_full.anatomy_name,
                allres_full.anatomy,
                allres_full.biofluid_name,
                allres_full.biofluid,
                allres_full.gene, 
                allres_full.gene_name,
                allres_full.protein, 
                allres_full.protein_name,
                allres_full.substance_compound as compound, 
                allres_full.compound_name,
                allres_full.data_type_id AS data_type, 
                allres_full.data_type_name,
                allres_full.assay_type_id AS assay_type, /****/
                allres_full.assay_type_name /****/
            FROM allres_full
            ),
            bios_info AS (
                SELECT DISTINCT 
                  allres_full.biosample_id_namespace,
                  allres_full.biosample_local_id
                FROM allres_full
            ), /* 2024/03/07 */
            file_table_keycol AS (                
                /* SELECT DISTINCT f.id_namespace, f.local_id, f.project_id_namespace, f.project_local_id */
                SELECT DISTINCT f.*
                FROM c2m2.file AS f
                INNER JOIN unique_info AS ui ON (f.project_local_id = ui.project_local_id 
                                        AND f.project_id_namespace = ui.project_id_namespace
                                        AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) /****/ /* 2024/03/07 match data type */
                                        AND ((f.assay_type = ui.assay_type) OR (f.assay_type IS NULL AND ui.assay_type IS NULL)) ) /****/
            ),
            file_bios_table_keycol AS (
                SELECT DISTINCT fdb.*,
                f.project_id_namespace, f.project_local_id, f.persistent_id, f.access_url, f.creation_time,
                f.size_in_bytes, f.uncompressed_size_in_bytes, f.sha256, f.md5, f.filename,
                f.file_format, ff.name AS compression_format,  f.mime_type, f.dbgap_study_id,
                ui.data_type_name, ui.assay_type_name, aty.name AS analysis_type_name /****/
                FROM c2m2.file_describes_biosample fdb
                INNER JOIN file_table_keycol ftk ON (ftk.local_id = fdb.file_local_id AND ftk.id_namespace = fdb.file_id_namespace)
                INNER JOIN bios_info ON 
                (bios_info.biosample_local_id = fdb.biosample_local_id AND bios_info.biosample_id_namespace = fdb.biosample_id_namespace) /* 2024/03/07 match biosample */
                INNER JOIN c2m2.file AS f ON (f.local_id = ftk.local_id AND f.id_namespace = ftk.id_namespace)
                INNER JOIN unique_info ui ON 
                ((f.project_local_id = ui.project_local_id)
                    AND (f.project_id_namespace = ui.project_id_namespace)
                    AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) /****/
                    AND ((f.assay_type = ui.assay_type) OR (f.assay_type IS NULL AND ui.assay_type IS NULL)) ) /****/
                LEFT JOIN c2m2.analysis_type AS aty ON f.analysis_type = aty.id
                LEFT JOIN c2m2.file_format AS ff ON f.compression_format = ff.id
                ), /* Mano */
                file_bios_table AS (
                    SELECT * from file_bios_table_keycol
                    limit 200000    
                ),
                file_bios_table_limited as (
                    SELECT * 
                    FROM file_bios_table
                    OFFSET 0
                    LIMIT 10
                ), /* Mano */
                count_file_bios AS (
                    select count(*)::int as count
                        from file_bios_table_keycol
                ) /* Mano */ 
                SELECT
                (SELECT count FROM count_file_bios) as count_file_bios,
                (SELECT COALESCE(jsonb_agg(file_bios_table_limited.*), '[]'::jsonb) FROM file_bios_table_limited) AS file_bios_table,
                (SELECT COALESCE(jsonb_agg(file_bios_table.*), '[]'::jsonb) FROM file_bios_table) AS file_bios_table_full
;
