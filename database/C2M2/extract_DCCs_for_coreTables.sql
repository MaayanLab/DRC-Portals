--- This script is used to extract the list of DCCs for core tables and then combine them into one table

set statement_timeout = 0;
set max_parallel_workers to 4;

/* run in psql as \i extract_DCCs_for_coreTables.sql */
/* Or on linux command prompt:psql -h localhost -U drc -d drc  -p [5432|5433] -a -f extract_DCCs_for_coreTables.sql; */

------------------------ WARNING ------------------------
--- Do not expose it to users: If this procedure were exposed to arbitrary users, then using %s would allow SQL injection

---------------------------------------------------------
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

--- Utility function
CREATE OR REPLACE PROCEDURE c2m2.print_heading(p_title text)
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '%', p_title;
    RAISE NOTICE '==========================================';
END;
$$;

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
--- SELECT DISTINCT srno, table_name, dcc_short_label FROM c2m2.get_table_namespaces() ORDER BY srno, dcc_short_label;

CALL c2m2.print_heading('Creating table_namespaces');

DROP TABLE IF EXISTS table_namespaces;

CREATE TEMP TABLE table_namespaces AS
SELECT DISTINCT
       srno,
       table_name,
       dcc_short_label
FROM c2m2.get_table_namespaces()
WHERE dcc_short_label IS NOT NULL ORDER BY srno, dcc_short_label;

SELECT * from table_namespaces;
\copy (SELECT * from table_namespaces) TO table_namespaces.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;

---------------------------------------------------------

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

/* This is not needed since now we use a generic version

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
        FROM table_namespaces
        ORDER BY dcc_short_label
    ) d;

    sql := format(
$fmt$
DROP TABLE IF EXISTS table_namespaces_pivot;

CREATE TEMP TABLE table_namespaces_pivot AS
SELECT
       srno,
       table_name,
       %s
FROM table_namespaces
GROUP BY srno, table_name
ORDER BY srno;
$fmt$,
        cols
    );

    RAISE NOTICE 'Executing:%', E'\n' || sql;

    EXECUTE sql;
END $$;

SELECT * FROM table_namespaces_pivot ORDER BY srno;
\copy (SELECT * FROM table_namespaces_pivot ORDER BY srno) TO table_namespaces_pivot.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;

*/

---------------------------------------------------------

/*

Let us go back to the how the table table_namespaces was generated. 
I am going to paste the code you generated (I may have modified it a bit).

Please re-read the json schema, I can upload the json file again if you don't have it from the last session.
Now I want to generate another table like table_namespaces, called, term_type_namespaces, where instead of 
recording table_name and then the dcc_short_label, I want to record specific table_name,  
column_name (as term_type) for specific tables (I am going to list the column name, 
and based on the json, you can identify which table it comes from; if more than one 
tables have the same column name, list them separately, do not combine) and then the 
dcc_short_label if in that table, the column of interest is not null and not equal to empty string ''. 
The columns of interest are:
disease
phenotype
anatomy
biofluid
sample_prep_method
taxonomy_id
role_id
granularity
sex
ethnicity
age_at_enrollment
age_at_sampling
association_type
substance
compound
gene
protein
ptm
file_format
compression_format
data_type
assay_type
analysis_type
dbgap_study_id

First you may want to prepare an array of relevant tables, which I think should be the tables_core 
and tables_core_related. Then, identify the tables from which the above columns come from. Then, 
loop over the relevant combination of tables and columns, and inside the loop, do the join and 
check the condition that the column of interest is not null and not equal to empty string ''.

Q: You got the combination of tables and columns almost right, but minor fixing is needed. 
The column dbgap_study_id is from the file table, not the project table.  biosample table 
doesn't have taxonomy_id column.

*/

DROP FUNCTION IF EXISTS c2m2.get_term_type_namespaces();

CREATE OR REPLACE FUNCTION c2m2.get_term_type_namespaces()
RETURNS TABLE (
    srno            integer,
    table_name      text,
    term_type       text,
    dcc_short_label varchar
)
LANGUAGE plpgsql
AS $$
DECLARE
    pair text;
    tbl text;
    term_col text;
    namespace_col text;
    sql text;
    v_srno integer := 0;

    table_column_pairs text[] := ARRAY[
        'subject|granularity',
        'subject|sex',
        'subject|ethnicity',
        'subject|age_at_enrollment',

        'biosample|anatomy',
        'biosample|biofluid',
        'biosample|sample_prep_method',

        'biosample_from_subject|age_at_sampling',

        'file|file_format',
        'file|compression_format',
        'file|data_type',
        'file|assay_type',
        'file|analysis_type',
        'file|dbgap_study_id',

        'subject_disease|disease',
        'subject_disease|association_type',

        'subject_phenotype|phenotype',

        'subject_role_taxonomy|role_id',
        'subject_role_taxonomy|taxonomy_id',

        'subject_substance|substance',

        'biosample_disease|disease',
        'biosample_disease|association_type',

        'biosample_gene|gene',

        'biosample_protein|protein',

        'biosample_ptm|ptm',

        'biosample_substance|substance',

        'collection_anatomy|anatomy',

        'collection_biofluid|biofluid',

        'collection_compound|compound',

        'collection_disease|disease',

        'collection_gene|gene',

        'collection_phenotype|phenotype',

        'collection_protein|protein',

        'collection_ptm|ptm',

        'collection_substance|substance',

        'collection_taxonomy|taxon'
    ];
