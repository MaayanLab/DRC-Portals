/* run in psql as \i biosample_fully_flattened.sql */
---
--- Make it project cetnric; most tables are already included in this biosample centrix flattening
---
--- table name c2m2.ffl_biosample means fully flattened biosample
DROP TABLE IF EXISTS c2m2.ffl_biosample;
CREATE TABLE c2m2.ffl_biosample as (
select distinct
--- COLUMNS TO SHOW TO USER ---
    -- concatenate all and save to_tsvector as searchable
    to_tsvector(concat_ws('|', c2m2.fl_biosample.id_namespace, c2m2.fl_biosample.local_id, 
    c2m2.fl_biosample.project_id_namespace, c2m2.fl_biosample.project_local_id, 
    c2m2.fl_biosample.persistent_id, c2m2.fl_biosample.creation_time, 
    c2m2.fl_biosample.sample_prep_method, c2m2.fl_biosample.anatomy, 
    c2m2.fl_biosample.association_type, c2m2.fl_biosample.disease,
    c2m2.fl_biosample.subject_id_namespace, c2m2.fl_biosample.subject_local_id, 
    c2m2.fl_biosample.age_at_sampling,
    c2m2.fl_biosample.gene,
    c2m2.fl_biosample.collection_id_namespace, c2m2.fl_biosample.collection_local_id,
    c2m2.fl_biosample.substance,

    c2m2.dcc.dcc_name, c2m2.dcc.dcc_abbreviation, /* no need to include c2m2.dcc.dcc_description, */

    c2m2.anatomy.name, c2m2.anatomy.description, c2m2.anatomy.synonyms,
    c2m2.gene.name, c2m2.gene.description, c2m2.gene.synonyms,
    c2m2.disease.name, c2m2.disease.description, c2m2.disease.synonyms,

    c2m2.subject.granularity, c2m2.subject.sex, c2m2.subject.ethnicity, 
    c2m2.subject.age_at_enrollment,

    c2m2.substance.name, c2m2.substance.description, 
    c2m2.substance.synonyms, c2m2.substance.compound,

    c2m2.compound.name, c2m2.compound.description, 
    c2m2.compound.synonyms,

    c2m2.project.name,  c2m2.project.abbreviation, c2m2.project.description, 

    c2m2.subject_role_taxonomy.taxonomy_id,
    c2m2.ncbi_taxonomy.name, c2m2.ncbi_taxonomy.description, 
    c2m2.ncbi_taxonomy.synonyms,

    c2m2.collection.name, c2m2.collection.abbreviation, 
    c2m2.collection.description, c2m2.collection.has_time_series_data,

    c2m2.sample_prep_method.name, c2m2.sample_prep_method.description,
    c2m2.sample_prep_method.synonyms,

    c2m2.subject_race.race, c2m2.subject_race_CV.name, c2m2.subject_race_CV.description,

    c2m2.subject_granularity.name, c2m2.subject_granularity.description,
    c2m2.subject_sex.name, c2m2.subject_sex.description,
    c2m2.subject_ethnicity.name, c2m2.subject_ethnicity.description,

    c2m2.subject_role_taxonomy.role_id,
    c2m2.subject_role.name, c2m2.subject_role.description, 

    c2m2.disease_association_type.name, c2m2.disease_association_type.description
    )) as searchable,
    -- sample_prep_method, anatomy, disease, gene, substance, sample_prep_method, association_type, race, sex, ethnicity, granularity, role_id, taxonomy_id are IDs.
    c2m2.fl_biosample.id_namespace as biosample_id_namespace, c2m2.fl_biosample.local_id as biosample_local_id, 
    c2m2.fl_biosample.project_id_namespace as project_id_namespace, c2m2.fl_biosample.project_local_id as project_local_id, 
    c2m2.fl_biosample.persistent_id as biosample_persistent_id, c2m2.fl_biosample.creation_time as biosample_creation_time, 
    c2m2.fl_biosample.sample_prep_method as sample_prep_method, c2m2.fl_biosample.anatomy as anatomy, 
    c2m2.fl_biosample.association_type AS biosample_disease_association_type, c2m2.fl_biosample.disease as disease,
    c2m2.fl_biosample.subject_id_namespace as subject_id_namespace, c2m2.fl_biosample.subject_local_id as subject_local_id, 
    c2m2.fl_biosample.age_at_sampling as biosample_age_at_sampling,
    c2m2.fl_biosample.gene as gene,
    c2m2.fl_biosample.collection_id_namespace as collection_id_namespace, c2m2.fl_biosample.collection_local_id as collection_local_id,
    c2m2.fl_biosample.substance as substance,

    c2m2.dcc.dcc_name as dcc_name, c2m2.dcc.dcc_abbreviation as dcc_abbreviation,

    c2m2.anatomy.name as anatomy_name,    c2m2.gene.name as gene_name,    c2m2.disease.name as disease_name,

    c2m2.subject.granularity as subject_granularity, c2m2.subject.sex as subject_sex, c2m2.subject.ethnicity as subject_ethnicity, 
    c2m2.subject.age_at_enrollment as subject_age_at_enrollment,

    c2m2.substance.name as substance_name, c2m2.substance.compound as substance_compound,

    c2m2.compound.name as compound_name,

    c2m2.project.name as project_name,  c2m2.project.abbreviation as project_abbreviation, 

    c2m2.subject_role_taxonomy.taxonomy_id as subject_role_taxonomy_taxonomy_id,
    c2m2.ncbi_taxonomy.name as ncbi_taxonomy_name,

    c2m2.collection.name as collection_name, c2m2.collection.abbreviation as collection_abbreviation, 
    c2m2.collection.has_time_series_data as collection_has_time_series_data,

    c2m2.sample_prep_method.name as sample_prep_method_name,

    c2m2.subject_race.race as subject_race, c2m2.subject_race_CV.name as subject_race_name,

    c2m2.subject_granularity.name as subject_granularity_name,
    c2m2.subject_sex.name as subject_sex_name,
    c2m2.subject_ethnicity.name as subject_ethnicity_name,

    c2m2.subject_role_taxonomy.role_id as subject_role_taxonomy_role_id,
    c2m2.subject_role.name as subject_role_name, 

    c2m2.disease_association_type.name as disease_association_type_name

from c2m2.fl_biosample 

--- JOIN ALL TABLES --- full outer join or inner join or left join or right join?

    left join c2m2.dcc
        on (c2m2.fl_biosample.project_id_namespace = c2m2.dcc.project_id_namespace)

    left join c2m2.anatomy
        on (c2m2.fl_biosample.anatomy = c2m2.anatomy.id)

    left join c2m2.disease
        on (c2m2.fl_biosample.disease = c2m2.disease.id)

    --- c2m2.phenotype in case of subject

    left join c2m2.gene
        on (c2m2.fl_biosample.gene = c2m2.gene.id)

    left join c2m2.substance
        on (c2m2.fl_biosample.substance = c2m2.substance.id)

    left join c2m2.compound
        on (c2m2.substance.compound = c2m2.compound.id)

    left join c2m2.project
        on (c2m2.fl_biosample.project_local_id = c2m2.project.local_id and
        c2m2.fl_biosample.project_id_namespace = c2m2.project.id_namespace) 
        /* we are not defining the new table fl_biosample; just creating and populating it directly.
        We need to keep track of mapping of the columns in the new table as they relate to the original tables.*/
    
    left join c2m2.subject /* Could right-join make more sense here; likely no */
        on (c2m2.fl_biosample.subject_local_id = c2m2.subject.local_id and
        c2m2.fl_biosample.project_id_namespace = c2m2.subject.project_id_namespace)

    /* join with subject_role_taxonomy and ncbi_taxonomy */
    left join c2m2.subject_role_taxonomy
        on (c2m2.fl_biosample.subject_local_id = c2m2.subject_role_taxonomy.subject_local_id and
        c2m2.subject.id_namespace = c2m2.subject_role_taxonomy.subject_id_namespace)

    left join c2m2.ncbi_taxonomy
        on (c2m2.subject_role_taxonomy.taxonomy_id = c2m2.ncbi_taxonomy.id)

    left join c2m2.collection
        on (c2m2.fl_biosample.collection_local_id = c2m2.collection.local_id and
        c2m2.fl_biosample.collection_id_namespace = c2m2.collection.id_namespace)
    
    left join c2m2.sample_prep_method
        on (c2m2.fl_biosample.sample_prep_method = c2m2.sample_prep_method.id)

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

    left join c2m2.disease_association_type
        on(c2m2.fl_biosample.association_type = c2m2.disease_association_type.id)

    --- c2m2.phenotype_association_type for subject
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'ffl_biosample' AND indexname = 'ffl_biosample_idx_searchable') THEN
        CREATE INDEX ffl_biosample_idx_searchable ON c2m2.ffl_biosample USING gin(searchable);
    END IF;
END $$;

/* for syntax: 
where
        c2m2.ncbi_taxonomy.name like '%liver biopsy%' or
        c2m2.ncbi_taxonomy.description like '%liver biopsy%' or 
        c2m2.ncbi_taxonomy.synonyms like '%liver biopsy%' or
*/

/* Mano: 2024/01/24: All columns needed t make searchable; only some of these will be in the output explicitly
    c2m2.fl_biosample.id_namespace as biosample_id_namespace, c2m2.fl_biosample.local_id as biosample_local_id, 
    c2m2.fl_biosample.project_id_namespace as project_id_namespace, c2m2.fl_biosample.project_local_id as project_local_id, 
    c2m2.fl_biosample.persistent_id as biosample_persistent_id, c2m2.fl_biosample.creation_time as biosample_creation_time, 
    c2m2.fl_biosample.sample_prep_method as sample_prep_method, c2m2.fl_biosample.anatomy as anatomy, 
    c2m2.fl_biosample.association_type AS biosample_disease_association_type, c2m2.fl_biosample.disease as disease,
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

*/