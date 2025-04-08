set statement_timeout = 0;
set max_parallel_workers to 4;

-- Connect to DB as a user with write permissions

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
--- linux command: awk '{printf "\x27%s\x27,", $1}' fk_referenced_tables.txt | sed 's/,$//'
--- If onew wanted to print the sql delete statements for later use in this script, 
--- one could use the linux command

/*
while read -r table; do
    echo "DELETE FROM c2m2.$table WHERE searchable @@ websearch_to_tsquery('english', :'keywords');"
done < fk_referenced_tables.txt > sql_delete_keywords_statements.sql

while read -r table; do
    echo "SELECT COUNT(*) FROM c2m2.$table WHERE searchable @@ websearch_to_tsquery('english', :'keywords');"
done < fk_referenced_tables.txt >> sql_delete_keywords_statements.sql

while read -r table; do
    echo "SELECT * FROM c2m2.$table WHERE searchable @@ websearch_to_tsquery('english', :'keywords');"
done < fk_referenced_tables.txt >> sql_delete_keywords_statements.sql

*/

BEGIN;
--- \set keywords 'gender OR inclusion OR diversity OR equity OR lgbt'

--- DELETE FROM c2m2.anatomy where searchable @@ websearch_to_tsquery('english', :'keywords');

DO $$
DECLARE
    tablename text;
    tables text[] := ARRAY['analysis_type','anatomy','assay_type','biofluid','biosample',
                            'collection','compound','data_type','disease','file','file_format',
                            'gene','id_namespace','ncbi_taxonomy','phenotype','project','protein',
                            'sample_prep_method','subject','substance'];
    keywords text := 'gender|inclusion|diversity|equity|lgbt';
BEGIN
    FOREACH tablename IN ARRAY tables
    LOOP
        EXECUTE format(
            'DELETE FROM c2m2.%I WHERE searchable @@ websearch_to_tsquery(''english'', %L);',
            tablename, keywords
        );
    END LOOP;
END $$;


--- ROLLBACK;
COMMIT;

BEGIN;
DELETE FROM c2m2.subject_sex where id = 'cfde_subject_sex:3';
--- ROLLBACK;
COMMIT;

set max_parallel_workers to 0;