BEGIN

    FOREACH pair IN ARRAY table_column_pairs
    LOOP
        v_srno := v_srno + 1;

        tbl := split_part(pair, '|', 1);
        term_col := split_part(pair, '|', 2);

        IF tbl IN ('project','subject','biosample','collection','file') THEN
            namespace_col := 'id_namespace';
        ELSE
            namespace_col := split_part(tbl, '_', 1) || '_id_namespace';
        END IF;

        RAISE NOTICE 'Processing %.% (SrNo=%)', tbl, term_col, v_srno;

        sql := format($fmt$
            SELECT DISTINCT
                %s::integer AS srno,
                %L::text AS table_name,
                %L::text AS term_type,
                m.dcc_short_label
            FROM (
                SELECT DISTINCT %I AS id_namespace
                FROM c2m2.%I
                WHERE %I IS NOT NULL
                  AND trim(%I) <> ''
            ) idn
            LEFT JOIN c2m2.id_namespace_dcc_id m
                ON idn.id_namespace = m.id_namespace_id
            WHERE m.dcc_short_label IS NOT NULL
        $fmt$,
            v_srno,
            tbl,
            term_col,
            namespace_col,
            tbl,
            term_col,
            term_col
        );

        RETURN QUERY EXECUTE sql;

    END LOOP;

    RETURN;
END;
$$;

CALL c2m2.print_heading('Creating term_type_namespaces');

DROP TABLE IF EXISTS term_type_namespaces;

CREATE TEMP TABLE term_type_namespaces AS
SELECT DISTINCT
       srno,
       table_name,
       term_type,
       dcc_short_label
FROM c2m2.get_term_type_namespaces()
ORDER BY srno, dcc_short_label;

SELECT * from term_type_namespaces;

\copy (SELECT * from term_type_namespaces) TO term_type_namespaces.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;

---------------------------------------------------------

/*

ChatGpt suggested the pivot table as well.

Q: That would be awesome, I indeed need the pivot table too. Please write the complete code 
to generate the corresponding pivot table for term_type_namespaces.

*/

DROP PROCEDURE IF EXISTS c2m2.create_dcc_pivot(text, text, text, text);

CREATE OR REPLACE PROCEDURE c2m2.create_dcc_pivot(
    p_source_table  text,
    p_group_columns text,
    p_dest_table    text,
    p_order_by      text DEFAULT 'srno'
)
LANGUAGE plpgsql
AS $$
DECLARE
    cols text;
    sql  text;
BEGIN
    ------------------------------------------------------------------
    -- Build one output column for each DCC
    ------------------------------------------------------------------
    EXECUTE format(
        $q$
        SELECT string_agg(
                   format(
                       'max(CASE WHEN dcc_short_label = %%L THEN ''y'' END) AS %%I',
                       dcc_short_label,
                       dcc_short_label
                   ),
                   E',\n       '
                   ORDER BY dcc_short_label
               )
        FROM (
            SELECT DISTINCT dcc_short_label
            FROM %I
            WHERE dcc_short_label IS NOT NULL
            ORDER BY dcc_short_label
        ) d
        $q$,
        p_source_table)
    INTO cols;

    ------------------------------------------------------------------
    -- Drop destination table if it already exists
    ------------------------------------------------------------------
    EXECUTE format(
        'DROP TABLE IF EXISTS %I',
        p_dest_table);

    ------------------------------------------------------------------
    -- Build pivot query
    ------------------------------------------------------------------
    sql := format(
$fmt$
CREATE TEMP TABLE %I AS
SELECT
       %s,
       %s
FROM %I
GROUP BY %s
ORDER BY %s;
$fmt$,
        p_dest_table,
        p_group_columns,
        cols,
        p_source_table,
        p_group_columns,
        p_order_by
    );

    RAISE NOTICE 'Executing:%', E'\n' || sql;

    EXECUTE sql;

    RAISE NOTICE 'Created pivot table %', p_dest_table;

END;
$$;

CALL c2m2.print_heading('Creating table_namespaces_pivot');

CALL c2m2.create_dcc_pivot(
    'table_namespaces',
    'srno, table_name',
    'table_namespaces_pivot'
);

SELECT * FROM table_namespaces_pivot;

CALL c2m2.print_heading('Creating term_type_namespaces_pivot');

--- TABLE table_namespaces_pivot;

CALL c2m2.create_dcc_pivot(
    'term_type_namespaces',
    'srno, table_name, term_type',
    'term_type_namespaces_pivot'
);

SELECT * FROM term_type_namespaces_pivot;
--- TABLE term_type_namespaces_pivot;

\copy (SELECT * FROM table_namespaces_pivot) TO table_namespaces_pivot.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;
\copy (SELECT * FROM term_type_namespaces_pivot) TO term_type_namespaces_pivot.tsv WITH DELIMITER E'\t' NULL '' CSV HEADER;

---------------------------------------------------------
