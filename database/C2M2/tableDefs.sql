create table c2m2Metadata.file (id_namespace varchar(5000) default '',local_id varchar(5000) default '',project_id_namespace varchar(5000) default '',project_local_id varchar(5000) default '',persistent_id varchar(5000) default '',creation_time date default '',size_in_bytes bigint default null,uncompressed_size_in_bytes bigint default null,sha256 varchar(5000) default '',md5 varchar(5000) default '',filename varchar(5000) default '',file_format varchar(5000) default '',compression_format varchar(5000) default '',data_type varchar(5000) default '',assay_type varchar(5000) default '',analysis_type varchar(5000) default '',mime_type varchar(5000) default '',bundle_collection_id_namespace varchar(5000) default '',bundle_collection_local_id varchar(5000) default '',dbgap_study_id varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.biosample (id_namespace varchar(5000) default '',local_id varchar(5000) default '',project_id_namespace varchar(5000) default '',project_local_id varchar(5000) default '',persistent_id varchar(5000) default '',creation_time date default '',sample_prep_method varchar(5000) default '',anatomy varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.subject (id_namespace varchar(5000) default '',local_id varchar(5000) default '',project_id_namespace varchar(5000) default '',project_local_id varchar(5000) default '',persistent_id varchar(5000) default '',creation_time date default '',granularity varchar(5000) default '',sex varchar(5000) default '',ethnicity varchar(5000) default '',age_at_enrollment float8 default null, sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.dcc (id varchar(5000) default '',dcc_name varchar(5000) default '',dcc_abbreviation varchar(5000) default '',dcc_description varchar(5000) default '',contact_email varchar(5000) default '',contact_name varchar(5000) default '',dcc_url varchar(5000) default '',project_id_namespace varchar(5000) default '',project_local_id varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.project (id_namespace varchar(5000) default '',local_id varchar(5000) default '',persistent_id varchar(5000) default '',creation_time date default '',abbreviation varchar(5000) default '',name varchar(5000) default '',description varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.project_in_project (parent_project_id_namespace varchar(5000) default '',parent_project_local_id varchar(5000) default '',child_project_id_namespace varchar(5000) default '',child_project_local_id varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.collection (id_namespace varchar(5000) default '',local_id varchar(5000) default '',persistent_id varchar(5000) default '',creation_time date default '',abbreviation varchar(5000) default '',name varchar(5000) default '',description varchar(5000) default '',has_time_series_data bool default null, sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.collection_in_collection (superset_collection_id_namespace varchar(5000) default '',superset_collection_local_id varchar(5000) default '',subset_collection_id_namespace varchar(5000) default '',subset_collection_local_id varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.file_describes_collection (file_id_namespace varchar(5000) default '',file_local_id varchar(5000) default '',collection_id_namespace varchar(5000) default '',collection_local_id varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.collection_defined_by_project (collection_id_namespace varchar(5000) default '',collection_local_id varchar(5000) default '',project_id_namespace varchar(5000) default '',project_local_id varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.file_in_collection (file_id_namespace varchar(5000) default '',file_local_id varchar(5000) default '',collection_id_namespace varchar(5000) default '',collection_local_id varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.biosample_in_collection (biosample_id_namespace varchar(5000) default '',biosample_local_id varchar(5000) default '',collection_id_namespace varchar(5000) default '',collection_local_id varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.subject_in_collection (subject_id_namespace varchar(5000) default '',subject_local_id varchar(5000) default '',collection_id_namespace varchar(5000) default '',collection_local_id varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.file_describes_biosample (file_id_namespace varchar(5000) default '',file_local_id varchar(5000) default '',biosample_id_namespace varchar(5000) default '',biosample_local_id varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.file_describes_subject (file_id_namespace varchar(5000) default '',file_local_id varchar(5000) default '',subject_id_namespace varchar(5000) default '',subject_local_id varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.biosample_from_subject (biosample_id_namespace varchar(5000) default '',biosample_local_id varchar(5000) default '',subject_id_namespace varchar(5000) default '',subject_local_id varchar(5000) default '',age_at_sampling float8 default null, sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.biosample_disease (biosample_id_namespace varchar(5000) default '',biosample_local_id varchar(5000) default '',association_type varchar(5000) default '',disease varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.subject_disease (subject_id_namespace varchar(5000) default '',subject_local_id varchar(5000) default '',association_type varchar(5000) default '',disease varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.collection_disease (collection_id_namespace varchar(5000) default '',collection_local_id varchar(5000) default '',disease varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.collection_phenotype (collection_id_namespace varchar(5000) default '',collection_local_id varchar(5000) default '',phenotype varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.collection_gene (collection_id_namespace varchar(5000) default '',collection_local_id varchar(5000) default '',gene varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.collection_compound (collection_id_namespace varchar(5000) default '',collection_local_id varchar(5000) default '',compound varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.collection_substance (collection_id_namespace varchar(5000) default '',collection_local_id varchar(5000) default '',substance varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.collection_taxonomy (collection_id_namespace varchar(5000) default '',collection_local_id varchar(5000) default '',taxon varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.collection_anatomy (collection_id_namespace varchar(5000) default '',collection_local_id varchar(5000) default '',anatomy varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.collection_protein (collection_id_namespace varchar(5000) default '',collection_local_id varchar(5000) default '',protein varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.subject_phenotype (subject_id_namespace varchar(5000) default '',subject_local_id varchar(5000) default '',association_type varchar(5000) default '',phenotype varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.biosample_substance (biosample_id_namespace varchar(5000) default '',biosample_local_id varchar(5000) default '',substance varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.subject_substance (subject_id_namespace varchar(5000) default '',subject_local_id varchar(5000) default '',substance varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.biosample_gene (biosample_id_namespace varchar(5000) default '',biosample_local_id varchar(5000) default '',gene varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.phenotype_gene (phenotype varchar(5000) default '',gene varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.phenotype_disease (phenotype varchar(5000) default '',disease varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.subject_race (subject_id_namespace varchar(5000) default '',subject_local_id varchar(5000) default '',race varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.subject_role_taxonomy (subject_id_namespace varchar(5000) default '',subject_local_id varchar(5000) default '',role_id varchar(5000) default '',taxonomy_id varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.assay_type (id varchar(5000) default '',name varchar(5000) default '',description varchar(5000) default '',synonyms TEXT[] default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.analysis_type (id varchar(5000) default '',name varchar(5000) default '',description varchar(5000) default '',synonyms TEXT[] default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.ncbi_taxonomy (id varchar(5000) default '',clade varchar(5000) default '',name varchar(5000) default '',description varchar(5000) default '',synonyms TEXT[] default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.anatomy (id varchar(5000) default '',name varchar(5000) default '',description varchar(5000) default '',synonyms TEXT[] default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.file_format (id varchar(5000) default '',name varchar(5000) default '',description varchar(5000) default '',synonyms TEXT[] default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.data_type (id varchar(5000) default '',name varchar(5000) default '',description varchar(5000) default '',synonyms TEXT[] default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.disease (id varchar(5000) default '',name varchar(5000) default '',description varchar(5000) default '',synonyms TEXT[] default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.phenotype (id varchar(5000) default '',name varchar(5000) default '',description varchar(5000) default '',synonyms TEXT[] default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.compound (id varchar(5000) default '',name varchar(5000) default '',description varchar(5000) default '',synonyms TEXT[] default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.substance (id varchar(5000) default '',name varchar(5000) default '',description varchar(5000) default '',synonyms TEXT[] default '',compound varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.gene (id varchar(5000) default '',name varchar(5000) default '',description varchar(5000) default '',synonyms TEXT[] default '',organism varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.protein (id varchar(5000) default '',name varchar(5000) default '',description varchar(5000) default '',synonyms TEXT[] default '',organism varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.protein_gene (protein varchar(5000) default '',gene varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.sample_prep_method (id varchar(5000) default '',name varchar(5000) default '',description varchar(5000) default '',synonyms TEXT[] default '', sourceDCC varchar(100));
Table has been created successfully!
create table c2m2Metadata.id_namespace (id varchar(5000) default '',abbreviation varchar(5000) default '',name varchar(5000) default '',description varchar(5000) default '', sourceDCC varchar(100));
Table has been created successfully!
