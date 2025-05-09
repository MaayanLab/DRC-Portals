set statement_timeout = 0;
/* DO NOT DELETE ANY OF THE COMMENTS */
/* 
run in psql as \i c2m2_other_tables.sql or on bash prompt:
psql -h localhost -U drc -d drc -p [5432|5433] -a -f c2m2_other_tables.sql
*/

--- This script generates other tables from the basic c2m2 tables (or other tables)

--- effect of analysis_type on count
--- select count(*) FROM (select distinct project_id_namespace, project_local_id, data_type, assaY_type, file_format FROM c2m2.file);
--- select count(*) FROM (select distinct project_id_namespace, project_local_id, data_type, assaY_type, file_format, analysis_type FROM c2m2.file);
-------------------------------------------------------------------------------
--- project_data_type: include assay_type as well since both data_type and assay_type are coming from the
--- c2m2.file table.
--- To include analysis_type from c2m2.file and use it in ffl tables and in query filters.
DROP TABLE IF EXISTS c2m2.project_data_type;
CREATE TABLE c2m2.project_data_type as (
select distinct
    tmp.project_id_namespace, tmp.project_local_id, 
    c2m2.data_type.id as data_type_id, c2m2.data_type.name as data_type_name, 
    c2m2.data_type.description as data_type_description,
    c2m2.assay_type.id as assay_type_id, c2m2.assay_type.name as assay_type_name, 
    c2m2.assay_type.description as assay_type_description,
    c2m2.file_format.id as file_format_id, c2m2.file_format.name as file_format_name, 
    c2m2.file_format.description as file_format_description,
    c2m2.analysis_type.id as analysis_type_id, c2m2.analysis_type.name as analysis_type_name, 
    c2m2.analysis_type.description as analysis_type_description
from 
    (select distinct project_id_namespace, project_local_id, data_type, assay_type, file_format, analysis_type from c2m2.file
    ) tmp
    left join c2m2.data_type
        on (tmp.data_type = c2m2.data_type.id)
    left join c2m2.assay_type
        on (tmp.assay_type = c2m2.assay_type.id)
    left join c2m2.file_format
        on (tmp.file_format = c2m2.file_format.id)
    left join c2m2.analysis_type
        on (tmp.analysis_type = c2m2.analysis_type.id)
);

DO $$ 
BEGIN
    ALTER TABLE c2m2.project_data_type ADD COLUMN pk_id serial PRIMARY KEY;
END $$;

-------------------------------------------------------------------------------
--- c2m2.project_data_type table: index on project_id_namespace, project_local_id, assay_type, data_type, etc
DO $$
BEGIN
    DROP INDEX IF EXISTS project_data_type_idx;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'project_data_type'
    AND indexname = 'project_data_type_idx') THEN
        CREATE INDEX project_data_type_idx ON c2m2.project_data_type USING
        btree(project_id_namespace, project_local_id, assay_type_id, data_type_id, analysis_type_id, file_format_id);
    END IF;
END $$;

--- test
select count(*) from c2m2.project_data_type;

-------------------------------------------------------------------------------
--- Union of file_describes_collection and file_in_collection for ease of a single query
--- Specify column names explicitly


DROP TABLE IF EXISTS c2m2.file_describes_in_collection;
CREATE TABLE c2m2.file_describes_in_collection as (
    select distinct * from (
    (select file_id_namespace, file_local_id, collection_id_namespace, collection_local_id from c2m2.file_describes_collection)
    union
    (select file_id_namespace, file_local_id, collection_id_namespace, collection_local_id from c2m2.file_in_collection)
    )
);

DO $$ 
BEGIN
    ALTER TABLE c2m2.file_describes_in_collection ADD COLUMN pk_id serial PRIMARY KEY;

    DROP INDEX IF EXISTS file_describes_in_collection_idx;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'file_describes_in_collection' 
    AND indexname = 'file_describes_in_collection_idx') THEN
        CREATE INDEX file_describes_in_collection_idx ON c2m2.file_describes_in_collection USING 
        btree(file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);
    END IF;
END $$;

--- test:
select count(*) from c2m2.file_describes_collection;
select count(*) from c2m2.file_in_collection;
select count(*) from c2m2.file_describes_in_collection;
--- Is there overlap
--- RAISE NOTICE 'Count of same/overlapping records between file_describes_collection and file_in_collection';
select count(*) from (select c2m2.file_describes_collection.file_id_namespace, c2m2.file_describes_collection.file_local_id, 
c2m2.file_describes_collection.collection_id_namespace, c2m2.file_describes_collection.collection_local_id 
from c2m2.file_describes_collection, c2m2.file_in_collection
where
c2m2.file_describes_collection.file_id_namespace = c2m2.file_in_collection.file_id_namespace AND
c2m2.file_describes_collection.file_local_id = c2m2.file_in_collection.file_local_id AND
c2m2.file_describes_collection.collection_id_namespace = c2m2.file_in_collection.collection_id_namespace AND
c2m2.file_describes_collection.collection_local_id = c2m2.file_in_collection.collection_local_id);

-------------------------------------------------------------------------------


--- To see table index names: select * from pg_indexes where schemaname = 'c2m2';
--- To list all column names of a table:
--- SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'c2m2' AND table_name = 'file';

/* General test:
Are there projects with more than one data_type

select * from (select project_id_namespace, project_local_id, count(distinct data_type_id) as 
    count_data_type from c2m2.project_data_type group by project_id_namespace, project_local_id) where count_data_type > 1;

select count(*) from c2m2.project;

*/
