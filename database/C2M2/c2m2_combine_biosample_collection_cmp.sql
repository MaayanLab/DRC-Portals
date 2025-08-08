set statement_timeout = 0;
set max_parallel_workers to 4;
/* DO NOT DELETE ANY OF THE COMMENTS */
/* 
run in psql as \i c2m2_combine_biosample_collection_cmp.sql or on bash prompt:
psql -h localhost -U drc -d drc -p [5432|5433] -a -f c2m2_combine_biosample_collection_cmp.sql
*/

--- This script combines c2m2.ffl_biosample_cmp and c2m2.ffl_collection_cmp to create c2m2.ffl_biosample_collection_cmp

-------------------------------------------------------------------------------
--- Union of c2m2.ffl_biosample_cmp and c2m2.ffl_collection_cmp to create c2m2.ffl_biosample_collection_cmp 
--- for ease of a single query

DROP TABLE IF EXISTS c2m2.ffl_biosample_collection_cmp;
CREATE TABLE c2m2.ffl_biosample_collection_cmp as (
    select distinct * from (
    (select * from c2m2.ffl_biosample_cmp /* limit 100000000 */ )
    union
    (select * from c2m2.ffl_collection_cmp /* limit 100000000 */ )
    )
    --- Mano: 2024/08/27: May be, preordering might make the query a bit faster
    ORDER BY dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, biofluid_name, gene_name, 
    protein_name, compound_name, data_type_name, assay_type_name, file_format_name, analysis_type_name,
    subject_race_name, subject_sex_name, subject_ethnicity_name, phenotype_name, ptm_site_type_name, ptm_type_name, ptm_subtype_name
);

COMMIT;

--- test
select count(*) from c2m2.ffl_biosample_collection_cmp;
select count(*) from c2m2.ffl_biosample_cmp;
select count(*) from c2m2.ffl_collection_cmp;

DO $$ 
BEGIN
    ALTER TABLE c2m2.ffl_biosample_collection_cmp ADD COLUMN pk_id serial PRIMARY KEY;

    DROP INDEX IF EXISTS ffl_biosample_collection_cmp_idx;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'ffl_biosample_collection_cmp' 
    AND indexname = 'ffl_biosample_collection_cmp_idx') THEN
        CREATE INDEX ffl_biosample_collection_cmp_idx ON c2m2.ffl_biosample_collection_cmp USING 
        gin(searchable);
    END IF;
END $$;

--- Create additional indexes for columns used in the where clause
--- CREATE INDEX idx_columns ON table_name (column1, column2);
--- /* These additional indexes don't seem to help with search much
DO $$ 
BEGIN
    DROP INDEX IF EXISTS ffl_biosample_collection_cmp_idx_many_cols;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'ffl_biosample_collection_cmp' 
    AND indexname = 'ffl_biosample_collection_cmp_idx_many_cols') THEN
        CREATE INDEX ffl_biosample_collection_cmp_idx_many_cols ON c2m2.ffl_biosample_collection_cmp USING 
        --- btree(dcc_name, project_local_id, ncbi_taxonomy_name, disease_name, anatomy_name, 
        ---    gene_name, protein_name, compound_name, data_type_name, assay_type_name);
        btree(dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, biofluid_name, gene_name, protein_name, 
        compound_name, data_type_name, assay_type_name, file_format_name, analysis_type_name,
        subject_race_name, subject_sex_name, subject_ethnicity_name, phenotype_name, ptm_site_type_name, ptm_type_name, ptm_subtype_name);
    END IF;
END $$;

set max_parallel_workers to 0;

--- test again:

\echo '==================== Cross-checking ===================='

--- Function for some count printing:
CREATE OR REPLACE PROCEDURE print_counts(
    count_b BIGINT,
    count_c BIGINT,
    count_bc BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE NOTICE 'count_b: %', count_b;
    RAISE NOTICE 'count_c: %', count_c;
    RAISE NOTICE 'count_bc: %', count_bc;
    RAISE NOTICE 'count_bc - (count_b + count_c): %', count_bc - (count_b + count_c);
END;
$$;

DO $$
DECLARE 
  count_b bigint;
  count_c bigint;
  count_bc bigint;
BEGIN
    select count(*) into count_b from c2m2.ffl_biosample_cmp;
    select count(*) into count_c from c2m2.ffl_collection_cmp;
    select count(*) into count_bc from c2m2.ffl_biosample_collection_cmp;
    RAISE NOTICE 'Count of row:';
    CALL print_counts(count_b, count_c, count_bc);

    --- Count w.r.t. a subset of columns: 
    --- This should be same in the two tables with/without file_format_name and analysis_type_name
    select count(*) into count_b from (select distinct dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, biofluid_name, gene_name, protein_name, 
        compound_name, data_type_name, assay_type_name from c2m2.ffl_biosample_cmp);
    select count(*) into count_c from (select distinct dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, biofluid_name, gene_name, protein_name, 
        compound_name, data_type_name, assay_type_name from c2m2.ffl_collection_cmp);
    select count(*) into count_bc from (select distinct dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, biofluid_name, gene_name, protein_name, 
        compound_name, data_type_name, assay_type_name from c2m2.ffl_biosample_collection_cmp);
    RAISE NOTICE 'Count of ditinct row w.r.t. a subset of columns:';
    CALL print_counts(count_b, count_c, count_bc);

    select count(*) into count_b FROM c2m2.ffl_biosample_cmp WHERE searchable @@ websearch_to_tsquery('english', 'liver');
    select count(*) into count_c FROM c2m2.ffl_collection_cmp WHERE searchable @@ websearch_to_tsquery('english', 'liver');
    select count(*) into count_bc FROM c2m2.ffl_biosample_collection_cmp WHERE searchable @@ websearch_to_tsquery('english', 'liver');
    RAISE NOTICE 'Count in searchable: searched for: liver';
    CALL print_counts(count_b, count_c, count_bc);
END $$;

\echo 'Counts with respect to id_namespace and dcc_name'
select project_id_namespace,count(*) from c2m2.ffl_biosample_collection_cmp group by project_id_namespace order by project_id_namespace;
select dcc_name,count(*) from c2m2.ffl_biosample_collection_cmp group by dcc_name order by dcc_name;

/*
select * FROM c2m2.ffl_biosample_collection_cmp WHERE searchable @@ websearch_to_tsquery('english', 'liver') limit 5;
select * FROM c2m2.ffl_biosample_collection_cmp WHERE searchable @@ websearch_to_tsquery('english', 'parkinson brain') limit 5;
*/

-------------------------------------------------------------------------------

--- To see table index names: select * from pg_indexes where schemaname = 'c2m2';
--- To list all column names of a table:
--- SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'c2m2' AND table_name = 'file';

