DROP SCHEMA IF EXISTS c2m2 CASCADE;
CREATE SCHEMA IF NOT EXISTS c2m2;

/* Define the tables */
CREATE TABLE c2m2.file (
id_namespace VARCHAR NOT NULL, 
local_id VARCHAR NOT NULL, 
project_id_namespace VARCHAR NOT NULL, 
project_local_id VARCHAR NOT NULL, 
persistent_id VARCHAR DEFAULT '', 
creation_time VARCHAR DEFAULT '', 
size_in_bytes VARCHAR DEFAULT '', 
uncompressed_size_in_bytes VARCHAR DEFAULT '', 
sha256 VARCHAR DEFAULT '', 
md5 VARCHAR DEFAULT '', 
filename VARCHAR NOT NULL, 
file_format VARCHAR DEFAULT '', 
compression_format VARCHAR DEFAULT '', 
data_type VARCHAR DEFAULT '', 
assay_type VARCHAR DEFAULT '', 
analysis_type VARCHAR DEFAULT '', 
mime_type VARCHAR DEFAULT '', 
bundle_collection_id_namespace VARCHAR DEFAULT '', 
bundle_collection_local_id VARCHAR DEFAULT '', 
dbgap_study_id VARCHAR DEFAULT '',
PRIMARY KEY(id_namespace, local_id)
);

CREATE TABLE c2m2.biosample (
id_namespace VARCHAR NOT NULL, 
local_id VARCHAR NOT NULL, 
project_id_namespace VARCHAR NOT NULL, 
project_local_id VARCHAR NOT NULL, 
persistent_id VARCHAR DEFAULT '', 
creation_time VARCHAR DEFAULT '', 
sample_prep_method VARCHAR DEFAULT '', 
anatomy VARCHAR DEFAULT '', 
biofluid VARCHAR DEFAULT '',
PRIMARY KEY(id_namespace, local_id)
);

CREATE TABLE c2m2.subject (
id_namespace VARCHAR NOT NULL, 
local_id VARCHAR NOT NULL, 
project_id_namespace VARCHAR NOT NULL, 
project_local_id VARCHAR NOT NULL, 
persistent_id VARCHAR DEFAULT '', 
creation_time VARCHAR DEFAULT '', 
granularity VARCHAR NOT NULL, 
sex VARCHAR DEFAULT '', 
ethnicity VARCHAR DEFAULT '', 
age_at_enrollment VARCHAR DEFAULT '',
PRIMARY KEY(id_namespace, local_id)
);

CREATE TABLE c2m2.dcc (
id VARCHAR NOT NULL, 
dcc_name VARCHAR NOT NULL, 
dcc_abbreviation VARCHAR NOT NULL, 
dcc_description VARCHAR DEFAULT '', 
contact_email VARCHAR NOT NULL, 
contact_name VARCHAR NOT NULL, 
dcc_url VARCHAR NOT NULL, 
project_id_namespace VARCHAR NOT NULL, 
project_local_id VARCHAR NOT NULL,
PRIMARY KEY(id)
);

CREATE TABLE c2m2.project (
id_namespace VARCHAR NOT NULL, 
local_id VARCHAR NOT NULL, 
persistent_id VARCHAR DEFAULT '', 
creation_time VARCHAR DEFAULT '', 
abbreviation VARCHAR DEFAULT '', 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '',
PRIMARY KEY(id_namespace, local_id)
);

CREATE TABLE c2m2.project_in_project (
parent_project_id_namespace VARCHAR NOT NULL, 
parent_project_local_id VARCHAR NOT NULL, 
child_project_id_namespace VARCHAR NOT NULL, 
child_project_local_id VARCHAR NOT NULL,
PRIMARY KEY(parent_project_id_namespace, parent_project_local_id, child_project_id_namespace, child_project_local_id)
);

CREATE TABLE c2m2.collection (
id_namespace VARCHAR NOT NULL, 
local_id VARCHAR NOT NULL, 
persistent_id VARCHAR DEFAULT '', 
creation_time VARCHAR DEFAULT '', 
abbreviation VARCHAR DEFAULT '', 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
has_time_series_data VARCHAR DEFAULT '',
PRIMARY KEY(id_namespace, local_id)
);

CREATE TABLE c2m2.collection_in_collection (
superset_collection_id_namespace VARCHAR NOT NULL, 
superset_collection_local_id VARCHAR NOT NULL, 
subset_collection_id_namespace VARCHAR NOT NULL, 
subset_collection_local_id VARCHAR NOT NULL,
PRIMARY KEY(superset_collection_id_namespace, superset_collection_local_id, subset_collection_id_namespace, subset_collection_local_id)
);

CREATE TABLE c2m2.file_describes_collection (
file_id_namespace VARCHAR NOT NULL, 
file_local_id VARCHAR NOT NULL, 
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL,
PRIMARY KEY(file_id_namespace, file_local_id, collection_id_namespace, collection_local_id)
);

CREATE TABLE c2m2.collection_defined_by_project (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
project_id_namespace VARCHAR NOT NULL, 
project_local_id VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, project_id_namespace, project_local_id)
);

