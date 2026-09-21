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

/*
2026/09/16: Help from ChatGPT:

I am going back to the sql script. In the pivot table, instead of just writing y if that term type is there, 
I need to report a fraction for it, e.g., 0.58 will mean it is populated for 58% of the records for that DCC 
and table-term-type. So, it appears that in the intermediate table term_type_namespaces (I will paste the 
current script shortly so it will be clear), I also need to have a column to capture that fraction. The 
script code is:

the above code

Please explain the approach to update the above code to accomplish adding the fraction instead of 'y'. 
In the updated code, you can append _fraction in the names of functions, procedures and temp tables, 
etc., Of course, the names of original C2M2 tables e.g., c2m2.file will remain as it is.

*/

DROP FUNCTION IF EXISTS c2m2.get_term_type_namespaces_fraction0();

CREATE OR REPLACE FUNCTION c2m2.get_term_type_namespaces_fraction0()
RETURNS TABLE (
    srno            integer,
    table_name      text,
    term_type       text,
    dcc_short_label varchar,
    fraction        numeric
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

        RAISE NOTICE 'Processing %.% (SrNo=%)',
                     tbl, term_col, v_srno;

        sql := format($fmt$
            SELECT
                %s::integer AS srno,
                %L::text AS table_name,
                %L::text AS term_type,
                m.dcc_short_label,

                    COUNT(*) FILTER (
                        WHERE t.%I IS NOT NULL
                        AND trim(t.%I::text) <> ''
                    )::numeric
                    / NULLIF(COUNT(*), 0) AS fraction

            FROM c2m2.%I t

            JOIN c2m2.id_namespace_dcc_id m
                ON t.%I = m.id_namespace_id

            WHERE m.dcc_short_label IS NOT NULL

            GROUP BY m.dcc_short_label

            ORDER BY m.dcc_short_label
        $fmt$,
            v_srno,
            tbl,
            term_col,
            term_col,
            term_col,
            tbl,
            namespace_col
        );

        RETURN QUERY EXECUTE sql;

    END LOOP;

    RETURN;
END;
$$;


CALL c2m2.print_heading(
    'Creating term_type_namespaces_fraction0'
);

DROP TABLE IF EXISTS term_type_namespaces_fraction0;

CREATE TEMP TABLE term_type_namespaces_fraction0 AS
SELECT
    srno,
    table_name,
    term_type,
    dcc_short_label,
    fraction
FROM c2m2.get_term_type_namespaces_fraction0()
ORDER BY srno, dcc_short_label;


SELECT *
FROM term_type_namespaces_fraction0;


\copy (SELECT * FROM term_type_namespaces_fraction0 ORDER BY srno, dcc_short_label) TO 'term_type_namespaces_fraction0.tsv' WITH DELIMITER E'\t' NULL '' CSV HEADER;


---------------------------------------------------------
-- Create generic DCC pivot procedure for fractions
---------------------------------------------------------

DROP PROCEDURE IF EXISTS c2m2.create_dcc_pivot_fraction(text, text, text, text);

CREATE OR REPLACE PROCEDURE c2m2.create_dcc_pivot_fraction(
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

    ------------------------------------------------------
    -- Build one output column for each DCC
    ------------------------------------------------------

    EXECUTE format(
        $q$
        SELECT string_agg(
                   format(
                       'max(CASE WHEN dcc_short_label = %%L THEN
                            CASE
                                WHEN fraction IS NULL OR fraction = 0 THEN NULL
                                WHEN fraction = 1 THEN ''1''
                                WHEN fraction < 0.001 THEN to_char(fraction, ''9.99EEEE'')
                                ELSE to_char(fraction, ''FM0.000'')
                            END
                        END) AS %%I',
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

    ------------------------------------------------------
    -- Drop destination table if it already exists
    ------------------------------------------------------

    EXECUTE format(
        'DROP TABLE IF EXISTS %I',
        p_dest_table);


    ------------------------------------------------------
    -- Build pivot query
    ------------------------------------------------------

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


---------------------------------------------------------
-- Generate term-type fraction pivot table
---------------------------------------------------------

CALL c2m2.print_heading(
    'Creating term_type_namespaces_fraction_pivot'
);

CALL c2m2.create_dcc_pivot_fraction(
    'term_type_namespaces_fraction',
    'srno, table_name, term_type',
    'term_type_namespaces_fraction_pivot'
);


SELECT * FROM term_type_namespaces_fraction_pivot;


\copy (SELECT * FROM term_type_namespaces_fraction_pivot ORDER BY srno) TO 'term_type_namespaces_fraction_pivot.tsv' WITH DELIMITER E'\t' NULL '' CSV HEADER;

/*
Crosscheck using linux command:

Q: Now I want to do a crosscheck using the older output and newer output tables term_type_namespaces_pivot.tsv 
and term_type_namespaces_fraction_pivot.tsv. In term_type_namespaces_fraction_pivot.tsv, in 4th column onwards, 
if a cell is not-empty, then if I replace by y, I can compare the resulting file, say, 
term_type_namespaces_fraction_pivot_y.tsv, with term_type_namespaces_pivot.tsv. 
term_type_namespaces_fraction_pivot_y.tsv and term_type_namespaces_pivot.tsv should be indentical. 
What is the linux command to generate term_type_namespaces_fraction_pivot_y.tsv from term_type_namespaces_fraction_pivot.tsv.

awk -F'\t' 'BEGIN{OFS="\t"} NR==1{print; next} {for(i=4;i<=NF;i++) if($i!="") $i="y"; print}' \
    term_type_namespaces_fraction_pivot.tsv \
    > term_type_namespaces_fraction_pivot_y.tsv

diff -u term_type_namespaces_pivot.tsv term_type_namespaces_fraction_pivot_y.tsv
rm term_type_namespaces_fraction_pivot_y.tsv

*/

/* Need to fix the fraction

Q: I am going back to the sql code for calculating the fraction, i.e.,

------------ Current code goes here ---------------------

Note: After I implemented the function below based on help using these prompts, 
I went back to modify the above function, by renaming it to *_fraction0 and write 
a version in which for collection_*, we just get 1, as a user may not want to see a value > 1.

There is a problem in the way I calculate the fraction for table|term combination subject_disease|disease, 
because in such tables, all columns are required in all rows, so, naturally, the fraction will be one. 
For such cases, the denominator should be based on the unique values in local_id column of the 
corresponding main table such as c2m2.subject in this case. To facilitate this, I need to specify 
subject_disease|disease|subject to indicate in the 3rd part the name of the table whose local_id 
column should be looked for unique values (of course for that id_namespace). Usually, the 
corresponding main table in question is the part before the first _ e.g., subject for subject_disease or 
subject_role_taxonomy. However, there is a catch for collection and related tables such as collection_anatomy. 
There, c2m2.collection will have rows for others such as collection_disease. So, let us treat collection-related 
tables and terms as before. Think about the logic to deal with this situation (doesn't apply to collection). 
How will the code for the function change.

Yes, for subject_disease: your approach: "Under this definition, a subject with multiple disease associations 
counts only once in the numerator and once in the denominator." is correct.

For collection_anatomy, for the same collection_local_id, there can be several values for anatomy in 
different rows, so, the fraction using above approach can be actually more than 1. So, for collection_* tables, 
let it be just null or 1 as it was before. Let us not bother about it.

Actually, I have change of mind. For collection_* tables, I want to use the later approach, not the older one, 
but using that table itself, counting the unique collection_local_id (instead of count of rows) 
for that id_namespace or collection_id_namespace in the denominator; for numerator, row count is 
fine due to composite primary key. I understand that fraction could be more than 1 in some cases this way, 
and that is OK. I will explain that in a table caption. Modify that part of the code and write the code for 
the entire function.

Thanks, please write the updated code for the function c2m2.get_term_type_namespaces_fraction.

The above assumption is correct, assuming <entity> is project, file, subject or biosample

Taking example of c2m2.subject_disease table, yes the parent entity columns are: subject_local_id / subject_id_namespace. 
The corresponding columns in the associated parent table c2m2.subject are local_id/id_namespace. 
For, biosample_from_subject, I added one more: 
'biosample_from_subject|subject_local_id|biosample'.

Now, please explain the three blocks in if entity_tbl else ELSIF tbl else construct. Is ELSIF correct.

Can you include the relevant part of the code in the above explanation and also print an example with respect 
to one combination from each of the three categories.

I am calling this function c2m2.get_term_type_namespaces_fractionmore; Now using this write the code to get the temp table term_type_namespaces_fractionmore and then corresponding tsv file. Also, I assume we can still use the procedure c2m2.create_dcc_pivot_fraction to generate the temp table term_type_namespaces_fractionmore_pivot and the corresponding tsv file. Please write this additional code. I assume there is no need to write anew corresponding procedure.

*/

DROP FUNCTION IF EXISTS c2m2.get_term_type_namespaces_fractionmore();

CREATE OR REPLACE FUNCTION c2m2.get_term_type_namespaces_fractionmore()
RETURNS TABLE (
    srno integer,
    table_name text,
    term_type text,
    dcc_short_label varchar,
    fraction numeric
)
LANGUAGE plpgsql
AS $$
DECLARE
    table_column_pairs text[] := ARRAY[
        'subject|granularity',
        'subject|sex',
        'subject|ethnicity',
        'subject|age_at_enrollment',
        'biosample|anatomy',
        'biosample|biofluid',
        'biosample|sample_prep_method',
        'biosample_from_subject|age_at_sampling|biosample',
        'biosample_from_subject|subject_local_id|biosample',
        'file|file_format',
        'file|compression_format',
        'file|data_type',
        'file|assay_type',
        'file|analysis_type',
        'file|dbgap_study_id',

        'subject_disease|disease|subject',
        'subject_disease|association_type|subject',
        'subject_phenotype|phenotype|subject',
        'subject_role_taxonomy|role_id|subject',
        'subject_role_taxonomy|taxonomy_id|subject',
        'subject_substance|substance|subject',

        'biosample_disease|disease|biosample',
        'biosample_disease|association_type|biosample',
        'biosample_gene|gene|biosample',
        'biosample_protein|protein|biosample',
        'biosample_ptm|ptm|biosample',
        'biosample_substance|substance|biosample',

        'collection_anatomy|anatomy|collection',
        'collection_biofluid|biofluid|collection',
        'collection_compound|compound|collection',
        'collection_disease|disease|collection',
        'collection_gene|gene|collection',
        'collection_phenotype|phenotype|collection',
        'collection_protein|protein|collection',
        'collection_ptm|ptm|collection',
        'collection_substance|substance|collection',
        'collection_taxonomy|taxon|collection'
    ];

    pair text;
    tbl text;
    term_col text;
    entity_tbl text;
    namespace_col text;
    entity_local_col text;
    entity_namespace_col text;
    query_sql text;
    v_srno integer := 0;
BEGIN
    FOREACH pair IN ARRAY table_column_pairs
    LOOP
        v_srno := v_srno + 1;

        tbl := split_part(pair, '|', 1);
        term_col := split_part(pair, '|', 2);
        entity_tbl := split_part(pair, '|', 3);

        RAISE NOTICE 'Processing %.% % (SrNo=%)',
                     tbl, term_col, entity_tbl, v_srno;

        IF entity_tbl IS NULL OR entity_tbl = '' THEN

            -- Core/non-relationship tables:
            -- fraction of rows with a populated term.
            namespace_col := CASE
                WHEN tbl IN ('project', 'subject', 'biosample', 'collection', 'file')
                    THEN 'id_namespace'
                ELSE split_part(tbl, '_', 1) || '_id_namespace'
            END;

            query_sql := format(
                $q$
                SELECT
                    %L::text AS table_name,
                    %L::text AS term_type,
                    m.dcc_short_label,
                    COUNT(*) FILTER (
                        WHERE t.%I IS NOT NULL
                          AND trim(t.%I::text) <> ''
                    )::numeric / NULLIF(COUNT(*), 0) AS fraction
                FROM c2m2.%I t
                JOIN c2m2.id_namespace_dcc_id m
                  ON t.%I = m.id_namespace_id
                GROUP BY m.dcc_short_label
                $q$,
                tbl, term_col,
                term_col, term_col,
                tbl, namespace_col
            );

        ELSIF tbl LIKE 'collection\_%' ESCAPE '\'

        THEN

            -- collection_* relationship tables:
            -- numerator = rows with a populated term;
            -- denominator = distinct collection_local_id values
            -- in the same relationship table.
            query_sql := format(
                $q$
                WITH counts AS (
                    SELECT
                        m.dcc_short_label,
                        COUNT(*) FILTER (
                            WHERE t.%I IS NOT NULL
                              AND trim(t.%I::text) <> ''
                        )::numeric AS numerator,
                        COUNT(DISTINCT t.collection_local_id)::numeric
                            AS denominator
                    FROM c2m2.%I t
                    JOIN c2m2.id_namespace_dcc_id m
                      ON t.collection_id_namespace = m.id_namespace_id
                    GROUP BY m.dcc_short_label
                )
                SELECT
                    %L::text AS table_name,
                    %L::text AS term_type,
                    dcc_short_label,
                    numerator / NULLIF(denominator, 0) AS fraction
                FROM counts
                $q$,
                term_col, term_col,
                tbl,
                tbl, term_col
            );

        ELSE

            -- Other relationship tables:
            -- denominator = distinct parent entities in the parent table;
            -- numerator = distinct parent entities having at least one
            -- populated term in the relationship table.
            entity_local_col := entity_tbl || '_local_id';
            entity_namespace_col := entity_tbl || '_id_namespace';

            query_sql := format(
                $q$
                WITH denominator AS (
                    SELECT
                        m.dcc_short_label,
                        COUNT(DISTINCT e.local_id)::numeric AS entity_count
                    FROM c2m2.%I e
                    JOIN c2m2.id_namespace_dcc_id m
                      ON e.id_namespace = m.id_namespace_id
                    GROUP BY m.dcc_short_label
                ),
                numerator AS (
                    SELECT
                        m.dcc_short_label,
                        COUNT(DISTINCT t.%I)::numeric AS entity_count
                    FROM c2m2.%I t
                    JOIN c2m2.id_namespace_dcc_id m
                      ON t.%I = m.id_namespace_id
                    WHERE t.%I IS NOT NULL
                      AND trim(t.%I::text) <> ''
                    GROUP BY m.dcc_short_label
                )
                SELECT
                    %L::text AS table_name,
                    %L::text AS term_type,
                    d.dcc_short_label,
                    COALESCE(n.entity_count, 0)::numeric
                        / NULLIF(d.entity_count, 0) AS fraction
                FROM denominator d
                LEFT JOIN numerator n
                  ON n.dcc_short_label = d.dcc_short_label
                $q$,
                entity_tbl,
                entity_local_col,
                tbl,
                entity_namespace_col,
                term_col, term_col,
                tbl, term_col
            );

        END IF;

        RETURN QUERY EXECUTE format(
            'SELECT %s::integer,
                    q.table_name,
                    q.term_type,
                    q.dcc_short_label,
                    q.fraction
             FROM (%s) q',
            v_srno,
            query_sql
        );

    END LOOP;
END;
$$;

DROP TABLE IF EXISTS term_type_namespaces_fractionmore;

CREATE TEMP TABLE term_type_namespaces_fractionmore AS
SELECT * FROM c2m2.get_term_type_namespaces_fractionmore();

SELECT * from term_type_namespaces_fractionmore;

\COPY term_type_namespaces_fractionmore TO 'term_type_namespaces_fractionmore.tsv' WITH (FORMAT csv, DELIMITER E'\t', HEADER true);

CALL c2m2.create_dcc_pivot_fraction(
    'term_type_namespaces_fractionmore',
    'table_name, term_type',
    'term_type_namespaces_fractionmore_pivot'
);

SELECT * from term_type_namespaces_fractionmore_pivot;

\COPY term_type_namespaces_fractionmore_pivot TO 'term_type_namespaces_fractionmore_pivot.tsv' WITH (FORMAT csv, DELIMITER E'\t', HEADER true);

--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
------------------------ new and correct version of term_type_namespaces_fraction
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION c2m2.get_term_type_namespaces_fraction()
RETURNS TABLE (
    srno integer,
    table_name text,
    term_type text,
    dcc_short_label varchar,
    fraction numeric
)
LANGUAGE plpgsql
AS $$
DECLARE
    table_column_pairs text[] := ARRAY[
        'subject|granularity',
        'subject|sex',
        'subject|ethnicity',
        'subject|age_at_enrollment',
        'biosample|anatomy',
        'biosample|biofluid',
        'biosample|sample_prep_method',
        'biosample_from_subject|age_at_sampling|biosample',
        'biosample_from_subject|subject_local_id|biosample',
        'file|file_format',
        'file|compression_format',
        'file|data_type',
        'file|assay_type',
        'file|analysis_type',
        'file|dbgap_study_id',

        'subject_disease|disease|subject',
        'subject_disease|association_type|subject',
        'subject_phenotype|phenotype|subject',
        'subject_role_taxonomy|role_id|subject',
        'subject_role_taxonomy|taxonomy_id|subject',
        'subject_substance|substance|subject',

        'biosample_disease|disease|biosample',
        'biosample_disease|association_type|biosample',
        'biosample_gene|gene|biosample',
        'biosample_protein|protein|biosample',
        'biosample_ptm|ptm|biosample',
        'biosample_substance|substance|biosample',

        'collection_anatomy|anatomy|collection',
        'collection_biofluid|biofluid|collection',
        'collection_compound|compound|collection',
        'collection_disease|disease|collection',
        'collection_gene|gene|collection',
        'collection_phenotype|phenotype|collection',
        'collection_protein|protein|collection',
        'collection_ptm|ptm|collection',
        'collection_substance|substance|collection',
        'collection_taxonomy|taxon|collection'
    ];

    pair text;
    tbl text;
    term_col text;
    entity_tbl text;
    namespace_col text;
    entity_local_col text;
    entity_namespace_col text;
    query_sql text;
    v_srno integer := 0;
BEGIN
    FOREACH pair IN ARRAY table_column_pairs
    LOOP
        v_srno := v_srno + 1;

        tbl := split_part(pair, '|', 1);
        term_col := split_part(pair, '|', 2);
        entity_tbl := split_part(pair, '|', 3);

        RAISE NOTICE 'Processing %.% % (SrNo=%)',
                     tbl, term_col, entity_tbl, v_srno;

        IF (entity_tbl IS NULL OR entity_tbl = '')
           OR (tbl LIKE 'collection\_%' ESCAPE '\')
        THEN

            -- Core/non-relationship tables:
            -- fraction of rows with a populated term.
            namespace_col := CASE
                WHEN tbl IN ('project', 'subject', 'biosample', 'collection', 'file')
                    THEN 'id_namespace'
                ELSE split_part(tbl, '_', 1) || '_id_namespace'
            END;

            query_sql := format(
                $q$
                SELECT
                    %L::text AS table_name,
                    %L::text AS term_type,
                    m.dcc_short_label,
                    COUNT(*) FILTER (
                        WHERE t.%I IS NOT NULL
                          AND trim(t.%I::text) <> ''
                    )::numeric / NULLIF(COUNT(*), 0) AS fraction
                FROM c2m2.%I t
                JOIN c2m2.id_namespace_dcc_id m
                  ON t.%I = m.id_namespace_id
                GROUP BY m.dcc_short_label
                $q$,
                tbl, term_col,
                term_col, term_col,
                tbl, namespace_col
            );

        ELSE

            -- Other relationship tables:
            -- denominator = distinct parent entities in the parent table;
            -- numerator = distinct parent entities having at least one
            -- populated term in the relationship table.
            entity_local_col := entity_tbl || '_local_id';
            entity_namespace_col := entity_tbl || '_id_namespace';

            query_sql := format(
                $q$
                WITH denominator AS (
                    SELECT
                        m.dcc_short_label,
                        COUNT(DISTINCT e.local_id)::numeric AS entity_count
                    FROM c2m2.%I e
                    JOIN c2m2.id_namespace_dcc_id m
                      ON e.id_namespace = m.id_namespace_id
                    GROUP BY m.dcc_short_label
                ),
                numerator AS (
                    SELECT
                        m.dcc_short_label,
                        COUNT(DISTINCT t.%I)::numeric AS entity_count
                    FROM c2m2.%I t
                    JOIN c2m2.id_namespace_dcc_id m
                      ON t.%I = m.id_namespace_id
                    WHERE t.%I IS NOT NULL
                      AND trim(t.%I::text) <> ''
                    GROUP BY m.dcc_short_label
                )
                SELECT
                    %L::text AS table_name,
                    %L::text AS term_type,
                    d.dcc_short_label,
                    COALESCE(n.entity_count, 0)::numeric
                        / NULLIF(d.entity_count, 0) AS fraction
                FROM denominator d
                LEFT JOIN numerator n
                  ON n.dcc_short_label = d.dcc_short_label
                $q$,
                entity_tbl,
                entity_local_col,
                tbl,
                entity_namespace_col,
                term_col, term_col,
                tbl, term_col
            );

        END IF;

        RETURN QUERY EXECUTE format(
            'SELECT %s::integer,
                    q.table_name,
                    q.term_type,
                    q.dcc_short_label,
                    q.fraction
             FROM (%s) q',
            v_srno,
            query_sql
        );

    END LOOP;
END;
$$;

CALL c2m2.print_heading(
    'Creating term_type_namespaces_fraction'
);

DROP TABLE IF EXISTS term_type_namespaces_fraction;

CREATE TEMP TABLE term_type_namespaces_fraction AS
SELECT
    srno,
    table_name,
    term_type,
    dcc_short_label,
    fraction
FROM c2m2.get_term_type_namespaces_fraction()
ORDER BY srno, dcc_short_label;


SELECT * FROM term_type_namespaces_fraction;


\copy (SELECT * FROM term_type_namespaces_fraction ORDER BY srno, dcc_short_label) TO 'term_type_namespaces_fraction.tsv' WITH DELIMITER E'\t' NULL '' CSV HEADER;

---------------------------------------------------------
-- Generate term-type fraction pivot table
---------------------------------------------------------

CALL c2m2.print_heading(
    'Creating term_type_namespaces_fraction_pivot'
);

CALL c2m2.create_dcc_pivot_fraction(
    'term_type_namespaces_fraction',
    'srno, table_name, term_type',
    'term_type_namespaces_fraction_pivot'
);


SELECT * FROM term_type_namespaces_fraction_pivot;


\copy (SELECT * FROM term_type_namespaces_fraction_pivot ORDER BY srno) TO 'term_type_namespaces_fraction_pivot.tsv' WITH DELIMITER E'\t' NULL '' CSV HEADER;

