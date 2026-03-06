set statement_timeout = 0;
set max_parallel_workers to 4;

-- Connect to DB as a user with write permissions

/*
To sanitize the C2M2 tables by deleting records with matching keywords

\i sanitize_C2M2_tables_for_keywords.sql
OR, directly specify the sql file name in psql command:
psql -h localhost -U drc -d drc -p [5432|5433] -a -f sanitize_C2M2_tables_for_keywords.sql
OR,
date_div() { echo "============= $(date) =============";}
logf=${logdir}/log_sanitize_C2M2_tables_for_keywords.log
psql "$(python3 dburl.py)" -a -f sanitize_C2M2_tables_for_keywords.sql -L ${logf};
date_div >> ${logf};
*/

/*
--- Use the ON DELETE CASCADE feature of foreign key constraints to delete in the parent tables 
--- (ontology tables, project and collection, which have some name and description type columns)
--- and let it propagate to other tables such as file.tsv, biosample.tsv, etc.
Parent tables are listed in the file fk_referenced_tables.txt
One can try to automatically generate sql code to delete certain rows in these parent tables using this list.
These now have searchable column, so can use the syntax like: use the OR operator for several words
searchable @@ websearch_to_tsquery('english', 'keyword') to find such rows and delete
*/

/* Where possible, replace gender with sex and women with female */

/*
analysis_type
anatomy
assay_type
biofluid
biosample
collection
compound
data_type
disease
file
file_format
gene
id_namespace
ncbi_taxonomy
phenotype
project
protein
sample_prep_method
subject
substance
*/

/*
To find all such words in all files in ingest/c2m2s folder: use grep -r: write in a shell script extract_keyword_phrases.sh
# ./extract_keyword_phrases.sh kwlog/lines_from_dcc_files_with_keywords.txt kwlog/lines_from_dcc_files_with_phrase_around_keywords.txt
*/

--- Construct the sql array using the linux shell command, then copy paste the output into this file below
--- linux command: awk '{printf "\x27%s\x27, ", $1}' fk_referenced_tables.txt | sed 's/, $//'
--- If onew wanted to print the sql delete statements for later used in this script, 
--- one could use the linux command: Now in the script file called below:
--- # ./gen_sql_select_count_delete_statements.sh fk_referenced_tables.txt sql_select_count_delete_keywords_statements.sql
--- The delete part is being done in a loop below, so no need to include that in the above script

--- Example query:
--- \set keywords 'gender OR inclusion OR diversity OR equity OR lgbt OR women OR trans'
--- DELETE FROM c2m2.anatomy where searchable @@ websearch_to_tsquery('english', :'keywords');

/* First do replacements: case sensitive: # Now done directly in tsv files before ingesting
Genders with Sexes 
genders with sexes 
Gender with Sex 
gender with sex

Do this as well: ??
Women with Female
women with female

If one were to do it in sql:
--- In the tables project and collection, replace in these columns:
abbreviation |         name          |              description

but this requires writing too many lines of code. It is best to do simple 
replacements in the tsv files themselves before ingestion. By matching the 
word boundary, we ensure these do not appear in IDs. See the script extract_keyword_phrases.sh
and replace_gender_sex_women_female_in_tsvfiles.sh

*/

/* 
Then delete the records with these keywords 
    keywords text := 'gender OR inclusion OR diversity OR equity OR lgbt OR women OR trans';
*/

