set statement_timeout = 0;
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
        btree(dcc_name, project_local_id, ncbi_taxonomy_name, disease_name, anatomy_name, 
            gene_name, protein_name, compound_name, data_type_name);
    END IF;
END $$;

--- test:

select count(*) from c2m2.ffl_biosample_collection;
select count(*) from c2m2.ffl_biosample;
select count(*) from c2m2.ffl_collection;

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

