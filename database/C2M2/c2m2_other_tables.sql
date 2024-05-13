/* DO NOT DELETE ANY OF THE COMMENTS */
/* 
run in psql as \i c2m2_other_tables.sql or on bash prompt:
psql -h localhost -U drc -d drc -p [5432|5433] -a -f c2m2_other_tables.sql
*/

--- This script generates other tables from the basic c2m2 tables (or other tables)

-------------------------------------------------------------------------------
--- project_data_type
DROP TABLE IF EXISTS c2m2.project_data_type;
CREATE TABLE c2m2.project_data_type as (
select distinct
    tmp.project_id_namespace, tmp.project_local_id, c2m2.data_type.id as data_type_id, 
    c2m2.data_type.name as data_type_name, c2m2.data_type.description as data_type_description
from 
    (select distinct c2m2.file.project_id_namespace, c2m2.file.project_local_id,
    c2m2.file.data_type from 
    c2m2.project 
    left join c2m2.file
        on (c2m2.project.local_id = c2m2.file.project_local_id and
        c2m2.project.id_namespace = c2m2.file.project_id_namespace)
    ) tmp
    left join c2m2.data_type
        on (tmp.data_type = c2m2.data_type.id)
);

DO $$ 
BEGIN
    ALTER TABLE c2m2.project_data_type ADD COLUMN pk_id serial PRIMARY KEY;
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