set statement_timeout = 0;
/* DO NOT DELETE ANY OF THE COMMENTS */
/* run in psql as \i collection_fully_flattened_allin1.sql */
/* Or on linux command prompt:psql -h localhost -U drc -d drc -p [5432|5433] -a -f collection_fully_flattened_allin1.sql; */

--- This builds a collection centric fully flattened table.
---
--- table name c2m2.ffl_collection means fully flattened collection

--- Mano: 2024/04/09: This script is based on the overall style of biosample_fully_flattened_allin1.sql, 
--- with customizations (especially the first few joins) for collections. The name and order of columns 
--- in ffl_collection is same as ffl_biosample, using null as appropriate, in the hope of being able to 
--- combine ffl_biosample and ffl_collection using union so that on the front one, one query interface will
--- be enough.

--- To make a copy, after adjusting the table name if needed, copy paste the code within /* */ on psql prompt 
/*
DROP TABLE IF EXISTS c2m2.ffl0_collection;
CREATE TABLE c2m2.ffl0_collection as (select distinct * from c2m2.ffl_collection);
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'ffl0_collection' AND indexname = 'ffl0_collection_idx_searchable') THEN
        CREATE INDEX ffl0_collection_idx_searchable ON c2m2.ffl0_collection USING gin(searchable);
    END IF;
END $$;
*/

/* See the script biosample_fully_flattened_allin1.sql for other relevant comments */
/* empty lines here to match line number in the script  biosample_fully_flattened_allin1.sql




    /**** IMPORTANT WARNING: It may appear that many nulls can be filled with content from 
    subject_in_collection, biosample_in_collection. But see file collection_queries.sql why 
    we will not include subject_in_collection and biosample_in_collection here as it creates discepancy 
    between end points such as anatomy reachable from biosample side vs. collection_anatomy side.
    ****/
*/

