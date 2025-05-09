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
    protein_name, compound_name, data_type_name, assay_type_name, file_format_name, analysis_type_name    
);

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
DO $$ 
BEGIN
    DROP INDEX IF EXISTS ffl_biosample_collection_idx_many_cols;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'ffl_biosample_collection' 
    AND indexname = 'ffl_biosample_collection_idx_many_cols') THEN
        CREATE INDEX ffl_biosample_collection_idx_many_cols ON c2m2.ffl_biosample_collection USING 
        --- btree(dcc_name, project_local_id, ncbi_taxonomy_name, disease_name, anatomy_name, 
        ---    gene_name, protein_name, compound_name, data_type_name, assay_type_name);
        btree(dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, biofluid_name, gene_name, protein_name, 
        compound_name, data_type_name, assay_type_name, file_format_name, analysis_type_name);
    END IF;
END $$;

set max_parallel_workers to 0;

--- test:

select count(*) from c2m2.ffl_biosample_collection;
select count(*) from c2m2.ffl_biosample;
select count(*) from c2m2.ffl_collection;

select project_id_namespace,count(*) from c2m2.ffl_biosample_collection group by project_id_namespace;
select dcc_name,count(*) from c2m2.ffl_biosample_collection group by dcc_name;

--- Count w.r.t. a subset of columns: 
--- This should be same in the two tables with/without file_format_name and analysis_type_name
select count(*) from (select distinct dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, biofluid_name, gene_name, protein_name, 
    compound_name, data_type_name, assay_type_name from c2m2.ffl_biosample);
select count(*) from (select distinct dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, biofluid_name, gene_name, protein_name, 
    compound_name, data_type_name, assay_type_name from c2m2.ffl_collection);
select count(*) from (select distinct dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, biofluid_name, gene_name, protein_name, 
    compound_name, data_type_name, assay_type_name from c2m2.ffl_biosample_collection);

select count(*) FROM c2m2.ffl_biosample_collection WHERE searchable @@ websearch_to_tsquery('english', 'liver');
select count(*) FROM c2m2.ffl_biosample WHERE searchable @@ websearch_to_tsquery('english', 'liver');
select count(*) FROM c2m2.ffl_collection WHERE searchable @@ websearch_to_tsquery('english', 'liver');

/*

select * FROM c2m2.ffl_biosample_collection WHERE searchable @@ websearch_to_tsquery('english', 'liver') limit 5;
select * FROM c2m2.ffl_biosample_collection WHERE searchable @@ websearch_to_tsquery('english', 'parkinson brain') limit 5;
*/

-------------------------------------------------------------------------------

--- To see table index names: select * from pg_indexes where schemaname = 'c2m2';
--- To list all column names of a table:
--- SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'c2m2' AND table_name = 'file';

