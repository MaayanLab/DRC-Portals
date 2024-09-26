set statement_timeout = 0;
/*
After the tables c2m2.ffl_biosample_collection and c2m2.ffl_biosample_collection_cmp are generated and well tested,
the intermediate ffl tables can be dropped.
Being in the directory DRC-Portals/database/C2M2, this sql script can be run as (upon starting psql shell, or 
equivalent command):
\i drop_intermediate_ffl_tables.sql
OR, directly specify the sql file name in psql command:
psql -h localhost -U drc -d drc -p 5432 -a -f drop_intermediate_ffl_tables.sql
*/

DROP TABLE IF EXISTS c2m2.ffl_biosample RESTRICT;
DROP TABLE IF EXISTS c2m2.ffl_biosample_cmp RESTRICT;
DROP TABLE IF EXISTS c2m2.ffl_collection RESTRICT;
DROP TABLE IF EXISTS c2m2.ffl_collection_cmp RESTRICT;