DROP TABLE IF EXISTS c2m2.ffl_collection;
CREATE TABLE c2m2.ffl_collection as (
select distinct
--- COLUMNS TO SHOW TO USER ---
    -- concatenate all and save to_tsvector as searchable
    to_tsvector(concat_ws('|', 
    null, null, /* c2m2.biosample.id_namespace, c2m2.biosample.local_id, */
    c2m2.collection_defined_by_project.project_id_namespace, c2m2.collection_defined_by_project.project_local_id, 
    null, null, /** c2m2.biosample.persistent_id, c2m2.biosample.creation_time,  **/
    null, /* c2m2.biosample.sample_prep_method */ c2m2.collection_anatomy.anatomy,
    c2m2.disease_association_type.id, /* use c2m2.disease_association_type.id */
    c2m2.disease.id, /* use c2m2.disease.id */
    null, null, /** c2m2.biosample_from_subject.subject_id_namespace, c2m2.biosample_from_subject.subject_local_id, **/
    null, /** c2m2.biosample_from_subject.age_at_sampling, **/
    c2m2.collection_gene.gene,
    c2m2.collection.id_namespace, c2m2.collection.local_id, 
    c2m2.collection_substance.substance, /** **/

    /* Include dcc_name and dcc_abbreviation in searchable or not */
    c2m2.dcc.dcc_name, c2m2.dcc.dcc_abbreviation, /* no need to include c2m2.dcc.dcc_description, */

    c2m2.anatomy.name, c2m2.anatomy.description, c2m2.anatomy.synonyms,
    c2m2.gene.name, c2m2.gene.description, c2m2.gene.synonyms,

    c2m2.protein.id, c2m2.protein.name, c2m2.protein.description, 
    c2m2.protein.synonyms, c2m2.protein.organism,

    c2m2.disease.name, c2m2.disease.description, c2m2.disease.synonyms,

    null, null, null, /** c2m2.subject.granularity, c2m2.subject.sex, c2m2.subject.ethnicity,  **/
    null, /** c2m2.subject.age_at_enrollment, **/

    c2m2.substance.name, c2m2.substance.description, 
    c2m2.substance.synonyms, c2m2.substance.compound,

    c2m2.compound.name, c2m2.compound.description, 
    c2m2.compound.synonyms,

    c2m2.project.persistent_id, c2m2.project.creation_time, 
    c2m2.project.name,  c2m2.project.abbreviation, c2m2.project.description, 

    c2m2.project_data_type.data_type_id, c2m2.project_data_type.data_type_name, c2m2.project_data_type.data_type_description,

    c2m2.collection_taxonomy.taxon, /** **/
    c2m2.ncbi_taxonomy.name, c2m2.ncbi_taxonomy.description, 
    c2m2.ncbi_taxonomy.synonyms,

    c2m2.collection.persistent_id, c2m2.collection.creation_time,
    c2m2.collection.name, c2m2.collection.abbreviation, 
    c2m2.collection.description, c2m2.collection.has_time_series_data,

    null, null, /** c2m2.sample_prep_method.name, c2m2.sample_prep_method.description, **/
    null, /** c2m2.sample_prep_method.synonyms, **/

    null, null, null, /** c2m2.subject_race.race, c2m2.subject_race_CV.name, c2m2.subject_race_CV.description, **/

    null, null, /** c2m2.subject_granularity.name, c2m2.subject_granularity.description, **/
    null, null, /** c2m2.subject_sex.name, c2m2.subject_sex.description, **/
    null, null, /** c2m2.subject_ethnicity.name, c2m2.subject_ethnicity.description, **/

    null, /** c2m2.subject_role_taxonomy.role_id, **/
    null, null, /** c2m2.subject_role.name, c2m2.subject_role.description, **/

    null, null, /** c2m2.disease_association_type.name, c2m2.disease_association_type.description, **/

    --- Mano: 2024/02/13
    null, /** c2m2.phenotype_association_type.id, **/ c2m2.phenotype.id,
    null, null, /** c2m2.phenotype_association_type.name, c2m2.phenotype_association_type.description, **/
    c2m2.phenotype.name, c2m2.phenotype.description, c2m2.phenotype.synonyms

    )) as searchable,
    -- sample_prep_method, anatomy, biosample_disease, gene, substance, sample_prep_method, disease_association_type, race, sex, ethnicity, granularity, role_id, taxonomy_id are IDs.
    null /* c2m2.biosample.id_namespace */ as biosample_id_namespace, null /* c2m2.biosample.local_id */ as biosample_local_id, 
    c2m2.collection_defined_by_project.project_id_namespace as project_id_namespace, c2m2.collection_defined_by_project.project_local_id as project_local_id, 
    null /* c2m2.biosample.persistent_id */ as biosample_persistent_id, null /* c2m2.biosample.creation_time */ as biosample_creation_time, 
    null /* c2m2.biosample.sample_prep_method */ as sample_prep_method, c2m2.collection_anatomy.anatomy as anatomy, 
    c2m2.disease_association_type.id AS disease_association_type, /* c2m2.disease_association_type.id is c2m2.biosample_disease.association_type or c2m2.subject_disease.association_type */
    c2m2.disease.id as disease, /* c2m2.disease.id is c2m2.biosample_disease.disease or c2m2.subject_disease.disease */
    null /* c2m2.biosample_from_subject.subject_id_namespace */ as subject_id_namespace, null /* c2m2.biosample_from_subject.subject_local_id */ as subject_local_id, 
    null /* c2m2.biosample_from_subject.age_at_sampling */ as biosample_age_at_sampling,
    c2m2.collection_gene.gene as gene,
    c2m2.collection.id_namespace as collection_id_namespace, c2m2.collection.local_id as collection_local_id,
    c2m2.collection_substance.substance as substance, /** **/

    c2m2.dcc.dcc_name as dcc_name, c2m2.dcc.dcc_abbreviation as dcc_abbreviation,

    c2m2.anatomy.name as anatomy_name,    c2m2.gene.name as gene_name,    

    c2m2.protein.id as protein, c2m2.protein.name as protein_name,

    c2m2.disease.name as disease_name,

    null /* c2m2.subject.granularity */ as subject_granularity, null /* c2m2.subject.sex */ as subject_sex, null /* c2m2.subject.ethnicity */ as subject_ethnicity, 
    null /* c2m2.subject.age_at_enrollment */ as subject_age_at_enrollment,

    c2m2.substance.name as substance_name, c2m2.substance.compound as substance_compound,

    c2m2.compound.name as compound_name,

    c2m2.project.persistent_id as project_persistent_id, c2m2.project.creation_time as project_creation_time, 
    c2m2.project.name as project_name,  c2m2.project.abbreviation as project_abbreviation, 

    c2m2.project_data_type.data_type_id as data_type_id, c2m2.project_data_type.data_type_name as data_type_name, 

    c2m2.collection_taxonomy.taxon as subject_role_taxonomy_taxonomy_id, /** **/ /* use shorter name: taxonomy_id? */
    c2m2.ncbi_taxonomy.name as ncbi_taxonomy_name,

    c2m2.collection.persistent_id as collection_persistent_id, c2m2.collection.creation_time as collection_creation_time,
    c2m2.collection.name as collection_name, c2m2.collection.abbreviation as collection_abbreviation, 
    c2m2.collection.has_time_series_data as collection_has_time_series_data,

    null /** c2m2.sample_prep_method.name **/ as sample_prep_method_name,

    null /** c2m2.subject_race.race **/ as subject_race, null /** c2m2.subject_race_CV.name **/ as subject_race_name,

    null /** c2m2.subject_granularity.name **/ as subject_granularity_name,
    null /** c2m2.subject_sex.name **/ as subject_sex_name,
    null /** c2m2.subject_ethnicity.name **/ as subject_ethnicity_name,

    null /** c2m2.subject_role_taxonomy.role_id **/ as subject_role_taxonomy_role_id, /* use shorter name: role_id? */
    null /** c2m2.subject_role.name **/ as subject_role_name, 

    null /** c2m2.disease_association_type.name **/ as disease_association_type_name,

    --- Mano: 2024/02/13
    null /** c2m2.phenotype_association_type.id **/ AS phenotype_association_type, c2m2.phenotype.id as phenotype, 
    null /** c2m2.phenotype_association_type.name **/ as phenotype_association_type_name,
    c2m2.phenotype.name as phenotype_name

from ---c2m2.fl_biosample --- Now, doing FULL JOIN of five key biosample-related tables here instead of in generating fl_biosample

--- FIRST PART USES LEFT JOIN instead of FULL JOIN: --- Mano: 2024/04/11: brought this part core_table_joins.sql
    c2m2.collection
    
    left join c2m2.collection_defined_by_project
    on (c2m2.collection.local_id = c2m2.collection_defined_by_project.collection_local_id and
        c2m2.collection.id_namespace = c2m2.collection_defined_by_project.collection_id_namespace)

    left join c2m2.collection_anatomy
    on (c2m2.collection.local_id = c2m2.collection_anatomy.collection_local_id and
        c2m2.collection.id_namespace = c2m2.collection_anatomy.collection_id_namespace)

    left join c2m2.collection_substance /* even if empty now; may have data in future */
    on (c2m2.collection.local_id = c2m2.collection_substance.collection_local_id and
        c2m2.collection.id_namespace = c2m2.collection_substance.collection_id_namespace)

    left join c2m2.collection_compound /* collection_compound causes expansion */
    on (c2m2.collection.local_id = c2m2.collection_compound.collection_local_id and
        c2m2.collection.id_namespace = c2m2.collection_compound.collection_id_namespace)

    left join c2m2.collection_disease
    on (c2m2.collection.local_id = c2m2.collection_disease.collection_local_id and
        c2m2.collection.id_namespace = c2m2.collection_disease.collection_id_namespace)

    left join c2m2.collection_gene
    on (c2m2.collection.local_id = c2m2.collection_gene.collection_local_id and
        c2m2.collection.id_namespace = c2m2.collection_gene.collection_id_namespace)

    left join c2m2.collection_protein /*** Not in ffl_biosample yet ***/
    on (c2m2.collection.local_id = c2m2.collection_protein.collection_local_id and
        c2m2.collection.id_namespace = c2m2.collection_protein.collection_id_namespace)

    left join c2m2.collection_taxonomy
    on (c2m2.collection.local_id = c2m2.collection_taxonomy.collection_local_id and
        c2m2.collection.id_namespace = c2m2.collection_taxonomy.collection_id_namespace)

    left join c2m2.collection_in_collection
    on (c2m2.collection.local_id = c2m2.collection_in_collection.subset_collection_local_id and
        c2m2.collection.id_namespace = c2m2.collection_in_collection.subset_collection_id_namespace)

--- SECOND PART USES LEFT JOIN as for ffl_biosample

--- JOIN ALL TABLES --- full outer join or inner join or left join or right join?

    --- Moved dcc to after project & project_in_project

    left join c2m2.anatomy
        on (c2m2.collection_anatomy.anatomy = c2m2.anatomy.id)

    --- Moved c2m2.disease to after c2m2.subject_disease

    --- c2m2.phenotype in case of subject

    left join c2m2.gene
        on (c2m2.collection_gene.gene = c2m2.gene.id)

    left join c2m2.protein
        on (c2m2.collection_protein.protein = c2m2.protein.id)

    left join c2m2.substance
        on (c2m2.collection_substance.substance = c2m2.substance.id)

    left join c2m2.compound
        on (c2m2.collection_compound.compound = c2m2.compound.id)

    left join c2m2.project
        on (c2m2.collection_defined_by_project.project_local_id = c2m2.project.local_id and
        c2m2.collection_defined_by_project.project_id_namespace = c2m2.project.id_namespace) 
        /* we are not defining the new table allCollection; just creating and populating it directly.
        We need to keep track of mapping of the columns in the new table as they relate to the original tables.*/
        --- THIS CAN BE A PROBLEM

    /* Mano: 2024/01/31: added project_in_project else cannot link to dcc ; without this was getting null for dcc */
    left join c2m2.project_in_project
        on (c2m2.project_in_project.child_project_local_id = c2m2.project.local_id and
        c2m2.project_in_project.child_project_id_namespace = c2m2.project.id_namespace) 

    /* Mano: 2024/03/04: added data_type */
    LEFT JOIN c2m2.project_data_type 
        ON (c2m2.project.local_id = c2m2.project_data_type.project_local_id AND 
        c2m2.project.id_namespace = c2m2.project_data_type.project_id_namespace)

    /* Mano: 2024/01/31: Moved dcc to here. */
    /* If only single project then project_in_project will be empty (only header row, so, 
    use OR to match with project.id_namespace. Should we require that there be at least one parent (dummy) project. */
    /* HMP has complex parent-child project structure; so don't match on project_local_id */
    /* Mano: 2024/04/12: add c2m2.collection.id_namespace & c2m2.collection_in_collection.superset_collection_id_namespace */
    left join c2m2.dcc
        on (( ---c2m2.project_in_project.parent_project_local_id = c2m2.dcc.project_local_id and
        c2m2.project_in_project.parent_project_id_namespace = c2m2.dcc.project_id_namespace) OR 
            (---c2m2.project.local_id = c2m2.dcc.project_local_id and
        c2m2.project.id_namespace = c2m2.dcc.project_id_namespace) OR
        (c2m2.collection.id_namespace = c2m2.dcc.project_id_namespace) OR
        (c2m2.collection_in_collection.superset_collection_id_namespace = c2m2.dcc.project_id_namespace))

    -------------------- Mano: 2024/04/12: Decided not to bring information from the table
    -------------------- subject, biosample, subject_in_collection, biosample_in_collection, biosample_from_subject
    -------------------- subject_role_taxonomy, etc. (these are non ontology/CV tables)
    --------------------Mano 2024/02/02 WARNING CHECK 2ND CONDITION OF JOIN ON
    /** left join c2m2.subject 
        on (c2m2.biosample_from_subject.subject_local_id = c2m2.subject.local_id and
        c2m2.biosample_from_subject.subject_id_namespace = c2m2.subject.id_namespace)
    **/
        --- original, till 2024/02/03: c2m2.fl_biosample.project_id_namespace = c2m2.subject.project_id_namespace)

    --- Mano: 2024/02/02 add subject_disease: 2024/04/11: collection_disease is already up there
    /** left join c2m2.subject_disease /* Could right-join make more sense here; likely no */
        on (c2m2.subject.local_id = c2m2.subject_disease.subject_local_id and
        c2m2.subject.id_namespace = c2m2.subject_disease.subject_id_namespace)
    **/
    --- EXTREMELY IMPORTANT: including c2m2.subject_disease has major implications 
    --- since it will be replicated for all biosamples related to that subject. For example, 
    --- one study/subject from MW has 3 diseases.
    --- select * from (select subject_id_namespace, subject_local_id, count(distinct disease) from c2m2.subject_disease group by subject_id_namespace,subject_local_id) tmp where count >2;
    --- select * from c2m2.subject where local_id = 'SU002857';
    --- select * from c2m2.subject_disease where subject_local_id = 'SU002857';
    --- https://www.metabolomicsworkbench.org/data/DRCCMetadata.php?Mode=Project&ProjectID=PR001713
    --- ON devmetabweb: select * from mw_disease where study_id = 'ST002750';
    ------------------------
    --- select count(*) from (select subject_id_namespace, subject_local_id, count(distinct disease) from c2m2.subject_disease group by subject_id_namespace,subject_local_id) tmp where count >1;
    --- About 7600 subjects (about 15%) have 2 disease associated with them. Thus, # rows will increase by about 15%.
    --- select local_id, c2m2.biosample_from_subject.subject_local_id, disease from c2m2.biosample left join c2m2.biosample_from_subject on c2m2.biosample.local_id = c2m2.biosample_from_subject.biosample_local_id left join c2m2.subject_disease on c2m2.biosample_from_subject.subject_local_id = c2m2.subject_disease.subject_local_id where c2m2.biosample_from_subject.subject_local_id = 'SU002857';
    --- IMPORTANT: Actually, most such rows are from kidsfirst and they have already it in both subject_disease and 
    --- biosample_disease. So, the number of rows increased only by about 1200, largely from MW (about 980 from subject_disease) 
    --- and 238 from subject_phenotype.

    --- Mano: 2024/02/09: fl_biosample.biosample_disease is biosample_disease.disease
    left join c2m2.disease
        on (c2m2.collection_disease.disease = c2m2.disease.id)

    /* join with subject_role_taxonomy and ncbi_taxonomy */
    --------------------Mano 2024/02/02 WARNING CHECK JOIN CONDITION use subject table instead of fl_biosample?
    /** left join c2m2.subject_role_taxonomy
        --- till 2024/02/03 on (c2m2.fl_biosample.subject_local_id = c2m2.subject_role_taxonomy.subject_local_id and
        on (c2m2.subject.local_id = c2m2.subject_role_taxonomy.subject_local_id and
        c2m2.subject.id_namespace = c2m2.subject_role_taxonomy.subject_id_namespace)
    **/

    left join c2m2.ncbi_taxonomy
        on (c2m2.collection_taxonomy.taxon = c2m2.ncbi_taxonomy.id)

    /** Mano: 2024/04/12: commented as null used corresponding to columns from these tables
    left join c2m2.collection
        on (c2m2.biosample_in_collection.collection_local_id = c2m2.collection.local_id and
        c2m2.biosample_in_collection.collection_id_namespace = c2m2.collection.id_namespace)
    
    left join c2m2.sample_prep_method
        on (c2m2.biosample.sample_prep_method = c2m2.sample_prep_method.id)

    --- Added the tables below to merge list on 2024/01/24
    left join c2m2.subject_race
        on (c2m2.subject.id_namespace = c2m2.subject_race.subject_id_namespace and
        c2m2.subject.local_id = c2m2.subject_race.subject_local_id)

    left join c2m2.subject_race_CV
        on (c2m2.subject_race.race = c2m2.subject_race_CV.id)

    left join c2m2.subject_granularity
        on (c2m2.subject.granularity = c2m2.subject_granularity.id)

    left join c2m2.subject_sex
        on (c2m2.subject.sex = c2m2.subject_sex.id)

    left join c2m2.subject_ethnicity
        on (c2m2.subject.ethnicity = c2m2.subject_ethnicity.id)

    left join c2m2.subject_role
        on (c2m2.subject_role_taxonomy.role_id = c2m2.subject_role.id)
    **/

    --- Mano: 2024/02/03: Now we have both biosample_disease and subject_disease
    /** Mano: 2024/04/12: commented as null used corresponding to columns from these tables
    left join c2m2.disease_association_type
        --- till 2024/02/03 on(c2m2.fl_biosample.disease_association_type = c2m2.disease_association_type.id)
        --- Note the AND part within each to make sure no extra matches # not sure if this is required but should not be a problem
        on((c2m2.biosample_disease.association_type = c2m2.disease_association_type.id
                AND c2m2.biosample_disease.disease = c2m2.disease.id) OR
           (c2m2.subject_disease.association_type = c2m2.disease_association_type.id
                AND c2m2.subject_disease.disease = c2m2.disease.id))

    --- Mano: 2024/02/13: Since we have subject details now, add subject_phenotype as well
    left join c2m2.subject_phenotype 
        on (c2m2.subject.local_id = c2m2.subject_phenotype.subject_local_id and
        c2m2.subject.id_namespace = c2m2.subject_phenotype.subject_id_namespace)
    --- IMPORTANT: including c2m2.subject_phenotype doesn't affect much
    --- since there is only one subject with more than one phenotype.
    --- select * from (select subject_id_namespace, subject_local_id, count(distinct phenotype) from c2m2.subject_phenotype group by subject_id_namespace,subject_local_id) tmp where count >2;
    --- select * from c2m2.subject where local_id = 'SU002654';
    --- select * from c2m2.subject_phenotype where subject_local_id = 'SU002654';
    --- select count(*) from (select subject_id_namespace, subject_local_id, count(distinct phenotype) from c2m2.subject_phenotype group by subject_id_namespace,subject_local_id) tmp where count >1;
    --- https://www.metabolomicsworkbench.org/data/DRCCMetadata.php?Mode=Project&ProjectID=PR001646
    --- ON devmetabweb: select * from mw_disease where study_id = 'ST002554';
    --- select distinct biosample_id_namespace, biosample_local_id, subject_local_id, disease, phenotype from c2m2.ffl_biosample where  subject_local_id = 'SU002654' ;
    --- For subject_local_id = 'SU002654', both 2 diseases and 2 phenotypes specified, so listing 
    --- all 2X2 pairs, even though they are like 1-1 disease-phenotype pairs. 412: Actually, 
    --- only 206 rows should be there. This can be avoided if we (MW; when preparing MW metadata) search in phenotype only 
    --- if disease is empty (i.e. no match), but cannot impose this restriction.
    **/

    --- Mano: 2024/02/13
    left join c2m2.phenotype
        on (c2m2.collection_phenotype.phenotype = c2m2.phenotype.id)

    --- Mano: 2024/02/13
    /** Mano: 2024/04/12: commented as null used corresponding to columns from these tables
    left join c2m2.phenotype_association_type
        on (c2m2.subject_phenotype.association_type = c2m2.phenotype_association_type.id
                AND c2m2.subject_phenotype.phenotype = c2m2.phenotype.id)
    **/

    /* Mano: 2024/02/13 Addition of subject_disease added about 981 more rows (from MW (kidsfirst already 
    had them included at biosample level too)), and subject_phenotype added 238 rows (all from MW)
    */
);

