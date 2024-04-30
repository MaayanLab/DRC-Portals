/* Some basic queries to check if metadata from various DCCs, together in the schema c2m2 
or in respective schema are all good.
1. Check if counts from respective schema match with count from c2m2 schema for tables which have 
id_namespace and local_id columns.
Do not do this for ontology/term tables such as protein.tsv, compound.tsv, etc., since there, 
several DCCs will have overlapiing terms.
*/

select case when ( 2 != 3) then 'metabolomics.file: Number of records do not match' 
        else 'metabolomics.file: Number of records match' 
        end as count_match;


WITH counts AS (SELECT
    (select count(*) from c2m2.file where id_namespace ilike '%metab%') AS count1,
    (select count(*) from metabolomics.file) AS count2
)
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
    THEN 'metabolomics.file: Number of records do not match' 
    ELSE 'metabolomics.file: Number of records match'
    END AS count_match
FROM counts;

select count(*) from c2m2.subject where id_namespace IN ('https://data.4dnucleome.org');

--- Use the above code template to generate code in python and write to the file log/CountQuery_Crosscheck_DCCname.sql
