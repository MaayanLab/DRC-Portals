set statement_timeout = 0;
set max_parallel_workers to 4;

-- Connect to DB as a user with write permissions

/*
To sanitize the C2M2 tables by deleting records with matching keywords

\i sanitize_C2M2_tables_for_keywords.sql
OR, directly specify the sql file name in psql command:
psql -h localhost -U drc -d drc -p [5432|5433] -a -f sanitize_C2M2_tables_for_keywords.sql
OR,
logf=${logdir}/log_sanitize_C2M2_tables_for_keywords.log
psql "$(python3 dburl.py)" -a -f sanitize_C2M2_tables_for_keywords.sql -L ${logf};
echo ${date_div} >> ${logf};
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
# ./extract_keyword_phrases.sh lines_from_dcc_files_with_keywords.txt lines_from_dcc_files_with_phrase_around_keywords.txt
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

BEGIN;
-------------------------
    DO $$
    DECLARE
        schema_name text;
        tablename text;
        --- schemas text[] := ARRAY['_4dn', 'exrna', 'gtex', 'glygen', 'hmp', 'hubmap', 'idg', 'kidsfirst', 'lincs', 'metabolomics', 'motrpac', 'sparc', 'sennet'];  -- your schema names
        schemas text[] := ARRAY['metabolomics'];  -- your schema names
        --- schemas text[] := ARRAY['c2m2'];  -- your schema names

        --- To get the names all schemas
        /* 
        SELECT '{' || string_agg(quote_literal(schema_name), ', ') || '}' AS schema_array
        FROM information_schema.schemata
        WHERE catalog_name = 'drc' AND (schema_name NOT IN ('pg_catalog', 'information_schema', 'public', 'c2m2', 'ercc', 'slim') AND schema_name NOT ILIKE 'pg_%');    
        */

        /* 
        Exclude biosample, file and subject as they don't have any columns like 
        name, description, abbreviation or synonym 
        */

        /* 
        Note that the searchable column does not include information from the columns
        id_namespace$|local_id$|persistent_id$|creation_time|access_url|size_in_bytes
        */

        tables text[] := ARRAY['analysis_type', 'anatomy', 'assay_type', 'biofluid', /* 'biosample', */
                                'collection', 'compound', 'data_type', 'disease', /* 'file', */ 'file_format',
                                'gene', 'id_namespace', 'ncbi_taxonomy', 'phenotype', 'project', 'protein',
                                'sample_prep_method', /* 'subject', */ 'substance'];
        keywords text := 'gender OR inclusion OR diversity OR equity OR lgbt OR women OR trans';

    BEGIN
        FOREACH schema_name IN ARRAY schemas
        LOOP
            RAISE NOTICE 'Processing schema: %', schema_name;
            FOREACH tablename IN ARRAY tables
            LOOP
                RAISE NOTICE '    Processing table: %.%', schema_name, table_name;
                EXECUTE format(
                    'DELETE FROM %I.%I WHERE searchable @@ websearch_to_tsquery(''english'', %L);',
                    schema_name, tablename, keywords
                );
            END LOOP;
        END LOOP;
    END $$;
-------------------------

--- ROLLBACK;
COMMIT;

RAISE NOTICE 'Done Processing tables in schemas';
RAISE EXCEPTION 'Currently in testing phase, exiting now!';

--- ############################################################################
/* Last: 
Some very specific deletions
*/

DO $$
    DECLARE
        num     drop_specific_rows_from_c2M2_tables := 0;
    BEGIN

    IF drop_specific_rows_from_c2M2_tables > 0 THEN

        BEGIN;
        DELETE FROM c2m2.subject_sex where id = 'cfde_subject_sex:3';
        DELETE FROM c2m2.disease where id = 'DOID:1234'; --- gender incongruence
        DELETE FROM c2m2.disease where id = 'DOID:1234'; --- gender incongruence
        DELETE FROM c2m2.disease where id = 'DOID:10919'; --- gender dysphoria

        --- ROLLBACK;
        COMMIT;

    END IF;
END $$;

--- #############################################################################


DO $$
    DECLARE
        num     drop_specific_rows_from_public_tables := 0;
    BEGIN

    IF drop_specific_rows_from_public_tables > 0 THEN

        BEGIN;

        --- from the node table
        \set node_id '0e48e7a8-52d9-5fea-ade5-a2eb8eab0d21'
        --- DELETE FROM kg_assertion where source_id = '0e48e7a8-52d9-5fea-ade5-a2eb8eab0d21' or target_id = '0e48e7a8-52d9-5fea-ade5-a2eb8eab0d21';
        --- DELETE FROM entity_node where id = '0e48e7a8-52d9-5fea-ade5-a2eb8eab0d21';
        --- DELETE FROM node where id = '0e48e7a8-52d9-5fea-ade5-a2eb8eab0d21';
        DELETE FROM kg_assertion where source_id = :'node_id' or target_id = :'node_id';
        DELETE FROM entity_node where id = :'node_id';
        DELETE FROM node where id = :'node_id';

        --- ROLLBACK;
        COMMIT;
    END IF;
END $$;

set max_parallel_workers to 0;
