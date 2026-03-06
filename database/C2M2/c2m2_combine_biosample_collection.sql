set statement_timeout = 0;
set max_parallel_workers to 4;
/* DO NOT DELETE ANY OF THE COMMENTS */
/* 
run in psql as \i c2m2_combine_biosample_collection.sql or on bash prompt:
psql -h localhost -U drc -d drc -p [5432|5433] -a -f c2m2_combine_biosample_collection.sql
*/

--- This script combines c2m2.ffl_biosample and c2m2.ffl_collection to create c2m2.ffl_biosample_collection

-------------------------------------------------------------------------------
--- Union of c2m2.ffl_biosample and c2m2.ffl_collection to create c2m2.ffl_biosample_collection 
--- for ease of a single query

DROP TABLE IF EXISTS c2m2.ffl_biosample_collection;
CREATE TABLE c2m2.ffl_biosample_collection as (
    select distinct * from (
    (select * from c2m2.ffl_biosample /* limit 100000000 */ )
    union
    (select * from c2m2.ffl_collection /* limit 100000000 */ )
    )
    --- Mano: 2024/08/27: May be, preordering might make the query a bit faster
    ORDER BY dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, biofluid_name, gene_name, 
    protein_name, compound_name, data_type_name, assay_type_name, file_format_name, analysis_type_name,
    subject_race_name, subject_sex_name, subject_ethnicity_name, phenotype_name, ptm_site_type_name, ptm_type_name, ptm_subtype_name
);

COMMIT;

--- Mano: 2025/08/08: delete rows with dcc_name being null
DELETE FROM c2m2.ffl_biosample_collection WHERE dcc_name is null;

--- test
select count(*) from c2m2.ffl_biosample_collection;
select count(*) from c2m2.ffl_biosample;
select count(*) from c2m2.ffl_collection;

DO $$ 
BEGIN
    ALTER TABLE c2m2.ffl_biosample_collection ADD COLUMN pk_id serial PRIMARY KEY;

    DROP INDEX IF EXISTS ffl_biosample_collection_idx;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'ffl_biosample_collection' 
    AND indexname = 'ffl_biosample_collection_idx') THEN
        CREATE INDEX ffl_biosample_collection_idx ON c2m2.ffl_biosample_collection USING 
        gin(searchable);
    END IF;
END $$;

