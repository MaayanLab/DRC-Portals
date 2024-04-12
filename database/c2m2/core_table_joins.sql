/* (Being in folder .../database/c2m2/) Run on psql as \i core_table_joins.sql */
/* Or on linux command prompt:psql -h localhost -U drc -d drc -p [5432|5433] -a -f core_table_joins.sql; */

drop table if exists c2m2.allCollection;

create table c2m2.allCollection
as select
    id_namespace, local_id, persistent_id, creation_time, abbreviation, name, description, has_time_series_data,
    project_id_namespace, project_local_id, anatomy, disease, gene, protein, taxon, compound
from
    c2m2.collection
    
    left join  
        c2m2.collection_defined_by_project
    on
        (c2m2.collection.local_id = c2m2.collection_defined_by_project.collection_local_id and
        c2m2.collection.id_namespace = c2m2.collection_defined_by_project.collection_id_namespace)

    left join  
        c2m2.collection_anatomy
    on
        c2m2.collection.local_id = c2m2.collection_anatomy.collection_local_id

    left join  --- collection_compound causes expansion
        c2m2.collection_compound
    on
        c2m2.collection.local_id = c2m2.collection_compound.collection_local_id

    left join  
        c2m2.collection_disease
    on
        c2m2.collection.local_id = c2m2.collection_disease.collection_local_id

    left join  
        c2m2.collection_gene
    on
        c2m2.collection.local_id = c2m2.collection_gene.collection_local_id

    left join  
        c2m2.collection_protein
    on
        c2m2.collection.local_id = c2m2.collection_protein.collection_local_id

    left join
        c2m2.collection_taxonomy
    on
        c2m2.collection.local_id = c2m2.collection_taxonomy.collection_local_id

        /* NOTE: see if collection_in_collection can be joined here */
;

/* 
drop table c2m2.allbiosample;

create table c2m2.allbiosample
as select 
    id_namespace, local_id, persistent_id, creation_time, 
    project_id_namespace, project_local_id, 
    collection_id_namespace, collection_local_id,
    subject_id_namespace, subject_local_id, age_at_sampling,
    sample_prep_method, anatomy, disease, association_type, gene
from
    c2m2.biosample
    
    left join  -- disease, association_type
        c2m2.biosample_disease
    on
        c2m2.biosample.local_id = c2m2.biosample_disease.biosample_local_id

    left join  -- age_at_sampling, subject_id_namespace, subject_local_id
        c2m2.biosample_from_subject
    on
        c2m2.biosample.local_id = c2m2.biosample_from_subject.biosample_local_id

    left join  -- gene
        c2m2.biosample_gene
    on
        c2m2.biosample.local_id = c2m2.biosample_gene.biosample_local_id

    left join  -- collection_id_namespace, collection_local_id
        c2m2.biosample_in_collection
    on
        c2m2.biosample.local_id = c2m2.biosample_in_collection.biosample_local_id

    left join  
        c2m2.biosample_substance
    on
        c2m2.biosample.local_id = c2m2.biosample_substance.biosample_local_id;

*/

-- drop table c2m2.allfile;

-- create table c2m2.allfile
-- as select 
-- id_namespace, local_id, project_id_namespace, project_local_id, persistent_id, creation_time, 
-- size_in_bytes, uncompressed_size_in_bytes, sha256, md5
-- filename, file_format, compression_format,
-- data_type, assay_type, analysis_type, mime_type, bundle_collection_id_namespace, bundle_collection_local_id, dbgap_study_id 

-- left join  -- biosample_id_namespace, biosample_local_id
--         c2m2.file_describes_biosample
--     on
--         c2m2.file.local_id = c2m2.file_describes_biosample.file_local_id

-- left join  -- biosample_id_namespace, biosample_local_id
--         c2m2.file_describes_biosample
--     on
--         c2m2.file.local_id = c2m2.file_describes_biosample.file_local_id

-- left join  -- collection_id_namespace, collection_local_id
--         c2m2.file_describes_collection
--     on
--         c2m2.file.local_id = c2m2.file_describes_collection.file_local_id

-- left join  -- subject_id_namespace, subject_local_id
--         c2m2.file_describes_subject
--     on
--         c2m2.file.local_id = c2m2.file_describes_subject.file_local_id

