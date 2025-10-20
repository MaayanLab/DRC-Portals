set statement_timeout = 0;
/*
Script to remove .0 from columns size_in_bytes and uncompressed_size_in_bytes of file tables of various schema

First check if there are indeed .0 at the end in those columns

drc=# select distinct id_namespace from c2m2.file where size_in_bytes ilike '%\.0';

Update the line schema_names to include only the ones in which the file table needs to be updated.
Please notice that the first one is specified as C2M2.

\i rem_decimal_file_size_in_bytes_column.sql
OR, directly specify the sql file name in psql command:
psql -h localhost -U drc -d drc -p [5432|5433] -a -f rem_decimal_file_size_in_bytes_column.sql
*/

/* Can run these two lines for C2M2 separately as well */
/*
UPDATE c2m2.file  SET size_in_bytes = REGEXP_REPLACE(size_in_bytes, '\.0$', '');
UPDATE c2m2.file  SET uncompressed_size_in_bytes = REGEXP_REPLACE(uncompressed_size_in_bytes, '\.0$', '');
*/

DO $$
DECLARE
	/*
	schema_names text[] := ARRAY['c2m2', '_4dn', 'ercc', 'gtex', 'glygen', 'hmp', 'hubmap', 'idg', 'kidsfirst', 'lincs', 'metabolomics', 'motrpac', 'sparc', 'sennet', 'scge']; -- Array of schema names
	*/
	schema_names text[] := ARRAY['sparc']; -- Array of schema names
	schema_name text;
BEGIN
	FOREACH schema_name IN ARRAY schema_names
	LOOP
		EXECUTE format('UPDATE %I.file SET size_in_bytes = REGEXP_REPLACE(size_in_bytes, ''\.0$'', '''');', schema_name);
		EXECUTE format('UPDATE %I.file SET uncompressed_size_in_bytes = REGEXP_REPLACE(uncompressed_size_in_bytes, ''\.0$'', '''');', schema_name);
	END LOOP;
END $$;

