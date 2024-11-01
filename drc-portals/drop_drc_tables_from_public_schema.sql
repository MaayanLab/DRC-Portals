/*

The code below is generated using the command, in an existing db drc
drc=# SELECT 'DROP TABLE IF EXISTS public."' || table_name || '" CASCADE;' as cmd FROM information_schema.tables WHERE lower(table_schema) = 'public';

The code below deletes the relevant tables from the public schema so that a new clean ingest can be done 
without deleting the public schema itself.

Run using psql command:
psql -h [localhost|server] -U [drc|drcadmin] -d drc  -p [5432|5433|5434] -a -f drop_drc_tables_from_public_schema.sql; 
or if already connected to pg db, e.g., via:
psql -h [localhost|server] -U [drc|drcadmin] -d drc  -p [5432|5433|5434] 
then on the psql prompt, give the command:
\i drop_drc_tables_from_public_schema.sql;

# These commands could also be listed as a migration, e.g., 00000000000000_drop_tables/migration.sql, then the above 
# psql commands need not be run and just 
# "npx prisma migrate deploy" below will be enough: 
# Issue: The underlying table for model `_prisma_migrations` does not exist. 
#So, do not include these commands in a migration for now.

*/

DROP TABLE IF EXISTS public."_prisma_migrations" CASCADE;
DROP TABLE IF EXISTS public."VerificationToken" CASCADE;
DROP TABLE IF EXISTS public."Account" CASCADE;
DROP TABLE IF EXISTS public."Session" CASCADE;
DROP TABLE IF EXISTS public."dcc_outreach" CASCADE;
DROP TABLE IF EXISTS public."dcc_publications" CASCADE;
DROP TABLE IF EXISTS public."outreach" CASCADE;
DROP TABLE IF EXISTS public."User" CASCADE;
DROP TABLE IF EXISTS public."publications" CASCADE;
DROP TABLE IF EXISTS public."dcc_assets" CASCADE;
DROP TABLE IF EXISTS public."dccs" CASCADE;
DROP TABLE IF EXISTS public."tools" CASCADE;
DROP TABLE IF EXISTS public."gene_set_node" CASCADE;
DROP TABLE IF EXISTS public."gene_set_library_node" CASCADE;
DROP TABLE IF EXISTS public."c2m2_datapackage" CASCADE;
DROP TABLE IF EXISTS public."c2m2_file_node" CASCADE;
DROP TABLE IF EXISTS public."node" CASCADE;
DROP TABLE IF EXISTS public."entity_node" CASCADE;
DROP TABLE IF EXISTS public."kg_relation_node" CASCADE;
DROP TABLE IF EXISTS public."kg_assertion" CASCADE;
DROP TABLE IF EXISTS public."gene_entity" CASCADE;
DROP TABLE IF EXISTS public."_GeneEntityToGeneSetLibraryNode" CASCADE;
DROP TABLE IF EXISTS public."_GeneEntityToGeneSetNode" CASCADE;
DROP TABLE IF EXISTS public."dcc_asset_node" CASCADE;
DROP TABLE IF EXISTS public."partnerships" CASCADE;
DROP TABLE IF EXISTS public."dcc_partnerships" CASCADE;
DROP TABLE IF EXISTS public."partnership_publications" CASCADE;
DROP TABLE IF EXISTS public."code_assets" CASCADE;
DROP TABLE IF EXISTS public."file_assets" CASCADE;
DROP TABLE IF EXISTS public."dcc_usecase" CASCADE;
DROP TABLE IF EXISTS public."kvstore" CASCADE;
DROP TABLE IF EXISTS public."_DCCToUser" CASCADE;
DROP TABLE IF EXISTS public."usecase" CASCADE;
DROP TABLE IF EXISTS public."fair_assessments" CASCADE;
DROP TABLE IF EXISTS public."news" CASCADE;

DROP TABLE IF EXISTS public."xidentity" CASCADE;
DROP TABLE IF EXISTS public."xentity" CASCADE;
DROP TABLE IF EXISTS public."xset" CASCADE;
DROP TABLE IF EXISTS public."xdataset" CASCADE;
DROP TABLE IF EXISTS public."_XEntityToXSet" CASCADE;
DROP TABLE IF EXISTS public."_XDatasetToXEntity" CASCADE;

DROP TABLE IF EXISTS public."c2m2datapackage" CASCADE;
DROP TABLE IF EXISTS public."xlibrary" CASCADE;
DROP TABLE IF EXISTS public."_XEntityToXLibrary" CASCADE;
DROP TABLE IF EXISTS public."c2m2file" CASCADE;

/* 
========== Also, may have to drop triggers, functions and indexes =============

# No need to drop indexs and triggers manually as they are also dropped when the table is dropped.

#SELECT indexname AS index_name, tablename AS table_name FROM pg_indexes WHERE schemaname = 'public';
#SELECT trigger_name, event_manipulation AS event, event_object_table AS table_name FROM information_schema.triggers WHERE trigger_schema = 'public';

SELECT routine_name AS function_name, data_type AS return_type FROM information_schema.routines WHERE routine_schema = 'public';
Many functions were listed, but only create_xidentity_fulltext_index() is relevant here as it created during the migration.

*/

DROP FUNCTION IF EXISTS create_xidentity_fulltext_index() CASCADE;

/* Also drop type "Role" */
/* List types using \dT+ */

DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "NodeType" CASCADE;

