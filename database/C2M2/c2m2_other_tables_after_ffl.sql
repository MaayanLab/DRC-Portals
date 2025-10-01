set statement_timeout = 0;
/* DO NOT DELETE ANY OF THE COMMENTS */
/* 
run in psql as \i c2m2_other_tables_after_ffl.sql or on bash prompt:
psql -h localhost -U drc -d drc -p [5432|5433] -a -f c2m2_other_tables_after_ffl.sql
*/

--- This script generates other tables from the ffl tables, so, run this script only after ffl tables have been generated

------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------
--- To be able to use a shorter URL for record_info page, use md5 hash of the t part of the URL
--- e.g., https://dev.cfde.cloud/data/c2m2/search/record_info?q=intestine%20homo%20sapiens&t=dcc_name:4D%20NUCLEOME%20DATA%20COORDINATION%20AND%20INTEGRATION%20CENTER%7Cproject_local_id:12a92962-8265-4fc0-b2f8-cf14f05db58b%7Cdisease_name:Unspecified%7Cncbi_taxonomy_name:Homo%20sapiens%7Canatomy_name:colon%7Cgene_name:Unspecified%7Cprotein_name:Unspecified%7Ccompound_name:Unspecified%7Cdata_type_name:Unspecified%7Cassay_type_name:imaging%20assay
--- and use it as a primary key in an intermediate table to recover the q part
--- To estimate how many rows in such a table, consider unique combinations of all filter values, see c2m2_brainstorm.sql
--- both c2m2.c2m2.ffl_biosample_collection and c2m2.ffl_biosample_collection_cmp give the same count
--- select count(*) from (select distinct dcc_name, project_local_id, anatomy_name, ncbi_taxonomy_name, disease_name, biofluid_name, 
---    gene_name, protein_name, compound_name, data_type_name, assay_type_name from c2m2.ffl_biosample_collection_cmp);
DROP TABLE IF EXISTS c2m2.record_info_tparam;
WITH 
    allres AS (
        SELECT DISTINCT
        allres_full.dcc_name AS dcc_name,
        COALESCE(allres_full.project_local_id, 'Unspecified') AS project_local_id,
        COALESCE(allres_full.disease_name, 'Unspecified') AS disease_name,
        COALESCE(allres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name,
        COALESCE(allres_full.anatomy_name, 'Unspecified') AS anatomy_name,
        COALESCE(allres_full.biofluid_name, 'Unspecified') AS biofluid_name,
        COALESCE(allres_full.gene_name, 'Unspecified') AS gene_name,
        COALESCE(allres_full.protein_name, 'Unspecified') AS protein_name,
        COALESCE(allres_full.compound_name, 'Unspecified') AS compound_name,
        COALESCE(allres_full.data_type_name, 'Unspecified') AS data_type_name,
        COALESCE(allres_full.assay_type_name, 'Unspecified') AS assay_type_name
        FROM c2m2.ffl_biosample_collection_cmp AS allres_full
        ORDER BY dcc_name, project_local_id, disease_name, taxonomy_name, anatomy_name, biofluid_name, gene_name, 
            protein_name, compound_name, data_type_name, assay_type_name
    ),
    tparam_table as (
        select distinct
        concat_ws('', 'dcc_name:', allres.dcc_name, 
            '|project_local_id:', allres.project_local_id, 
            '|disease_name:', allres.disease_name, 
            '|ncbi_taxonomy_name:', allres.ncbi_taxonomy_name, 
            '|anatomy_name:', allres.anatomy_name, 
            '|biofluid_name:', allres.biofluid_name,
            '|gene_name:', allres.gene_name, 
            '|protein_name:', allres.protein_name,
            '|compound_name:', allres.compound_name, 
            '|data_type_name:', allres.data_type_name, 
            '|assay_type_name:', allres.assay_type_name) AS tparam
        from allres
    )
    CREATE TABLE c2m2.record_info_tparam as (select distinct md5(tparam) as id, tparam from tparam_table);

--- To make the id column as a primary key: delete null, check unique
DELETE FROM c2m2.record_info_tparam WHERE tparam IS NULL OR tparam = '';
ALTER TABLE c2m2.record_info_tparam ADD CONSTRAINT id_unique UNIQUE (id);
ALTER TABLE c2m2.record_info_tparam ADD CONSTRAINT id_pkey PRIMARY KEY (id);