CREATE TABLE c2m2.file_in_collection (
file_id_namespace VARCHAR NOT NULL, 
file_local_id VARCHAR NOT NULL, 
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL,
PRIMARY KEY(file_id_namespace, file_local_id, collection_id_namespace, collection_local_id)
);

CREATE TABLE c2m2.biosample_in_collection (
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL, 
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL,
PRIMARY KEY(biosample_id_namespace, biosample_local_id, collection_id_namespace, collection_local_id)
);

CREATE TABLE c2m2.subject_in_collection (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL,
PRIMARY KEY(subject_id_namespace, subject_local_id, collection_id_namespace, collection_local_id)
);

CREATE TABLE c2m2.file_describes_biosample (
file_id_namespace VARCHAR NOT NULL, 
file_local_id VARCHAR NOT NULL, 
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL,
PRIMARY KEY(file_id_namespace, file_local_id, biosample_id_namespace, biosample_local_id)
);

CREATE TABLE c2m2.file_describes_subject (
file_id_namespace VARCHAR NOT NULL, 
file_local_id VARCHAR NOT NULL, 
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL,
PRIMARY KEY(file_id_namespace, file_local_id, subject_id_namespace, subject_local_id)
);

CREATE TABLE c2m2.biosample_from_subject (
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL, 
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
age_at_sampling VARCHAR DEFAULT '',
PRIMARY KEY(biosample_id_namespace, biosample_local_id, subject_id_namespace, subject_local_id)
);

CREATE TABLE c2m2.biosample_disease (
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL, 
association_type VARCHAR NOT NULL, 
disease VARCHAR NOT NULL,
PRIMARY KEY(biosample_id_namespace, biosample_local_id, association_type, disease)
);

CREATE TABLE c2m2.subject_disease (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
association_type VARCHAR NOT NULL, 
disease VARCHAR NOT NULL,
PRIMARY KEY(subject_id_namespace, subject_local_id, association_type, disease)
);

CREATE TABLE c2m2.collection_disease (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
disease VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, disease)
);

CREATE TABLE c2m2.collection_phenotype (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
phenotype VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, phenotype)
);

CREATE TABLE c2m2.collection_gene (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
gene VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, gene)
);

CREATE TABLE c2m2.collection_compound (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
compound VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, compound)
);

CREATE TABLE c2m2.collection_substance (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
substance VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, substance)
);

CREATE TABLE c2m2.collection_taxonomy (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
taxon VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, taxon)
);

CREATE TABLE c2m2.collection_anatomy (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
anatomy VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, anatomy)
);

CREATE TABLE c2m2.collection_biofluid (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
biofluid VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, biofluid)
);

CREATE TABLE c2m2.collection_protein (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
protein VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, protein)
);

CREATE TABLE c2m2.subject_phenotype (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
association_type VARCHAR NOT NULL, 
phenotype VARCHAR NOT NULL,
PRIMARY KEY(subject_id_namespace, subject_local_id, association_type, phenotype)
);

CREATE TABLE c2m2.biosample_substance (
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL, 
substance VARCHAR NOT NULL,
PRIMARY KEY(biosample_id_namespace, biosample_local_id, substance)
);

CREATE TABLE c2m2.subject_substance (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
substance VARCHAR NOT NULL,
PRIMARY KEY(subject_id_namespace, subject_local_id, substance)
);

CREATE TABLE c2m2.biosample_gene (
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL, 
gene VARCHAR NOT NULL,
PRIMARY KEY(biosample_id_namespace, biosample_local_id, gene)
);

CREATE TABLE c2m2.phenotype_gene (
phenotype VARCHAR NOT NULL, 
gene VARCHAR NOT NULL,
PRIMARY KEY(phenotype, gene)
);

CREATE TABLE c2m2.phenotype_disease (
phenotype VARCHAR NOT NULL, 
disease VARCHAR NOT NULL,
PRIMARY KEY(phenotype, disease)
);

CREATE TABLE c2m2.subject_race (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
race VARCHAR DEFAULT '',
PRIMARY KEY(subject_id_namespace, subject_local_id, race)
);

CREATE TABLE c2m2.subject_role_taxonomy (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
role_id VARCHAR NOT NULL, 
taxonomy_id VARCHAR NOT NULL,
PRIMARY KEY(subject_id_namespace, subject_local_id, role_id, taxonomy_id)
);

CREATE TABLE c2m2.assay_type (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2m2.analysis_type (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2m2.ncbi_taxonomy (
id VARCHAR NOT NULL, 
clade VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2m2.anatomy (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2m2.biofluid (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2m2.file_format (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2m2.data_type (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2m2.disease (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2m2.phenotype (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2m2.compound (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2m2.substance (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '', 
compound VARCHAR NOT NULL,
PRIMARY KEY(id)
);

CREATE TABLE c2m2.gene (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '', 
organism VARCHAR NOT NULL,
PRIMARY KEY(id)
);

CREATE TABLE c2m2.protein (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '', 
organism VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2m2.protein_gene (
protein VARCHAR NOT NULL, 
gene VARCHAR NOT NULL,
PRIMARY KEY(protein, gene)
);

CREATE TABLE c2m2.sample_prep_method (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2m2.id_namespace (
id VARCHAR NOT NULL, 
abbreviation VARCHAR DEFAULT '', 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

