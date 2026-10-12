set statement_timeout = 0;
set max_parallel_workers to 4;

/* DO NOT DELETE ANY OF THE COMMENTS */
/* 
run in psql as \i c2m2_drop_searchable_from_file_table.sql or on bash prompt:
psql -h localhost -U drc -d drc -p [5432|5433] -a -f c2m2_drop_searchable_from_file_table.sql
*/

--- This script drops searchable column from the tables c2m2.file, c2m2.file_describes_biosample, etc, to save space
ALTER TABLE c2m2.file DROP COLUMN IF EXISTS searchable;
ALTER TABLE c2m2.file_describes_biosample DROP COLUMN IF EXISTS searchable;
ALTER TABLE c2m2.file_describes_subject DROP COLUMN IF EXISTS searchable;
ALTER TABLE c2m2.file_in_collection DROP COLUMN IF EXISTS searchable;

--- To reclaim space of the column, need to run vacuum full, but during that c2m2.file cannot be accessed
--- and extra space is needed
--- If it is a container, you may have to watch for other things e.g., 
--- if Kubernetes-based volume is in use, what is it size limit etc
--- On host, check free space using linux command:
--- df -h
--- OR
--- df -m

----------------------------- function -----------------------------
CREATE OR REPLACE FUNCTION get_table_size(
    schema_name text,
    table_name  text
)
RETURNS TABLE (
    table_size   text,
    indexes_size text,
    total_size   text
)
LANGUAGE sql
AS $$
    SELECT
        pg_size_pretty(pg_relation_size(format('%I.%I', schema_name, table_name)::regclass)),
        pg_size_pretty(pg_indexes_size(format('%I.%I', schema_name, table_name)::regclass)),
        pg_size_pretty(pg_total_relation_size(format('%I.%I', schema_name, table_name)::regclass));
$$;

----------------------------- function -----------------------------
CREATE OR REPLACE FUNCTION report_tables_size(
    label   text,
    schemas text[],
    tables  text[]
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    schema_name text;
    table_name  text;
    sizes       RECORD;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '%', label;
    RAISE NOTICE '========================================';

    FOREACH schema_name IN ARRAY schemas
    LOOP
        RAISE NOTICE 'Schema: %', schema_name;

        FOREACH table_name IN ARRAY tables
        LOOP
            SELECT *
            INTO sizes
            FROM get_table_size(schema_name, table_name);

            RAISE NOTICE '  Table: %', table_name;
            RAISE NOTICE '    Table size:   %', sizes.table_size;
            RAISE NOTICE '    Indexes size: %', sizes.indexes_size;
            RAISE NOTICE '    Total size:   %', sizes.total_size;
        END LOOP;
    END LOOP;
END $$;

\set schemas '{c2m2}'
\set tables '{file,file_describes_biosample,file_describes_subject,file_in_collection}'

SELECT report_tables_size(    'BEFORE VACUUM FULL',    :'schemas'::text[],    :'tables'::text[]);

VACUUM (FULL, ANALYZE, VERBOSE) c2m2.file;
VACUUM (FULL, ANALYZE, VERBOSE) c2m2.file_describes_biosample;
VACUUM (FULL, ANALYZE, VERBOSE) c2m2.file_describes_subject;
VACUUM (FULL, ANALYZE, VERBOSE) c2m2.file_in_collection;

SELECT report_tables_size(    'AFTER VACUUM FULL',    :'schemas'::text[],    :'tables'::text[]);

--- all done
set max_parallel_workers to 0;
