--- COLUMNS TO SHOW TO USER ---

select 
    c2m2.fl_biosample.id_namespace as biosample_id_namespace, c2m2.fl_biosample.local_id as biosample_local_id, 
    c2m2.fl_biosample.project_id_namespace as project_id_namespace, c2m2.fl_biosample.project_local_id as project_local_id, 
    c2m2.fl_biosample.persistent_id as biosample_persistent_id, c2m2.fl_biosample.creation_time as biosample_creation_time, sample_prep_method, anatomy,
    association_type, disease,
    -- subject_id_namespace, subject_local_id, age_at_sampling,
    gene,
    collection_id_namespace, collection_local_id,
    substance,
    c2m2.anatomy.name as anatomy_name, c2m2.anatomy.description as anatomy_description, c2m2.anatomy.synonyms as anatomy_synonyms,
    c2m2.gene.name as gene_name, c2m2.gene.description as gene_description, c2m2.gene.synonyms as gene_synonyms,
    c2m2.disease.name as disease_name, c2m2.disease.description as disease_description, c2m2.disease.synonyms as disease_synonyms,
    c2m2.subject.granularity as subject_granularity, c2m2.subject.sex as subject_sex, c2m2.subject.ethnicity as subject_ethnicity, 
    c2m2.subject.age_at_enrollment as subject_age_at_enrollment,
    c2m2.substance.name as substance_name, c2m2.substance.description as substance_description, 
    c2m2.substance.synonyms as substance_synonyms, c2m2.substance.compound as substance_compound,
    c2m2.project.name as project_name, c2m2.project.description as project_description,
    c2m2.ncbi_taxonomy.name as ncbi_taxonomy_name, c2m2.ncbi_taxonomy.description as ncbi_taxonomy_description, 
    c2m2.ncbi_taxonomy.synonyms as ncbi_taxonomy_synonyms,
    c2m2.collection.name as collection_name, c2m2.collection.description as collection_description,
    c2m2.sample_prep_method.name as sample_prep_method_name, c2m2.sample_prep_method.description as sample_prep_method_description, 
    c2m2.sample_prep_method.synonyms as sample_prep_method_synonyms
    -- keep adding other column names (I am going in the order of the table)

from c2m2.fl_biosample 

--- JOIN ALL TABLES ---

    full join c2m2.anatomy
        on (c2m2.fl_biosample.anatomy = c2m2.anatomy.id)

    full join c2m2.disease
        on (c2m2.fl_biosample.disease = c2m2.disease.id)

    full join c2m2.gene
        on (c2m2.fl_biosample.gene = c2m2.gene.id)

    full join c2m2.substance
        on (c2m2.fl_biosample.substance = c2m2.substance.id)

    full join c2m2.project
        on (c2m2.fl_biosample.project_local_id = c2m2.project.local_id and
        c2m2.fl_biosample.project_id_namespace = c2m2.project.id_namespace) 
        /* we are not defining the new table fl_biosample; just creating and populating it directly.
        We need to keep track of mapping of the columns in the new table as they relate to the original tables.*/
    
    full join c2m2.subject
        on (c2m2.fl_biosample.subject_local_id = c2m2.subject.local_id and
        c2m2.fl_biosample.project_id_namespace = c2m2.subject.project_id_namespace)

    /* join with subject_role_taxonomy and ncbi_taxonomy */
    full join c2m2.subject_role_taxonomy
        on (c2m2.fl_biosample.subject_local_id = c2m2.subject_role_taxonomy.subject_local_id and
        c2m2.subject.id_namespace = c2m2.subject_role_taxonomy.subject_id_namespace)

    full join c2m2.ncbi_taxonomy
        on (c2m2.subject_role_taxonomy.taxonomy_id = c2m2.ncbi_taxonomy.id)

    full join c2m2.collection
        on (c2m2.fl_biosample.collection_local_id = c2m2.collection.local_id)
    
    full join c2m2.sample_prep_method
        on (c2m2.fl_biosample.sample_prep_method = c2m2.sample_prep_method.id)

    /* Do not join with subject_race yet since race.tsv is not created and ingested (or directly created using psql) */
    /* Same thing for the sex and ethnicity tables */

--- CONDITIONS FOR SEARCH TERM ---

    where
        c2m2.anatomy.name like '%liver biopsy%' or
        c2m2.anatomy.description like '%liver biopsy%' or
        c2m2.anatomy.synonyms like '%liver biopsy%' or

        c2m2.gene.name like '%liver biopsy%' or
        c2m2.gene.description like '%liver biopsy%' or
        c2m2.gene.synonyms like '%liver biopsy%' or

        c2m2.disease.name like '%liver biopsy%' or
        c2m2.disease.description like '%liver biopsy%' or
        c2m2.disease.synonyms like '%liver biopsy%' or

        c2m2.subject.sex like '%liver biopsy%' or
        c2m2.subject.ethnicity like '%liver biopsy%' or

        c2m2.project.name like '%liver biopsy%' or
        c2m2.project.abbreviation like '%liver biopsy%' or
        c2m2.project.description like '%liver biopsy%' or 

        c2m2.collection.name like '%liver biopsy%' or
        c2m2.collection.abbreviation like '%liver biopsy%' or
        c2m2.collection.description like '%liver biopsy%' or

        c2m2.sample_prep_method.name like '%liver biopsy%' or
        c2m2.sample_prep_method.description like '%liver biopsy%'
        limit 5;
