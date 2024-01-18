--- COLUMNS TO SHOW TO USER ---

select *
-- id_namespace, local_id, project_id_namespace, project_local_id, creation_time, sample_prep_method, anatomy,
-- association_type, disease,
-- subject_id_namespace, subject_local_id, age_at_sampling,
-- gene,
-- collection_id_namespace, collection_local_id,
-- substance,
-- persistent_id

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
        /* we are not defining the new table fl2_biosample; just creating and populating it directly.
        We need to keep track of mapping of the columns in the new table as they related to the original tables.*/
    
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
    
--- CONDITIONS FOR SEARCH TERM ---

    where
        c2m2.anatomy.name like '%liver biopsy%' or
        c2m2.anatomy.description like '%liver biopsy%' or
        c2m2.gene.name like '%liver biopsy%' or
        c2m2.gene.description like '%liver biopsy%' or
        c2m2.disease.name like '%liver biopsy%' or
        c2m2.disease.description like '%liver biopsy%' or
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
