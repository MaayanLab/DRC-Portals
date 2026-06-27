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

DROP FUNCTION IF EXISTS c2m2.get_table_namespaces();

CREATE OR REPLACE FUNCTION c2m2.get_table_namespaces()
RETURNS TABLE (
    srno            integer,
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
    v_srno integer := 0;

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
        'biosample_gene', 'biosample_protein',
        'biosample_ptm', 'biosample_substance',
        'biosample_in_collection',

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
        v_srno := v_srno + 1;

        RAISE NOTICE 'Processing table % (SrNo=%)', tbl, v_srno;

        sql := format($fmt$
            SELECT
                %s::integer AS srno,
                %L::text AS table_name,
                idn.id_namespace,
                m.dcc_short_label
            FROM (
                SELECT DISTINCT id_namespace
                FROM c2m2.%I
            ) idn
            LEFT JOIN c2m2.id_namespace_dcc_id m
                ON idn.id_namespace = m.id_namespace_id
            ORDER BY m.dcc_short_label
        $fmt$, v_srno, tbl, tbl);

        RETURN QUERY EXECUTE sql;
    END LOOP;

    FOREACH tbl IN ARRAY tables_core_related
    LOOP
        v_srno := v_srno + 1;

        namespace_col := split_part(tbl, '_', 1) || '_id_namespace';

        RAISE NOTICE 'Processing table % (SrNo=%), namespace column=%',
                     tbl, v_srno, namespace_col;

        sql := format($fmt$
            SELECT
                %s::integer AS srno,
                %L::text AS table_name,
                idn.id_namespace,
                m.dcc_short_label
            FROM (
                SELECT DISTINCT %I AS id_namespace
                FROM c2m2.%I
            ) idn
            LEFT JOIN c2m2.id_namespace_dcc_id m
                ON idn.id_namespace = m.id_namespace_id
            ORDER BY m.dcc_short_label
        $fmt$, v_srno, tbl, namespace_col, tbl);

        RETURN QUERY EXECUTE sql;
    END LOOP;

    RETURN;
END;
$$;

--- Now call/execute:
--- SELECT * FROM c2m2.get_table_namespaces() ORDER BY table_name, id_namespace;
--- SELECT * FROM c2m2.get_table_namespaces() ORDER BY table_name, dcc_short_label;
--- SELECT distinct table_name, dcc_short_label FROM c2m2.get_table_namespaces() ORDER BY table_name, dcc_short_label;
--- SELECT * FROM c2m2.get_table_namespaces() ORDER BY srno, table_name, id_namespace;
SELECT DISTINCT srno, table_name, dcc_short_label FROM c2m2.get_table_namespaces() ORDER BY srno, dcc_short_label;

/*

Thanks. Now my output looks like: Many lines omitted
 srno |          table_name           | dcc_short_label 
------+-------------------------------+-----------------
    1 | project                       | 4DN
    2 | subject                       | MoTrPAC
    3 | biosample                     | Metabolomics
    3 | biosample                     | MoTrPAC
    4 | collection                    | SPARC
    5 | file                          | KidsFirst
    5 | file                          | MoTrPAC
    5 | file                          | SPARC
    6 | collection_defined_by_project | 4DN
    6 | collection_defined_by_project | ExRNA
    7 | subject_disease               | Bridge2AI
    7 | subject_disease               | Metabolomics
    8 | subject_phenotype             | Metabolomics
    9 | subject_race                  | Bridge2AI
    9 | subject_race                  | SenNet
   10 | subject_role_taxonomy         | 4DN
   10 | subject_role_taxonomy         | SenNet
   12 | subject_in_collection         | MoTrPAC
   12 | subject_in_collection         | SenNet
   12 | subject_in_collection         | SPARC

Some more rows. 
I want an output in a compact format. 
May be save this table as a temporary table or as part of CTE, from which create output like, 
where, the first column will be the name of the table, and the rest of the columns will be 
distinct dcc_short_label. In a row for a table, like project or subject, 
if the above table has a dcc_short_label, then put 'y' in the new compact table, 
else leave empty. Is that possible in sql. I think the first task will be to get 
the unique complete list of dcc_short_label.

*/

DROP TABLE IF EXISTS tmp_table_namespaces;

CREATE TEMP TABLE tmp_table_namespaces AS
SELECT DISTINCT
       srno,
       table_name,
       dcc_short_label
FROM c2m2.get_table_namespaces()
WHERE dcc_short_label IS NOT NULL ORDER BY srno, dcc_short_label;

\copy (SELECT * from tmp_table_namespaces) TO tmp_table_namespaces.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;


DO $$
DECLARE
    cols text;
    sql  text;
BEGIN
    SELECT string_agg(
               format(
                   'max(CASE WHEN dcc_short_label = %L THEN ''y'' END) AS %I',
                   dcc_short_label,
                   dcc_short_label
               ),
               E',\n       '
               ORDER BY dcc_short_label
           )
    INTO cols
    FROM (
        SELECT DISTINCT dcc_short_label
        FROM tmp_table_namespaces
        ORDER BY dcc_short_label
    ) d;

    sql := format(
$fmt$
DROP TABLE IF EXISTS tmp_table_namespaces_pivot;

CREATE TEMP TABLE tmp_table_namespaces_pivot AS
SELECT
       srno,
       table_name,
       %s
FROM tmp_table_namespaces
GROUP BY srno, table_name
ORDER BY srno;
$fmt$,
        cols
    );

    RAISE NOTICE 'Executing:%', E'\n' || sql;

    EXECUTE sql;
END $$;

SELECT * FROM tmp_table_namespaces_pivot ORDER BY srno;
\copy (SELECT * FROM tmp_table_namespaces_pivot ORDER BY srno) TO tmp_table_namespaces_pivot.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;