-------------------------
--- First, define the procedure
CREATE OR REPLACE PROCEDURE delete_matching_rows(
    schema_name TEXT,
    table_name TEXT,
    keyword TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    full_sql TEXT;
BEGIN
    full_sql := format('DELETE FROM %I.%I WHERE searchable ILIKE %L',
                       schema_name, table_name, '%' || keyword || '%');

    RAISE NOTICE 'Executing: %', full_sql;
    EXECUTE full_sql;

    COMMIT;  -- This works inside a procedure
END;
$$;

CREATE OR REPLACE FUNCTION select_matching_rows_searchable_tsvector(
    schema_name TEXT,
    table_name TEXT,
    keyword TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    full_sql TEXT;
BEGIN
    ---SELECT * FROM node WHERE searchable @@ websearch_to_tsquery('english', 'gender');
    full_sql := format('SELECT * FROM %I.%I WHERE searchable @@ websearch_to_tsquery(''english'', %L)',
                       schema_name, table_name, keyword);
    RAISE NOTICE 'Executing: %', full_sql;
    EXECUTE full_sql;

    --- COMMIT;  -- This works inside a procedure --- no commit for select
END;
$$;

-------------------------
DO $$
DECLARE
    test_only BOOLEAN := FALSE; --- OR TRUE; --- or FALSE
    schema_name text;
    table_name text;
    keyword_from_array text;
    /* Select one of the schema lines from below, keep others commented */
    --- schemas text[] := ARRAY['_4dn', 'exrna', 'gtex', 'glygen', 'hmp', 'hubmap', 'idg', 'kidsfirst', 'lincs', 'metabolomics', 'motrpac', 'sparc', 'sennet', 'scge'];  -- your schema names
    /* To manually/artificially parallelize, you can break this list into two, select one of them in one call.
        Then, select the other line here, and call in another terminal, change the name of the log file when calling.
    */
    --- schemas text[] := ARRAY['_4dn', 'exrna', 'gtex', 'glygen', 'hmp', 'hubmap'];  -- your schema names
    --- schemas text[] := ARRAY['idg', 'kidsfirst', 'lincs', 'metabolomics', 'motrpac', 'sparc', 'sennet'];  -- your schema names
    --- schemas text[] := ARRAY['motrpac'];  -- your schema names
    schemas text[] := ARRAY['c2m2'];  --- BE CAREFUL WITH THIS ONE AS THIS IS THE MAIN SCHEMA -- your schema names

    --- To get the names all schemas
    /*
    SELECT '{' || string_agg(quote_literal(schema_name), ', ') || '}' AS schema_array
    FROM information_schema.schemata
    WHERE catalog_name = 'drc' AND (schema_name NOT IN ('pg_catalog', 'information_schema', 'public', 'c2m2', 'ercc', 'slim') AND schema_name NOT ILIKE 'pg_%');
    */

    /*
    Note that the searchable column does not include information from the columns
    id_namespace$|creation_time|size_in_bytes
    */

    tables text[] := ARRAY['analysis_type', 'anatomy', 'assay_type', 'biofluid', 'biosample',
                            'collection', 'compound', 'data_type', 'disease', 'file', 'file_format',
                            'gene', 'id_namespace', 'ncbi_taxonomy', 'phenotype', 'project', 'protein',
                            'sample_prep_method', 'subject', 'substance'];
    keywords text := 'gender OR inclusion OR diversity OR equity OR lgbt OR trans-gen OR transgen'; ---  OR women
    --- If use trans for exclusion, entire MoTrPAC data is gone as project name is: Molecular Transducers of Physical Acitivity Consortium
    keywords_array text[] := ARRAY['gender', 'inclusion', 'diversity', 'equity', 'lgbt', 'trans-gen', 'transgen']; ---  OR women
    keywords_array_wildcard text[];

    tbl RECORD;
    row_count BIGINT;

BEGIN
    keywords_array_wildcard := ARRAY(SELECT '%' || k || '%' FROM unnest(keywords_array) AS k);

    FOREACH schema_name IN ARRAY schemas
    LOOP
        RAISE NOTICE 'Processing schema: %', schema_name;
        -------------------------------------------------------
        ----------------------
        RAISE NOTICE '---- Before deletion ----';
        FOR tbl IN (SELECT tablename FROM pg_tables WHERE schemaname = schema_name)
        LOOP
            EXECUTE format('SELECT COUNT(*) FROM %I.%I', schema_name, tbl.tablename) INTO row_count;
            RAISE NOTICE 'Table %.%, Row count: %', schema_name, tbl.tablename, row_count;
        END LOOP;
        ----------------------

        FOREACH table_name IN ARRAY tables
        LOOP
            RAISE NOTICE '    Processing table: %.%', schema_name, table_name;
            --- RAISE NOTICE '      Before deletion';
            --- EXECUTE format('SELECT count(*) FROM %I.%I;', schema_name, table_name);
            --- BEGIN --- FOR Transaction control
                --- SAVEPOINT loop_point;

                --- EXECUTE format('DELETE FROM %I.%I WHERE searchable @@ websearch_to_tsquery(''english'', %L) RETURNING *',
                ---    schema_name, table_name, keywords);
            FOREACH keyword_from_array IN ARRAY keywords_array
            LOOP
                IF NOT test_only THEN
                    --- EXECUTE format('DELETE FROM %I.%I WHERE searchable @@ websearch_to_tsquery(''english'', %L) RETURNING *',
                    ---    schema_name, table_name, keyword_from_array);
                    --- EXECUTE format('DELETE FROM %I.%I WHERE searchable ilike %L',
                    ---    schema_name, table_name, '%' || keyword_from_array || '%' );
                    --- Call stored procedure
                    CALL delete_matching_rows(schema_name, table_name, keyword_from_array);
                    --- RAISE NOTICE '      Only testing';
                ELSE
                    RAISE NOTICE '      Only testing';
                END IF;
            END LOOP;

                --- RELEASE SAVEPOINT loop_point;
                --- ROLLBACK TO SAVEPOINT loop_point;
            --- ROLLBACK; --- FOR Transaction control
            --- COMMIT; --- FOR Transaction control
            --- END; --- FOR Transaction control
        END LOOP;

        ----------------------
        RAISE NOTICE '---- After deletion ----';
        FOR tbl IN (SELECT tablename FROM pg_tables WHERE schemaname = schema_name)
        LOOP
            EXECUTE format('SELECT COUNT(*) FROM %I.%I', schema_name, tbl.tablename) INTO row_count;
            RAISE NOTICE 'Table %.%, Row count: %', schema_name, tbl.tablename, row_count;
        END LOOP;
        FOR tbl IN (SELECT tablename FROM pg_tables WHERE schemaname = schema_name)
        LOOP
            --- EXECUTE format('SELECT COUNT(*) FROM %I.%I WHERE searchable @@ websearch_to_tsquery(''english'', %L)',
            ---    schema_name, table_name, keywords) INTO row_count;
            EXECUTE format('SELECT COUNT(*) FROM %I.%I WHERE searchable ILIKE ANY ($1)',
                schema_name, table_name) INTO row_count USING keywords_array_wildcard;
            RAISE NOTICE '                Table %.%, Row count with keywords: %', schema_name, tbl.tablename, row_count;
        END LOOP;
        ----------------------
        -------------------------------------------------------
    END LOOP;
    --- RAISE NOTICE 'Done Processing tables in schemas';
END $$;
-------------------------

--- RAISE EXCEPTION 'Currently in testing phase, exiting now!';

/* Quck count checks before and after (if ingested in two different containers)
\set sch 'metabolomics'
select count(*) from :sch.file; select count(*) from :sch.subject; select count(*) from :sch.biosample; select count(*) from :sch.collection; select count(*) from :sch.project;

--- To get counts with any keywords in specific tables
select count(*) from c2m2.project where searchable ilike any (ARRAY['%gender%', '%inclusion%', '%diversity%', '%equity%', '%lgbt%', '%trans-gen%', '%transgen%']);

*/

--- ############################################################################
/* Last: 
Some very specific deletions
See also the script sanitize_tables_for_keywords.sql in the parent folder (database)
*/


---/*
DO $$
DECLARE
    drop_specific_rows_from_c2M2_tables INT := 1;
BEGIN
    IF drop_specific_rows_from_c2M2_tables > 0 THEN
        --- BEGIN; --- Use only if running directly on psql prompt
        DELETE FROM c2m2.subject_sex where id = 'cfde_subject_sex:3';
        DELETE FROM c2m2.disease where id = 'DOID:1234'; --- gender/sex incongruence
        DELETE FROM c2m2.disease where id = 'DOID:10919'; --- gender/sex dysphoria

        --- ROLLBACK;
        --- COMMIT; --- Use only if running directly on psql prompt
    END IF;
END $$;
---*/
--- #############################################################################

---*/

set max_parallel_workers to 0;
