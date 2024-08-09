set statement_timeout = 0;
/* DO NOT DELETE ANY OF THE COMMENTS */
/* run in psql as \i compress_ffl_biosample_collection.sql */
/* Or on linux command prompt:psql -h localhost|servername -U drc -d drc  -p [5432|5433] -a -f compress_ffl_biosample_collection.sql; */

/* 
This makes sense only because biosample doesn't have a description. Wait, but collections 
have a description and it is important to search in that.
If you decide to create this table:
Once the table ffl_biosample_collection is ready, this compresses it by excluding columns 
which correspond to individual subjects or collections, so that the resulting table will 
have much lesser number of rows and the main query will be much faster. Construct its own searchable.
To think, should the searchable column of ffl_biosample_collection also include only 
non-biosample-specific columns?
*/

--- To figure out if it makes sense, find approx #rows in resulting table
select count(*) from (select distinct
project_id_namespace, project_local_id, sample_prep_method, anatomy, disease_association_type, disease, subject_id_namespace, subject_local_id, gene,
collection_id_namespace, collection_local_id, substance, dcc_name, dcc_abbreviation, anatomy_name, gene_name, protein, protein_name, disease_name, 
subject_granularity, subject_sex, subject_ethnicity, subject_age_at_enrollment, substance_name, substance_compound, compound_name, project_persistent_id, 
project_creation_time, project_name, project_abbreviation, data_type_id, data_type_name, subject_role_taxonomy_taxonomy_id, 
ncbi_taxonomy_name, collection_persistent_id, collection_creation_time, collection_name, collection_abbreviation, collection_has_time_series_data, 
sample_prep_method_name, subject_race, subject_race_name, subject_granularity_name, subject_sex_name, subject_ethnicity_name, subject_role_taxonomy_role_id, 
subject_role_name, disease_association_type_name, phenotype_association_type, phenotype, phenotype_association_type_name, phenotype_name
from c2m2.ffl_biosample_collection);
--- ~ 3M, less by just a factor of 2
select count(*) from c2m2.ffl_biosample_collection;
--- ~6M
select count(*) from c2m2.biosample; --- 1.9M
select count(*) from c2m2.collection; --- 0.26M
select count(*) from c2m2.biosample_in_collection; --- 98K

DROP TABLE IF EXISTS c2m2.ffl_biosample_collection_compressed;
CREATE TABLE c2m2.ffl_biosample_collection_compressed as (
select distinct
to_tsvector(concat_ws('|', 
'project_id_namespace', 'project_local_id', 'sample_prep_method', 'anatomy', 'disease_association_type', 'disease', 'subject_id_namespace', 'subject_local_id', 'gene', 'collection_id_namespace', 'collection_local_id', 'substance', 'dcc_name', 'dcc_abbreviation', 'anatomy_name', 'gene_name', 'protein', 'protein_name', 'disease_name', 
'subject_granularity', 'subject_sex', 'subject_ethnicity', 'subject_age_at_enrollment', 'substance_name', 'substance_compound', 'compound_name', 'project_persistent_id', 
'project_creation_time', 'project_name', 'project_abbreviation', 'data_type_id', 'data_type_name', 'subject_role_taxonomy_taxonomy_id', 
'ncbi_taxonomy_name', 'collection_persistent_id', 'collection_creation_time', 'collection_name', 'collection_abbreviation', 'collection_has_time_series_data', 'sample_prep_method_name', 'subject_race', 'subject_race_name', 'subject_granularity_name', 'subject_sex_name', 'subject_ethnicity_name', 'subject_role_taxonomy_role_id', 
'subject_role_name', 'disease_association_type_name', 'phenotype_association_type', 'phenotype', 'phenotype_association_type_name', 'phenotype_name'
)) as searchable,
project_id_namespace, project_local_id, sample_prep_method, anatomy, disease_association_type, disease, subject_id_namespace, subject_local_id, gene,
collection_id_namespace, collection_local_id, substance, dcc_name, dcc_abbreviation, anatomy_name, gene_name, protein, protein_name, disease_name, 
subject_granularity, subject_sex, subject_ethnicity, subject_age_at_enrollment, substance_name, substance_compound, compound_name, project_persistent_id, 
project_creation_time, project_name, project_abbreviation, data_type_id, data_type_name, subject_role_taxonomy_taxonomy_id, 
ncbi_taxonomy_name, collection_persistent_id, collection_creation_time, collection_name, collection_abbreviation, collection_has_time_series_data, 
sample_prep_method_name, subject_race, subject_race_name, subject_granularity_name, subject_sex_name, subject_ethnicity_name, subject_role_taxonomy_role_id, 
subject_role_name, disease_association_type_name, phenotype_association_type, phenotype, phenotype_association_type_name, phenotype_name
from c2m2.ffl_biosample_collection;

