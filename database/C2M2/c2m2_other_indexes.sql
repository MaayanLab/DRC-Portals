set statement_timeout = 0;
/* DO NOT DELETE ANY OF THE COMMENTS */
/* 
run in psql as \i c2m2_other_indexes.sql or on bash prompt:
psql -h localhost -U drc -d drc -p [5432|5433] -a -f c2m2_other_indexes.sql
*/

--- This script generates other other indexes on some of the tables for faster search

-------------------------------------------------------------------------------
--- c2m2.file table: index on project_id_namespace, project_local_id, assay_type, data_type
DO $$ 
BEGIN
    DROP INDEX IF EXISTS file_proj_assay_data_idx;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'file' 
    AND indexname = 'file_proj_assay_data_idx') THEN
        CREATE INDEX file_proj_assay_data_idx ON c2m2.file USING 
        btree(project_id_namespace, project_local_id, assay_type, data_type);
    END IF;
END $$;