DO $$ 
BEGIN
    DROP INDEX IF EXISTS ffl_biosample_idx_searchable;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'ffl_biosample' 
    AND indexname = 'ffl_biosample_idx_searchable') THEN
        CREATE INDEX ffl_biosample_idx_searchable ON c2m2.ffl_biosample USING gin(searchable);
    END IF;
END $$;

--- Create additional indexes for columns used in the where clause
--- CREATE INDEX idx_columns ON table_name (column1, column2);
DO $$ 
BEGIN
    DROP INDEX IF EXISTS ffl_biosample_idx_dcc_sp_dis_ana;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'ffl_biosample' 
    AND indexname = 'ffl_biosample_idx_dcc_sp_dis_ana') THEN
        CREATE INDEX ffl_biosample_idx_dcc_sp_dis_ana ON c2m2.ffl_biosample USING 
        btree(dcc_name, ncbi_taxonomy_name, disease_name, anatomy_name);
    END IF;
END $$;

DO $$ 
BEGIN
    DROP INDEX IF EXISTS ffl_biosample_idx_dcc_proj_sp_dis_ana_gene_data;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'ffl_biosample' 
    AND indexname = 'ffl_biosample_idx_dcc_proj_sp_dis_ana_gene_data') THEN
        CREATE INDEX ffl_biosample_idx_dcc_proj_sp_dis_ana_gene_data ON c2m2.ffl_biosample USING 
        btree(dcc_name, project_local_id, ncbi_taxonomy_name, disease_name, anatomy_name, gene_name, data_type_name);
    END IF;