--- Create additional indexes for columns used in the where clause
--- CREATE INDEX idx_columns ON table_name (column1, column2);
--- /* These additional indexes don't seem to help with search much
--- # ChatGPT suggests: for indexing use gin with gin_trgm_ops as in: USING gin(colname gin_trgm_ops);
--- # This can be applied to columns of ffl tables as well.
DO $$ 
BEGIN
    DROP INDEX IF EXISTS ffl_biosample_collection_idx_many_cols;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'ffl_biosample_collection' 
    AND indexname = 'ffl_biosample_collection_idx_many_cols') THEN
        CREATE INDEX ffl_biosample_collection_idx_many_cols ON c2m2.ffl_biosample_collection USING 
        --- btree(dcc_name, project_local_id, ncbi_taxonomy_name, disease_name, anatomy_name, 
        ---    gene_name, protein_name, compound_name, data_type_name, assay_type_name);
        btree(dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, biofluid_name, gene_name, protein_name, 
        compound_name, data_type_name, assay_type_name, file_format_name, analysis_type_name,
        subject_race_name, subject_sex_name, subject_ethnicity_name, phenotype_name, ptm_site_type_name, ptm_type_name, ptm_subtype_name);
    END IF;
END $$;


-------------------------------------------------------
--- column-wise indexes
--- Enable pg_trgm extension for trigram-based indexing
--- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- Drop existing indexes if they already exist
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_dcc_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_project_local_id_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_dcc_abbreviation_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_project_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_disease_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_ncbi_taxonomy_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_anatomy_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_biofluid_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_gene_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_protein_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_compound_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_data_type_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_assay_type_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_file_format_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_analysis_type_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_subject_race_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_subject_sex_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_subject_ethnicity_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_phenotype_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_ptm_site_type_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_ptm_type_name_gin_idx;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_ptm_subtype_name_gin_idx;

-- Create new GIN trigram indexes for ILIKE-friendly text search
CREATE INDEX ffl_biosample_collection_dcc_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(dcc_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_project_local_id_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(project_local_id gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_dcc_abbreviation_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(dcc_abbreviation gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_project_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(project_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_disease_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(disease_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_ncbi_taxonomy_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(ncbi_taxonomy_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_anatomy_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(anatomy_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_biofluid_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(biofluid_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_gene_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(gene_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_protein_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(protein_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_compound_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(compound_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_data_type_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(data_type_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_assay_type_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(assay_type_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_file_format_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(file_format_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_analysis_type_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(analysis_type_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_subject_race_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(subject_race_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_subject_sex_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(subject_sex_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_subject_ethnicity_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(subject_ethnicity_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_phenotype_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(phenotype_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_ptm_site_type_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(ptm_site_type_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_ptm_type_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(ptm_type_name gin_trgm_ops);

CREATE INDEX ffl_biosample_collection_ptm_subtype_name_gin_idx 
    ON c2m2.ffl_biosample_collection USING gin(ptm_subtype_name gin_trgm_ops);
-------------------------------------------------------

-- ============================================================
-- BTREE Indexes for: c2m2.ffl_biosample_collection
-- Purpose: Accelerate ORDER BY and equality (=) lookups
-- Safe to use alongside GIN(trigram) indexes
-- ============================================================

-- Drop existing BTREE indexes if they exist
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_dcc_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_project_local_id_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_disease_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_ncbi_taxonomy_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_anatomy_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_biofluid_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_gene_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_protein_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_compound_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_data_type_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_assay_type_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_file_format_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_analysis_type_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_subject_race_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_subject_sex_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_subject_ethnicity_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_phenotype_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_ptm_site_type_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_ptm_type_name_btree;
DROP INDEX IF EXISTS c2m2.ffl_biosample_collection_idx_ptm_subtype_name_btree;

-- Create BTREE indexes (for ORDER BY and equality queries)
CREATE INDEX ffl_biosample_collection_idx_dcc_name_btree
  ON c2m2.ffl_biosample_collection (dcc_name);

CREATE INDEX ffl_biosample_collection_idx_project_local_id_btree
  ON c2m2.ffl_biosample_collection (project_local_id);

CREATE INDEX ffl_biosample_collection_idx_disease_name_btree
  ON c2m2.ffl_biosample_collection (disease_name);

CREATE INDEX ffl_biosample_collection_idx_ncbi_taxonomy_name_btree
  ON c2m2.ffl_biosample_collection (ncbi_taxonomy_name);

CREATE INDEX ffl_biosample_collection_idx_anatomy_name_btree
  ON c2m2.ffl_biosample_collection (anatomy_name);

CREATE INDEX ffl_biosample_collection_idx_biofluid_name_btree
  ON c2m2.ffl_biosample_collection (biofluid_name);

CREATE INDEX ffl_biosample_collection_idx_gene_name_btree
  ON c2m2.ffl_biosample_collection (gene_name);

CREATE INDEX ffl_biosample_collection_idx_protein_name_btree
  ON c2m2.ffl_biosample_collection (protein_name);

CREATE INDEX ffl_biosample_collection_idx_compound_name_btree
  ON c2m2.ffl_biosample_collection (compound_name);

CREATE INDEX ffl_biosample_collection_idx_data_type_name_btree
  ON c2m2.ffl_biosample_collection (data_type_name);

CREATE INDEX ffl_biosample_collection_idx_assay_type_name_btree
  ON c2m2.ffl_biosample_collection (assay_type_name);

CREATE INDEX ffl_biosample_collection_idx_file_format_name_btree
  ON c2m2.ffl_biosample_collection (file_format_name);

CREATE INDEX ffl_biosample_collection_idx_analysis_type_name_btree
  ON c2m2.ffl_biosample_collection (analysis_type_name);

CREATE INDEX ffl_biosample_collection_idx_subject_race_name_btree
  ON c2m2.ffl_biosample_collection (subject_race_name);

CREATE INDEX ffl_biosample_collection_idx_subject_sex_name_btree
  ON c2m2.ffl_biosample_collection (subject_sex_name);

CREATE INDEX ffl_biosample_collection_idx_subject_ethnicity_name_btree
  ON c2m2.ffl_biosample_collection (subject_ethnicity_name);

CREATE INDEX ffl_biosample_collection_idx_phenotype_name_btree
  ON c2m2.ffl_biosample_collection (phenotype_name);

CREATE INDEX ffl_biosample_collection_idx_ptm_site_type_name_btree
  ON c2m2.ffl_biosample_collection (ptm_site_type_name);

CREATE INDEX ffl_biosample_collection_idx_ptm_type_name_btree
  ON c2m2.ffl_biosample_collection (ptm_type_name);

CREATE INDEX ffl_biosample_collection_idx_ptm_subtype_name_btree
  ON c2m2.ffl_biosample_collection (ptm_subtype_name);

-- Update planner statistics
VACUUM ANALYZE c2m2.ffl_biosample_collection;
-- ============================================================

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
    select count(*) into count_b from c2m2.ffl_biosample;
    select count(*) into count_c from c2m2.ffl_collection;
    select count(*) into count_bc from c2m2.ffl_biosample_collection;
    RAISE NOTICE 'Count of row:';
    CALL print_counts(count_b, count_c, count_bc);

    --- Count w.r.t. a subset of columns: 
    --- This should be same in the two tables with/without file_format_name and analysis_type_name
    select count(*) into count_b from (select distinct dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, biofluid_name, gene_name, protein_name, 
        compound_name, data_type_name, assay_type_name from c2m2.ffl_biosample);
    select count(*) into count_c from (select distinct dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, biofluid_name, gene_name, protein_name, 
        compound_name, data_type_name, assay_type_name from c2m2.ffl_collection);
    select count(*) into count_bc from (select distinct dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, biofluid_name, gene_name, protein_name, 
        compound_name, data_type_name, assay_type_name from c2m2.ffl_biosample_collection);
    RAISE NOTICE 'Count of ditinct row w.r.t. a subset of columns:';
    CALL print_counts(count_b, count_c, count_bc);

    select count(*) into count_b FROM c2m2.ffl_biosample WHERE searchable @@ websearch_to_tsquery('english', 'liver');
    select count(*) into count_c FROM c2m2.ffl_collection WHERE searchable @@ websearch_to_tsquery('english', 'liver');
    select count(*) into count_bc FROM c2m2.ffl_biosample_collection WHERE searchable @@ websearch_to_tsquery('english', 'liver');
    RAISE NOTICE 'Count in searchable: searched for: liver';
    CALL print_counts(count_b, count_c, count_bc);
END $$;

\echo 'Counts with respect to id_namespace and dcc_name'
select project_id_namespace,count(*) from c2m2.ffl_biosample_collection group by project_id_namespace order by project_id_namespace;
select dcc_name,count(*) from c2m2.ffl_biosample_collection group by dcc_name order by dcc_name;

/*

select * FROM c2m2.ffl_biosample_collection WHERE searchable @@ websearch_to_tsquery('english', 'liver') limit 5;
select * FROM c2m2.ffl_biosample_collection WHERE searchable @@ websearch_to_tsquery('english', 'parkinson brain') limit 5;
*/

-------------------------------------------------------------------------------

--- To see table index names: select * from pg_indexes where schemaname = 'c2m2';
--- To list all column names of a table:
--- SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'c2m2' AND table_name = 'file';

