--- This script is used to extract the list of DCCs for core tables and then combine them into one table

set statement_timeout = 0;
set max_parallel_workers to 4;

/* run in psql as \i extract_DCCs_for_coreTables.sql */
/* Or on linux command prompt:psql -h localhost -U drc -d drc  -p [5432|5433] -a -f extract_DCCs_for_coreTables.sql; */

--- Example psql code to write output to file
--- \set pr PR000633
--- \copy (SELECT distinct id_namespace, local_id, persistent_id, creation_time, abbreviation, name, description from c2m2.project where local_id = :'pr') TO project1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;

--- project
--- \copy (SELECT distinct local_id, persistent_id, creation_time, abbreviation, name, description 
---     from c2m2.project where local_id = 'PR000633') TO project1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;
--- \copy (SELECT distinct local_id, persistent_id, creation_time, abbreviation, name, description from c2m2.project where local_id = 'PR000633') TO project1.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;

--- Part of this code is generated using ChatGPT
--- Q: Given the json for c2m2 schema in postgres, which has tables like project, subject, biosample, collection, list the tables in the format 'project', 'subject', 'biosample', 'collection' etc, in that order (or these words appearing in the table name, like, subject_disease, subject_race, etc., sorted alphabetICALLY). The json description is in the attached file.
--- Q: don't add comment lines and can write more than one table name on the same line

/*
tables_core text[] := ARRAY[
--- 'dcc', 
'project', 'subject', 'biosample', 'collection', 'file'];

tables_core_related text[] := ARRAY[
--- 'project_in_project', 
'collection_defined_by_project',

'subject_disease', 'subject_phenotype', 'subject_race', 'subject_role_taxonomy',
'subject_substance', 'subject_in_collection',

'biosample_from_subject', 'biosample_disease', 'biosample_gene', 'biosample_protein', 'biosample_ptm',
'biosample_substance', 'biosample_in_collection',

'collection_anatomy', 'collection_biofluid', 'collection_compound',
'collection_disease', 'collection_gene', 
--- 'collection_in_collection',
'collection_phenotype', 'collection_protein', 'collection_ptm',
'collection_substance', 'collection_taxonomy',

'file_describes_subject', 'file_describes_biosample',
'file_describes_collection', 'file_in_collection'
];

Q: I have another table that was generated in semi-manual way, with structure as below: 
drc=# \d+ c2m2.id_namespace_dcc_id

What I may need is a union of output from running code like below on each of those tables. 
Example for tables from tables_core:
--- Example code for table with column id_namespace
--- project
select distinct 'project' as table_name, idn.id_namespace, c2m2.id_namespace_dcc_id.dcc_short_label from 
(select distinct id_namespace as id_namespace from c2m2.project) idn left join 
c2m2.id_namespace_dcc_id on idn.id_namespace = c2m2.id_namespace_dcc_id.id_namespace_id;
--- subject
select distinct 'subject' as table_name, idn.id_namespace, c2m2.id_namespace_dcc_id.dcc_short_label from 
(select distinct id_namespace as id_namespace from c2m2.subject) idn left join 
c2m2.id_namespace_dcc_id on idn.id_namespace = c2m2.id_namespace_dcc_id.id_namespace_id;

Example for tables from tables_core_related:
--- subject_disease
select distinct 'subject_disease' as table_name, idn.id_namespace, c2m2.id_namespace_dcc_id.dcc_short_label from 
(select distinct subject_id_namespace as id_namespace from c2m2.subject_disease) idn left join 
c2m2.id_namespace_dcc_id on idn.id_namespace = c2m2.id_namespace_dcc_id.id_namespace_id;
--- biosample_disease
select distinct 'biosample_disease' as table_name, idn.id_namespace, c2m2.id_namespace_dcc_id.dcc_short_label from 
(select distinct biosample_id_namespace as id_namespace from c2m2.biosample_disease) idn left join 
c2m2.id_namespace_dcc_id on idn.id_namespace = c2m2.id_namespace_dcc_id.id_namespace_id;

Generate code to output a table with the three columns table_name, id_namespace and dcc_short_label that will be union of such output by looping over all the tables in the two arrays.
*/

CREATE OR REPLACE FUNCTION c2m2.get_table_namespaces()
RETURNS TABLE (
    table_name      text,
    id_namespace    varchar,
    dcc_short_label varchar
)
LANGUAGE plpgsql
AS $$
DECLARE
    tbl text;
    namespace_col text;
    sql text;
    tables_core text[] := ARRAY[
        --- 'dcc',
        'project', 'subject', 'biosample', 'collection', 'file'
    ];

    tables_core_related text[] := ARRAY[
        --- 'project_in_project', 
        'collection_defined_by_project',

        'subject_disease', 'subject_phenotype', 'subject_race',
        'subject_role_taxonomy', 'subject_substance',
        'subject_in_collection',

        'biosample_from_subject', 'biosample_disease',
        'biosample_gene', 'biosample_protein', 'biosample_ptm',
        'biosample_substance', 'biosample_in_collection',

        'collection_anatomy', 'collection_biofluid',
        'collection_compound', 'collection_disease',
        'collection_gene', 
        --- 'collection_in_collection',
        'collection_phenotype', 'collection_protein',
        'collection_ptm', 'collection_substance',
        'collection_taxonomy',

        'file_describes_subject',
        'file_describes_biosample',
        'file_describes_collection',
        'file_in_collection'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables_core
    LOOP
        RAISE NOTICE 'Processing core table: %', tbl;
        sql := format($f$
            SELECT DISTINCT
                %L AS table_name,
                idn.id_namespace,
                m.dcc_short_label
            FROM (
                SELECT DISTINCT id_namespace
                FROM c2m2.%I
            ) idn
            LEFT JOIN c2m2.id_namespace_dcc_id m
                ON idn.id_namespace = m.id_namespace_id
            ORDER BY m.dcc_short_label
        $f$, tbl, tbl);

        RETURN QUERY EXECUTE sql;
    END LOOP;

    FOREACH tbl IN ARRAY tables_core_related
    LOOP
        namespace_col := split_part(tbl, '_', 1) || '_id_namespace';
        RAISE NOTICE 'Processing related table: %, namespace column: %', tbl, namespace_col;

        sql := format($f$
            SELECT DISTINCT
                %L AS table_name,
                idn.id_namespace,
                m.dcc_short_label
            FROM (
                SELECT DISTINCT %I AS id_namespace
                FROM c2m2.%I
            ) idn
            LEFT JOIN c2m2.id_namespace_dcc_id m
                ON idn.id_namespace = m.id_namespace_id
            ORDER BY m.dcc_short_label
        $f$, tbl, namespace_col, tbl);

        RETURN QUERY EXECUTE sql;
    END LOOP;
END;
$$;

--- Now call/execute:
--- SELECT * FROM c2m2.get_table_namespaces() ORDER BY table_name, id_namespace;
SELECT * FROM c2m2.get_table_namespaces() ORDER BY table_name, dcc_short_label;