END $$;


--- To see table index names: select * from pg_indexes where schemaname = 'c2m2' and tablename = 'ffl_biosample';
--- To list all column names of a table:
--- SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'c2m2' AND table_name = 'file';
--- Find size of an index: SELECT pg_size_pretty(pg_relation_size('c2m2.ffl_biosample_idx_searchable')) AS index_size;
--- SELECT pg_size_pretty(pg_relation_size('c2m2.ffl_biosample_idx_dcc_sp_dis_ana')) AS index_size;

--- Prisma @@index ref: https://www.prisma.io/docs/orm/reference/prisma-schema-reference#index
--- See file drc-portals/prisma/schema.prisma: add the additional index ; doesn't seem to affect the speed

/* for syntax: 
where
        c2m2.ncbi_taxonomy.name like '%liver biopsy%' or
        c2m2.ncbi_taxonomy.description like '%liver biopsy%' or 
        c2m2.ncbi_taxonomy.synonyms like '%liver biopsy%' or

        --- file counts from different DCCs
        select id_namespace, count(local_id) from (select id_namespace, local_id from c2m2.file) group by id_namespace;
*/

/* Mano: 2024/01/24: All columns needed t make searchable; only some of these will be in the output explicitly
    c2m2.fl_biosample.id_namespace as biosample_id_namespace, c2m2.fl_biosample.local_id as biosample_local_id, 
    c2m2.fl_biosample.project_id_namespace as project_id_namespace, c2m2.fl_biosample.project_local_id as project_local_id, 
    c2m2.fl_biosample.persistent_id as biosample_persistent_id, c2m2.fl_biosample.creation_time as biosample_creation_time, 
    c2m2.fl_biosample.sample_prep_method as sample_prep_method, c2m2.fl_biosample.anatomy as anatomy, 
    c2m2.fl_biosample.disease_association_type AS biosample_disease_association_type, c2m2.fl_biosample.disease as disease,
    c2m2.fl_biosample.subject_id_namespace as subject_id_namespace, c2m2.fl_biosample.subject_local_id as subject_local_id, 
    c2m2.fl_biosample.age_at_sampling as biosample_age_at_sampling,
    c2m2.fl_biosample.gene as gene,
    c2m2.fl_biosample.collection_id_namespace as collection_id_namespace, c2m2.fl_biosample.collection_local_id as collection_local_id,
    c2m2.fl_biosample.substance as substance,

    c2m2.dcc.dcc_name as dcc_name, c2m2.dcc.dcc_abbreviation as dcc_abbreviation,

    c2m2.anatomy.name as anatomy_name, c2m2.anatomy.description as anatomy_description, c2m2.anatomy.synonyms as anatomy_synonyms,
    c2m2.gene.name as gene_name, c2m2.gene.description as gene_description, c2m2.gene.synonyms as gene_synonyms,
    c2m2.disease.name as disease_name, c2m2.disease.description as disease_description, c2m2.disease.synonyms as disease_synonyms,

    c2m2.subject.granularity as subject_granularity, c2m2.subject.sex as subject_sex, c2m2.subject.ethnicity as subject_ethnicity, 
    c2m2.subject.age_at_enrollment as subject_age_at_enrollment,

    c2m2.substance.name as substance_name, c2m2.substance.description as substance_description, 
    c2m2.substance.synonyms as substance_synonyms, c2m2.substance.compound as substance_compound,

    c2m2.compound.name as compound_name, c2m2.compound.description as compound_description, 
    c2m2.compound.synonyms as compound_synonyms,

    c2m2.project.name as project_name,  c2m2.project.abbreviation as project_abbreviation, c2m2.project.description as project_description, 

    c2m2.subject_role_taxonomy.taxonomy_id as subject_role_taxonomy_taxonomy_id,
    c2m2.ncbi_taxonomy.name as ncbi_taxonomy_name, c2m2.ncbi_taxonomy.description as ncbi_taxonomy_description, 
    c2m2.ncbi_taxonomy.synonyms as ncbi_taxonomy_synonyms,

    c2m2.collection.name as collection_name, c2m2.collection.abbreviation as collection_abbreviation, 
    c2m2.collection.description as collection_description, c2m2.collection.has_time_series_data as collection_has_time_series_data,

    c2m2.sample_prep_method.name as sample_prep_method_name, c2m2.sample_prep_method.description as sample_prep_method_description,
    c2m2.sample_prep_method.synonyms as sample_prep_method_synonyms,

    c2m2.subject_race.race as subject_race, c2m2.subject_race_CV.name as subject_race_name, c2m2.subject_race_CV.description as subject_race_description,

    c2m2.subject_granularity.name as subject_granularity_name, c2m2.subject_granularity.description as subject_granularity_description,
    c2m2.subject_sex.name as subject_sex_name, c2m2.subject_sex.description as subject_sex_description,
    c2m2.subject_ethnicity.name as subject_ethnicity_name, c2m2.subject_ethnicity.description as subject_ethnicity_description,

    c2m2.subject_role_taxonomy.role_id as subject_role_taxonomy_role_id,
    c2m2.subject_role.name as subject_role_name, c2m2.subject_role.description as subject_role_description, 

    c2m2.disease_association_type.name as disease_association_type_name, c2m2.disease_association_type.description as disease_association_type_description

    --- More than one disease related
    select bs.biosample_id_namespace, bs.biosample_local_id, bs.subject_local_id, bd.disease from c2m2.biosample_from_subject bs left join c2m2.biosample_disease bd on bs.biosample_local_id = bd.biosample_local_id where bs.subject_local_id = 'PT_2K21M65V';
    select * from c2m2.subject_disease where subject_id_namespace ilike '%kidsfirst%' limit 5;
    select * from c2m2.subject_disease where subject_local_id = 'PT_2K21M65V';

    select count(*) from (select distinct biosample_id_namespace, biosample_local_id, subject_local_id, 
        count(distinct disease) as count from c2m2.ffl_biosample where disease is not null group by 
        biosample_id_namespace, biosample_local_id, subject_local_id) tmp where tmp.count > 1;

    select * from (select distinct biosample_id_namespace, biosample_local_id, subject_local_id, 
        count(distinct disease) as count from c2m2.ffl_biosample where disease is not null 
        group by biosample_id_namespace, biosample_local_id, subject_local_id) tmp where count > 1 
        and biosample_id_namespace ilike '%metab%' limit 10000;

    select count(*) from (select distinct biosample_id_namespace, biosample_local_id, subject_local_id, 
        count(distinct disease) as count from c2m2.ffl_biosample where disease is not null group by biosample_id_namespace, 
        biosample_local_id, subject_local_id) tmp where tmp.count > 1 and tmp.biosample_id_namespace ilike '%kids%';
    select count(*) from (select distinct biosample_id_namespace, biosample_local_id, subject_local_id, 
        count(distinct disease) as count from c2m2.ffl_biosample where disease is not null group by biosample_id_namespace, 
        biosample_local_id, subject_local_id) tmp where tmp.count > 1 and tmp.biosample_id_namespace ilike '%metab%';
    select distinct biosample_id_namespace, biosample_local_id, subject_local_id, disease, phenotype from c2m2.ffl_biosample 
    where  subject_local_id = 'SU002654' ;

    select distinct biosample_id_namespace, biosample_local_id, subject_local_id, disease, phenotype from c2m2.ffl_biosample 
    where  biosample_id_namespace ilike '%metab%'  and (disease is not null OR phenotype is not null);

*/

/* */
