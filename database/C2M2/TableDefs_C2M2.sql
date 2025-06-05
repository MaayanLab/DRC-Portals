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
access_url VARCHAR DEFAULT '',
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


/* Add foreign key constraints */
ALTER TABLE c2m2.file DROP CONSTRAINT IF EXISTS fk_file_id_namespace_1;
ALTER TABLE c2m2.file ADD CONSTRAINT  fk_file_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES c2m2.id_namespace (id) ON DELETE CASCADE;
ALTER TABLE c2m2.file DROP CONSTRAINT IF EXISTS fk_file_project_2;
ALTER TABLE c2m2.file ADD CONSTRAINT  fk_file_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES c2m2.project (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.file DROP CONSTRAINT IF EXISTS fk_file_file_format_3;
ALTER TABLE c2m2.file ADD CONSTRAINT  fk_file_file_format_3 FOREIGN KEY (file_format) REFERENCES c2m2.file_format (id) ON DELETE CASCADE;
ALTER TABLE c2m2.file DROP CONSTRAINT IF EXISTS fk_file_file_format_4;
ALTER TABLE c2m2.file ADD CONSTRAINT  fk_file_file_format_4 FOREIGN KEY (compression_format) REFERENCES c2m2.file_format (id) ON DELETE CASCADE;
ALTER TABLE c2m2.file DROP CONSTRAINT IF EXISTS fk_file_data_type_5;
ALTER TABLE c2m2.file ADD CONSTRAINT  fk_file_data_type_5 FOREIGN KEY (data_type) REFERENCES c2m2.data_type (id) ON DELETE CASCADE;
ALTER TABLE c2m2.file DROP CONSTRAINT IF EXISTS fk_file_assay_type_6;
ALTER TABLE c2m2.file ADD CONSTRAINT  fk_file_assay_type_6 FOREIGN KEY (assay_type) REFERENCES c2m2.assay_type (id) ON DELETE CASCADE;
ALTER TABLE c2m2.file DROP CONSTRAINT IF EXISTS fk_file_analysis_type_7;
ALTER TABLE c2m2.file ADD CONSTRAINT  fk_file_analysis_type_7 FOREIGN KEY (analysis_type) REFERENCES c2m2.analysis_type (id) ON DELETE CASCADE;
ALTER TABLE c2m2.file DROP CONSTRAINT IF EXISTS fk_file_collection_8;
ALTER TABLE c2m2.file ADD CONSTRAINT  fk_file_collection_8 FOREIGN KEY (bundle_collection_id_namespace, bundle_collection_local_id) REFERENCES c2m2.collection (id_namespace, local_id) ON DELETE CASCADE;

ALTER TABLE c2m2.biosample DROP CONSTRAINT IF EXISTS fk_biosample_id_namespace_1;
ALTER TABLE c2m2.biosample ADD CONSTRAINT  fk_biosample_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES c2m2.id_namespace (id) ON DELETE CASCADE;
ALTER TABLE c2m2.biosample DROP CONSTRAINT IF EXISTS fk_biosample_project_2;
ALTER TABLE c2m2.biosample ADD CONSTRAINT  fk_biosample_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES c2m2.project (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.biosample DROP CONSTRAINT IF EXISTS fk_biosample_sample_prep_method_3;
ALTER TABLE c2m2.biosample ADD CONSTRAINT  fk_biosample_sample_prep_method_3 FOREIGN KEY (sample_prep_method) REFERENCES c2m2.sample_prep_method (id) ON DELETE CASCADE;
ALTER TABLE c2m2.biosample DROP CONSTRAINT IF EXISTS fk_biosample_anatomy_4;
ALTER TABLE c2m2.biosample ADD CONSTRAINT  fk_biosample_anatomy_4 FOREIGN KEY (anatomy) REFERENCES c2m2.anatomy (id) ON DELETE CASCADE;
ALTER TABLE c2m2.biosample DROP CONSTRAINT IF EXISTS fk_biosample_biofluid_5;
ALTER TABLE c2m2.biosample ADD CONSTRAINT  fk_biosample_biofluid_5 FOREIGN KEY (biofluid) REFERENCES c2m2.biofluid (id) ON DELETE CASCADE;

ALTER TABLE c2m2.subject DROP CONSTRAINT IF EXISTS fk_subject_id_namespace_1;
ALTER TABLE c2m2.subject ADD CONSTRAINT  fk_subject_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES c2m2.id_namespace (id) ON DELETE CASCADE;
ALTER TABLE c2m2.subject DROP CONSTRAINT IF EXISTS fk_subject_project_2;
ALTER TABLE c2m2.subject ADD CONSTRAINT  fk_subject_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES c2m2.project (id_namespace, local_id) ON DELETE CASCADE;

ALTER TABLE c2m2.dcc DROP CONSTRAINT IF EXISTS fk_dcc_project_1;
ALTER TABLE c2m2.dcc ADD CONSTRAINT  fk_dcc_project_1 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES c2m2.project (id_namespace, local_id) ON DELETE CASCADE;

ALTER TABLE c2m2.project DROP CONSTRAINT IF EXISTS fk_project_id_namespace_1;
ALTER TABLE c2m2.project ADD CONSTRAINT  fk_project_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES c2m2.id_namespace (id) ON DELETE CASCADE;

ALTER TABLE c2m2.project_in_project DROP CONSTRAINT IF EXISTS fk_project_in_project_project_1;
ALTER TABLE c2m2.project_in_project ADD CONSTRAINT  fk_project_in_project_project_1 FOREIGN KEY (parent_project_id_namespace, parent_project_local_id) REFERENCES c2m2.project (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.project_in_project DROP CONSTRAINT IF EXISTS fk_project_in_project_project_2;
ALTER TABLE c2m2.project_in_project ADD CONSTRAINT  fk_project_in_project_project_2 FOREIGN KEY (child_project_id_namespace, child_project_local_id) REFERENCES c2m2.project (id_namespace, local_id) ON DELETE CASCADE;

ALTER TABLE c2m2.collection DROP CONSTRAINT IF EXISTS fk_collection_id_namespace_1;
ALTER TABLE c2m2.collection ADD CONSTRAINT  fk_collection_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES c2m2.id_namespace (id) ON DELETE CASCADE;

ALTER TABLE c2m2.collection_in_collection DROP CONSTRAINT IF EXISTS fk_collection_in_collection_collection_1;
ALTER TABLE c2m2.collection_in_collection ADD CONSTRAINT  fk_collection_in_collection_collection_1 FOREIGN KEY (superset_collection_id_namespace, superset_collection_local_id) REFERENCES c2m2.collection (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.collection_in_collection DROP CONSTRAINT IF EXISTS fk_collection_in_collection_collection_2;
ALTER TABLE c2m2.collection_in_collection ADD CONSTRAINT  fk_collection_in_collection_collection_2 FOREIGN KEY (subset_collection_id_namespace, subset_collection_local_id) REFERENCES c2m2.collection (id_namespace, local_id) ON DELETE CASCADE;

ALTER TABLE c2m2.file_describes_collection DROP CONSTRAINT IF EXISTS fk_file_describes_collection_file_1;
ALTER TABLE c2m2.file_describes_collection ADD CONSTRAINT  fk_file_describes_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES c2m2.file (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.file_describes_collection DROP CONSTRAINT IF EXISTS fk_file_describes_collection_collection_2;
ALTER TABLE c2m2.file_describes_collection ADD CONSTRAINT  fk_file_describes_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection (id_namespace, local_id) ON DELETE CASCADE;

ALTER TABLE c2m2.collection_defined_by_project DROP CONSTRAINT IF EXISTS fk_collection_defined_by_project_collection_1;
ALTER TABLE c2m2.collection_defined_by_project ADD CONSTRAINT  fk_collection_defined_by_project_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.collection_defined_by_project DROP CONSTRAINT IF EXISTS fk_collection_defined_by_project_project_2;
ALTER TABLE c2m2.collection_defined_by_project ADD CONSTRAINT  fk_collection_defined_by_project_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES c2m2.project (id_namespace, local_id) ON DELETE CASCADE;

ALTER TABLE c2m2.file_in_collection DROP CONSTRAINT IF EXISTS fk_file_in_collection_file_1;
ALTER TABLE c2m2.file_in_collection ADD CONSTRAINT  fk_file_in_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES c2m2.file (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.file_in_collection DROP CONSTRAINT IF EXISTS fk_file_in_collection_collection_2;
ALTER TABLE c2m2.file_in_collection ADD CONSTRAINT  fk_file_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection (id_namespace, local_id) ON DELETE CASCADE;

ALTER TABLE c2m2.biosample_in_collection DROP CONSTRAINT IF EXISTS fk_biosample_in_collection_biosample_1;
ALTER TABLE c2m2.biosample_in_collection ADD CONSTRAINT  fk_biosample_in_collection_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2m2.biosample (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.biosample_in_collection DROP CONSTRAINT IF EXISTS fk_biosample_in_collection_collection_2;
ALTER TABLE c2m2.biosample_in_collection ADD CONSTRAINT  fk_biosample_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection (id_namespace, local_id) ON DELETE CASCADE;

ALTER TABLE c2m2.subject_in_collection DROP CONSTRAINT IF EXISTS fk_subject_in_collection_subject_1;
ALTER TABLE c2m2.subject_in_collection ADD CONSTRAINT  fk_subject_in_collection_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2m2.subject (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.subject_in_collection DROP CONSTRAINT IF EXISTS fk_subject_in_collection_collection_2;
ALTER TABLE c2m2.subject_in_collection ADD CONSTRAINT  fk_subject_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection (id_namespace, local_id) ON DELETE CASCADE;

ALTER TABLE c2m2.file_describes_biosample DROP CONSTRAINT IF EXISTS fk_file_describes_biosample_file_1;
ALTER TABLE c2m2.file_describes_biosample ADD CONSTRAINT  fk_file_describes_biosample_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES c2m2.file (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.file_describes_biosample DROP CONSTRAINT IF EXISTS fk_file_describes_biosample_biosample_2;
ALTER TABLE c2m2.file_describes_biosample ADD CONSTRAINT  fk_file_describes_biosample_biosample_2 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2m2.biosample (id_namespace, local_id) ON DELETE CASCADE;

ALTER TABLE c2m2.file_describes_subject DROP CONSTRAINT IF EXISTS fk_file_describes_subject_file_1;
ALTER TABLE c2m2.file_describes_subject ADD CONSTRAINT  fk_file_describes_subject_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES c2m2.file (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.file_describes_subject DROP CONSTRAINT IF EXISTS fk_file_describes_subject_subject_2;
ALTER TABLE c2m2.file_describes_subject ADD CONSTRAINT  fk_file_describes_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2m2.subject (id_namespace, local_id) ON DELETE CASCADE;

ALTER TABLE c2m2.biosample_from_subject DROP CONSTRAINT IF EXISTS fk_biosample_from_subject_biosample_1;
ALTER TABLE c2m2.biosample_from_subject ADD CONSTRAINT  fk_biosample_from_subject_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2m2.biosample (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.biosample_from_subject DROP CONSTRAINT IF EXISTS fk_biosample_from_subject_subject_2;
ALTER TABLE c2m2.biosample_from_subject ADD CONSTRAINT  fk_biosample_from_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2m2.subject (id_namespace, local_id) ON DELETE CASCADE;

ALTER TABLE c2m2.biosample_disease DROP CONSTRAINT IF EXISTS fk_biosample_disease_biosample_1;
ALTER TABLE c2m2.biosample_disease ADD CONSTRAINT  fk_biosample_disease_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2m2.biosample (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.biosample_disease DROP CONSTRAINT IF EXISTS fk_biosample_disease_disease_2;
ALTER TABLE c2m2.biosample_disease ADD CONSTRAINT  fk_biosample_disease_disease_2 FOREIGN KEY (disease) REFERENCES c2m2.disease (id) ON DELETE CASCADE;

ALTER TABLE c2m2.subject_disease DROP CONSTRAINT IF EXISTS fk_subject_disease_subject_1;
ALTER TABLE c2m2.subject_disease ADD CONSTRAINT  fk_subject_disease_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2m2.subject (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.subject_disease DROP CONSTRAINT IF EXISTS fk_subject_disease_disease_2;
ALTER TABLE c2m2.subject_disease ADD CONSTRAINT  fk_subject_disease_disease_2 FOREIGN KEY (disease) REFERENCES c2m2.disease (id) ON DELETE CASCADE;

ALTER TABLE c2m2.collection_disease DROP CONSTRAINT IF EXISTS fk_collection_disease_collection_1;
ALTER TABLE c2m2.collection_disease ADD CONSTRAINT  fk_collection_disease_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.collection_disease DROP CONSTRAINT IF EXISTS fk_collection_disease_disease_2;
ALTER TABLE c2m2.collection_disease ADD CONSTRAINT  fk_collection_disease_disease_2 FOREIGN KEY (disease) REFERENCES c2m2.disease (id) ON DELETE CASCADE;

ALTER TABLE c2m2.collection_phenotype DROP CONSTRAINT IF EXISTS fk_collection_phenotype_collection_1;
ALTER TABLE c2m2.collection_phenotype ADD CONSTRAINT  fk_collection_phenotype_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.collection_phenotype DROP CONSTRAINT IF EXISTS fk_collection_phenotype_phenotype_2;
ALTER TABLE c2m2.collection_phenotype ADD CONSTRAINT  fk_collection_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES c2m2.phenotype (id) ON DELETE CASCADE;

ALTER TABLE c2m2.collection_gene DROP CONSTRAINT IF EXISTS fk_collection_gene_collection_1;
ALTER TABLE c2m2.collection_gene ADD CONSTRAINT  fk_collection_gene_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.collection_gene DROP CONSTRAINT IF EXISTS fk_collection_gene_gene_2;
ALTER TABLE c2m2.collection_gene ADD CONSTRAINT  fk_collection_gene_gene_2 FOREIGN KEY (gene) REFERENCES c2m2.gene (id) ON DELETE CASCADE;

ALTER TABLE c2m2.collection_compound DROP CONSTRAINT IF EXISTS fk_collection_compound_collection_1;
ALTER TABLE c2m2.collection_compound ADD CONSTRAINT  fk_collection_compound_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.collection_compound DROP CONSTRAINT IF EXISTS fk_collection_compound_compound_2;
ALTER TABLE c2m2.collection_compound ADD CONSTRAINT  fk_collection_compound_compound_2 FOREIGN KEY (compound) REFERENCES c2m2.compound (id) ON DELETE CASCADE;

ALTER TABLE c2m2.collection_substance DROP CONSTRAINT IF EXISTS fk_collection_substance_collection_1;
ALTER TABLE c2m2.collection_substance ADD CONSTRAINT  fk_collection_substance_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.collection_substance DROP CONSTRAINT IF EXISTS fk_collection_substance_substance_2;
ALTER TABLE c2m2.collection_substance ADD CONSTRAINT  fk_collection_substance_substance_2 FOREIGN KEY (substance) REFERENCES c2m2.substance (id) ON DELETE CASCADE;

ALTER TABLE c2m2.collection_taxonomy DROP CONSTRAINT IF EXISTS fk_collection_taxonomy_collection_1;
ALTER TABLE c2m2.collection_taxonomy ADD CONSTRAINT  fk_collection_taxonomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.collection_taxonomy DROP CONSTRAINT IF EXISTS fk_collection_taxonomy_ncbi_taxonomy_2;
ALTER TABLE c2m2.collection_taxonomy ADD CONSTRAINT  fk_collection_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxon) REFERENCES c2m2.ncbi_taxonomy (id) ON DELETE CASCADE;

ALTER TABLE c2m2.collection_anatomy DROP CONSTRAINT IF EXISTS fk_collection_anatomy_collection_1;
ALTER TABLE c2m2.collection_anatomy ADD CONSTRAINT  fk_collection_anatomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.collection_anatomy DROP CONSTRAINT IF EXISTS fk_collection_anatomy_anatomy_2;
ALTER TABLE c2m2.collection_anatomy ADD CONSTRAINT  fk_collection_anatomy_anatomy_2 FOREIGN KEY (anatomy) REFERENCES c2m2.anatomy (id) ON DELETE CASCADE;

ALTER TABLE c2m2.collection_biofluid DROP CONSTRAINT IF EXISTS fk_collection_biofluid_collection_1;
ALTER TABLE c2m2.collection_biofluid ADD CONSTRAINT  fk_collection_biofluid_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.collection_biofluid DROP CONSTRAINT IF EXISTS fk_collection_biofluid_biofluid_2;
ALTER TABLE c2m2.collection_biofluid ADD CONSTRAINT  fk_collection_biofluid_biofluid_2 FOREIGN KEY (biofluid) REFERENCES c2m2.biofluid (id) ON DELETE CASCADE;

ALTER TABLE c2m2.collection_protein DROP CONSTRAINT IF EXISTS fk_collection_protein_collection_1;
ALTER TABLE c2m2.collection_protein ADD CONSTRAINT  fk_collection_protein_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.collection_protein DROP CONSTRAINT IF EXISTS fk_collection_protein_protein_2;
ALTER TABLE c2m2.collection_protein ADD CONSTRAINT  fk_collection_protein_protein_2 FOREIGN KEY (protein) REFERENCES c2m2.protein (id) ON DELETE CASCADE;

ALTER TABLE c2m2.subject_phenotype DROP CONSTRAINT IF EXISTS fk_subject_phenotype_subject_1;
ALTER TABLE c2m2.subject_phenotype ADD CONSTRAINT  fk_subject_phenotype_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2m2.subject (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.subject_phenotype DROP CONSTRAINT IF EXISTS fk_subject_phenotype_phenotype_2;
ALTER TABLE c2m2.subject_phenotype ADD CONSTRAINT  fk_subject_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES c2m2.phenotype (id) ON DELETE CASCADE;

ALTER TABLE c2m2.biosample_substance DROP CONSTRAINT IF EXISTS fk_biosample_substance_biosample_1;
ALTER TABLE c2m2.biosample_substance ADD CONSTRAINT  fk_biosample_substance_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2m2.biosample (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.biosample_substance DROP CONSTRAINT IF EXISTS fk_biosample_substance_substance_2;
ALTER TABLE c2m2.biosample_substance ADD CONSTRAINT  fk_biosample_substance_substance_2 FOREIGN KEY (substance) REFERENCES c2m2.substance (id) ON DELETE CASCADE;

ALTER TABLE c2m2.subject_substance DROP CONSTRAINT IF EXISTS fk_subject_substance_subject_1;
ALTER TABLE c2m2.subject_substance ADD CONSTRAINT  fk_subject_substance_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2m2.subject (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.subject_substance DROP CONSTRAINT IF EXISTS fk_subject_substance_substance_2;
ALTER TABLE c2m2.subject_substance ADD CONSTRAINT  fk_subject_substance_substance_2 FOREIGN KEY (substance) REFERENCES c2m2.substance (id) ON DELETE CASCADE;

ALTER TABLE c2m2.biosample_gene DROP CONSTRAINT IF EXISTS fk_biosample_gene_biosample_1;
ALTER TABLE c2m2.biosample_gene ADD CONSTRAINT  fk_biosample_gene_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2m2.biosample (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.biosample_gene DROP CONSTRAINT IF EXISTS fk_biosample_gene_gene_2;
ALTER TABLE c2m2.biosample_gene ADD CONSTRAINT  fk_biosample_gene_gene_2 FOREIGN KEY (gene) REFERENCES c2m2.gene (id) ON DELETE CASCADE;

ALTER TABLE c2m2.phenotype_gene DROP CONSTRAINT IF EXISTS fk_phenotype_gene_phenotype_1;
ALTER TABLE c2m2.phenotype_gene ADD CONSTRAINT  fk_phenotype_gene_phenotype_1 FOREIGN KEY (phenotype) REFERENCES c2m2.phenotype (id) ON DELETE CASCADE;
ALTER TABLE c2m2.phenotype_gene DROP CONSTRAINT IF EXISTS fk_phenotype_gene_gene_2;
ALTER TABLE c2m2.phenotype_gene ADD CONSTRAINT  fk_phenotype_gene_gene_2 FOREIGN KEY (gene) REFERENCES c2m2.gene (id) ON DELETE CASCADE;

ALTER TABLE c2m2.phenotype_disease DROP CONSTRAINT IF EXISTS fk_phenotype_disease_phenotype_1;
ALTER TABLE c2m2.phenotype_disease ADD CONSTRAINT  fk_phenotype_disease_phenotype_1 FOREIGN KEY (phenotype) REFERENCES c2m2.phenotype (id) ON DELETE CASCADE;
ALTER TABLE c2m2.phenotype_disease DROP CONSTRAINT IF EXISTS fk_phenotype_disease_disease_2;
ALTER TABLE c2m2.phenotype_disease ADD CONSTRAINT  fk_phenotype_disease_disease_2 FOREIGN KEY (disease) REFERENCES c2m2.disease (id) ON DELETE CASCADE;

ALTER TABLE c2m2.subject_race DROP CONSTRAINT IF EXISTS fk_subject_race_subject_1;
ALTER TABLE c2m2.subject_race ADD CONSTRAINT  fk_subject_race_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2m2.subject (id_namespace, local_id) ON DELETE CASCADE;

ALTER TABLE c2m2.subject_role_taxonomy DROP CONSTRAINT IF EXISTS fk_subject_role_taxonomy_subject_1;
ALTER TABLE c2m2.subject_role_taxonomy ADD CONSTRAINT  fk_subject_role_taxonomy_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2m2.subject (id_namespace, local_id) ON DELETE CASCADE;
ALTER TABLE c2m2.subject_role_taxonomy DROP CONSTRAINT IF EXISTS fk_subject_role_taxonomy_ncbi_taxonomy_2;
ALTER TABLE c2m2.subject_role_taxonomy ADD CONSTRAINT  fk_subject_role_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxonomy_id) REFERENCES c2m2.ncbi_taxonomy (id) ON DELETE CASCADE;











ALTER TABLE c2m2.substance DROP CONSTRAINT IF EXISTS fk_substance_compound_1;
ALTER TABLE c2m2.substance ADD CONSTRAINT  fk_substance_compound_1 FOREIGN KEY (compound) REFERENCES c2m2.compound (id) ON DELETE CASCADE;

ALTER TABLE c2m2.gene DROP CONSTRAINT IF EXISTS fk_gene_ncbi_taxonomy_1;
ALTER TABLE c2m2.gene ADD CONSTRAINT  fk_gene_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES c2m2.ncbi_taxonomy (id) ON DELETE CASCADE;

ALTER TABLE c2m2.protein DROP CONSTRAINT IF EXISTS fk_protein_ncbi_taxonomy_1;
ALTER TABLE c2m2.protein ADD CONSTRAINT  fk_protein_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES c2m2.ncbi_taxonomy (id) ON DELETE CASCADE;

ALTER TABLE c2m2.protein_gene DROP CONSTRAINT IF EXISTS fk_protein_gene_protein_1;
ALTER TABLE c2m2.protein_gene ADD CONSTRAINT  fk_protein_gene_protein_1 FOREIGN KEY (protein) REFERENCES c2m2.protein (id) ON DELETE CASCADE;
ALTER TABLE c2m2.protein_gene DROP CONSTRAINT IF EXISTS fk_protein_gene_gene_2;
ALTER TABLE c2m2.protein_gene ADD CONSTRAINT  fk_protein_gene_gene_2 FOREIGN KEY (gene) REFERENCES c2m2.gene (id) ON DELETE CASCADE;



--- Adding COLUMN searchable to all tables

--- Adding COLUMN searchable to table c2m2.file
ALTER TABLE c2m2.file ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.file SET searchable = concat_ws('|', '', c2m2.file.local_id, c2m2.file.project_local_id, c2m2.file.persistent_id, c2m2.file.sha256, c2m2.file.md5, c2m2.file.filename, c2m2.file.file_format, c2m2.file.compression_format, c2m2.file.data_type, c2m2.file.assay_type, c2m2.file.analysis_type, c2m2.file.mime_type, c2m2.file.bundle_collection_local_id, c2m2.file.dbgap_study_id, c2m2.file.access_url);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_file_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'file' 
	AND indexname = 'c2m2_file_idx_searchable') THEN
		CREATE INDEX c2m2_file_idx_searchable ON c2m2.file USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.biosample
ALTER TABLE c2m2.biosample ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.biosample SET searchable = concat_ws('|', '', c2m2.biosample.local_id, c2m2.biosample.project_local_id, c2m2.biosample.persistent_id, c2m2.biosample.sample_prep_method, c2m2.biosample.anatomy, c2m2.biosample.biofluid);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_biosample_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'biosample' 
	AND indexname = 'c2m2_biosample_idx_searchable') THEN
		CREATE INDEX c2m2_biosample_idx_searchable ON c2m2.biosample USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.subject
ALTER TABLE c2m2.subject ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.subject SET searchable = concat_ws('|', '', c2m2.subject.local_id, c2m2.subject.project_local_id, c2m2.subject.persistent_id, c2m2.subject.granularity, c2m2.subject.sex, c2m2.subject.ethnicity, c2m2.subject.age_at_enrollment);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_subject_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'subject' 
	AND indexname = 'c2m2_subject_idx_searchable') THEN
		CREATE INDEX c2m2_subject_idx_searchable ON c2m2.subject USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.dcc
ALTER TABLE c2m2.dcc ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.dcc SET searchable = concat_ws('|', '', c2m2.dcc.id, c2m2.dcc.dcc_name, c2m2.dcc.dcc_abbreviation, c2m2.dcc.dcc_description, c2m2.dcc.contact_email, c2m2.dcc.contact_name, c2m2.dcc.dcc_url, c2m2.dcc.project_local_id);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_dcc_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'dcc' 
	AND indexname = 'c2m2_dcc_idx_searchable') THEN
		CREATE INDEX c2m2_dcc_idx_searchable ON c2m2.dcc USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.project
ALTER TABLE c2m2.project ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.project SET searchable = concat_ws('|', '', c2m2.project.local_id, c2m2.project.persistent_id, c2m2.project.abbreviation, c2m2.project.name, c2m2.project.description);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_project_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'project' 
	AND indexname = 'c2m2_project_idx_searchable') THEN
		CREATE INDEX c2m2_project_idx_searchable ON c2m2.project USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.project_in_project
ALTER TABLE c2m2.project_in_project ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.project_in_project SET searchable = concat_ws('|', '', c2m2.project_in_project.parent_project_local_id, c2m2.project_in_project.child_project_local_id);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_project_in_project_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'project_in_project' 
	AND indexname = 'c2m2_project_in_project_idx_searchable') THEN
		CREATE INDEX c2m2_project_in_project_idx_searchable ON c2m2.project_in_project USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.collection
ALTER TABLE c2m2.collection ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.collection SET searchable = concat_ws('|', '', c2m2.collection.local_id, c2m2.collection.persistent_id, c2m2.collection.abbreviation, c2m2.collection.name, c2m2.collection.description, c2m2.collection.has_time_series_data);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_collection_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'collection' 
	AND indexname = 'c2m2_collection_idx_searchable') THEN
		CREATE INDEX c2m2_collection_idx_searchable ON c2m2.collection USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.collection_in_collection
ALTER TABLE c2m2.collection_in_collection ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.collection_in_collection SET searchable = concat_ws('|', '', c2m2.collection_in_collection.superset_collection_local_id, c2m2.collection_in_collection.subset_collection_local_id);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_collection_in_collection_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'collection_in_collection' 
	AND indexname = 'c2m2_collection_in_collection_idx_searchable') THEN
		CREATE INDEX c2m2_collection_in_collection_idx_searchable ON c2m2.collection_in_collection USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.file_describes_collection
ALTER TABLE c2m2.file_describes_collection ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.file_describes_collection SET searchable = concat_ws('|', '', c2m2.file_describes_collection.file_local_id, c2m2.file_describes_collection.collection_local_id);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_file_describes_collection_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'file_describes_collection' 
	AND indexname = 'c2m2_file_describes_collection_idx_searchable') THEN
		CREATE INDEX c2m2_file_describes_collection_idx_searchable ON c2m2.file_describes_collection USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.collection_defined_by_project
ALTER TABLE c2m2.collection_defined_by_project ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.collection_defined_by_project SET searchable = concat_ws('|', '', c2m2.collection_defined_by_project.collection_local_id, c2m2.collection_defined_by_project.project_local_id);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_collection_defined_by_project_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'collection_defined_by_project' 
	AND indexname = 'c2m2_collection_defined_by_project_idx_searchable') THEN
		CREATE INDEX c2m2_collection_defined_by_project_idx_searchable ON c2m2.collection_defined_by_project USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.file_in_collection
ALTER TABLE c2m2.file_in_collection ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.file_in_collection SET searchable = concat_ws('|', '', c2m2.file_in_collection.file_local_id, c2m2.file_in_collection.collection_local_id);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_file_in_collection_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'file_in_collection' 
	AND indexname = 'c2m2_file_in_collection_idx_searchable') THEN
		CREATE INDEX c2m2_file_in_collection_idx_searchable ON c2m2.file_in_collection USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.biosample_in_collection
ALTER TABLE c2m2.biosample_in_collection ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.biosample_in_collection SET searchable = concat_ws('|', '', c2m2.biosample_in_collection.biosample_local_id, c2m2.biosample_in_collection.collection_local_id);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_biosample_in_collection_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'biosample_in_collection' 
	AND indexname = 'c2m2_biosample_in_collection_idx_searchable') THEN
		CREATE INDEX c2m2_biosample_in_collection_idx_searchable ON c2m2.biosample_in_collection USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.subject_in_collection
ALTER TABLE c2m2.subject_in_collection ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.subject_in_collection SET searchable = concat_ws('|', '', c2m2.subject_in_collection.subject_local_id, c2m2.subject_in_collection.collection_local_id);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_subject_in_collection_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'subject_in_collection' 
	AND indexname = 'c2m2_subject_in_collection_idx_searchable') THEN
		CREATE INDEX c2m2_subject_in_collection_idx_searchable ON c2m2.subject_in_collection USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.file_describes_biosample
ALTER TABLE c2m2.file_describes_biosample ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.file_describes_biosample SET searchable = concat_ws('|', '', c2m2.file_describes_biosample.file_local_id, c2m2.file_describes_biosample.biosample_local_id);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_file_describes_biosample_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'file_describes_biosample' 
	AND indexname = 'c2m2_file_describes_biosample_idx_searchable') THEN
		CREATE INDEX c2m2_file_describes_biosample_idx_searchable ON c2m2.file_describes_biosample USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.file_describes_subject
ALTER TABLE c2m2.file_describes_subject ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.file_describes_subject SET searchable = concat_ws('|', '', c2m2.file_describes_subject.file_local_id, c2m2.file_describes_subject.subject_local_id);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_file_describes_subject_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'file_describes_subject' 
	AND indexname = 'c2m2_file_describes_subject_idx_searchable') THEN
		CREATE INDEX c2m2_file_describes_subject_idx_searchable ON c2m2.file_describes_subject USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.biosample_from_subject
ALTER TABLE c2m2.biosample_from_subject ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.biosample_from_subject SET searchable = concat_ws('|', '', c2m2.biosample_from_subject.biosample_local_id, c2m2.biosample_from_subject.subject_local_id, c2m2.biosample_from_subject.age_at_sampling);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_biosample_from_subject_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'biosample_from_subject' 
	AND indexname = 'c2m2_biosample_from_subject_idx_searchable') THEN
		CREATE INDEX c2m2_biosample_from_subject_idx_searchable ON c2m2.biosample_from_subject USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.biosample_disease
ALTER TABLE c2m2.biosample_disease ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.biosample_disease SET searchable = concat_ws('|', '', c2m2.biosample_disease.biosample_local_id, c2m2.biosample_disease.association_type, c2m2.biosample_disease.disease);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_biosample_disease_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'biosample_disease' 
	AND indexname = 'c2m2_biosample_disease_idx_searchable') THEN
		CREATE INDEX c2m2_biosample_disease_idx_searchable ON c2m2.biosample_disease USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.subject_disease
ALTER TABLE c2m2.subject_disease ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.subject_disease SET searchable = concat_ws('|', '', c2m2.subject_disease.subject_local_id, c2m2.subject_disease.association_type, c2m2.subject_disease.disease);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_subject_disease_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'subject_disease' 
	AND indexname = 'c2m2_subject_disease_idx_searchable') THEN
		CREATE INDEX c2m2_subject_disease_idx_searchable ON c2m2.subject_disease USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.collection_disease
ALTER TABLE c2m2.collection_disease ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.collection_disease SET searchable = concat_ws('|', '', c2m2.collection_disease.collection_local_id, c2m2.collection_disease.disease);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_collection_disease_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'collection_disease' 
	AND indexname = 'c2m2_collection_disease_idx_searchable') THEN
		CREATE INDEX c2m2_collection_disease_idx_searchable ON c2m2.collection_disease USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.collection_phenotype
ALTER TABLE c2m2.collection_phenotype ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.collection_phenotype SET searchable = concat_ws('|', '', c2m2.collection_phenotype.collection_local_id, c2m2.collection_phenotype.phenotype);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_collection_phenotype_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'collection_phenotype' 
	AND indexname = 'c2m2_collection_phenotype_idx_searchable') THEN
		CREATE INDEX c2m2_collection_phenotype_idx_searchable ON c2m2.collection_phenotype USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.collection_gene
ALTER TABLE c2m2.collection_gene ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.collection_gene SET searchable = concat_ws('|', '', c2m2.collection_gene.collection_local_id, c2m2.collection_gene.gene);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_collection_gene_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'collection_gene' 
	AND indexname = 'c2m2_collection_gene_idx_searchable') THEN
		CREATE INDEX c2m2_collection_gene_idx_searchable ON c2m2.collection_gene USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.collection_compound
ALTER TABLE c2m2.collection_compound ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.collection_compound SET searchable = concat_ws('|', '', c2m2.collection_compound.collection_local_id, c2m2.collection_compound.compound);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_collection_compound_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'collection_compound' 
	AND indexname = 'c2m2_collection_compound_idx_searchable') THEN
		CREATE INDEX c2m2_collection_compound_idx_searchable ON c2m2.collection_compound USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.collection_substance
ALTER TABLE c2m2.collection_substance ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.collection_substance SET searchable = concat_ws('|', '', c2m2.collection_substance.collection_local_id, c2m2.collection_substance.substance);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_collection_substance_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'collection_substance' 
	AND indexname = 'c2m2_collection_substance_idx_searchable') THEN
		CREATE INDEX c2m2_collection_substance_idx_searchable ON c2m2.collection_substance USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.collection_taxonomy
ALTER TABLE c2m2.collection_taxonomy ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.collection_taxonomy SET searchable = concat_ws('|', '', c2m2.collection_taxonomy.collection_local_id, c2m2.collection_taxonomy.taxon);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_collection_taxonomy_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'collection_taxonomy' 
	AND indexname = 'c2m2_collection_taxonomy_idx_searchable') THEN
		CREATE INDEX c2m2_collection_taxonomy_idx_searchable ON c2m2.collection_taxonomy USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.collection_anatomy
ALTER TABLE c2m2.collection_anatomy ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.collection_anatomy SET searchable = concat_ws('|', '', c2m2.collection_anatomy.collection_local_id, c2m2.collection_anatomy.anatomy);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_collection_anatomy_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'collection_anatomy' 
	AND indexname = 'c2m2_collection_anatomy_idx_searchable') THEN
		CREATE INDEX c2m2_collection_anatomy_idx_searchable ON c2m2.collection_anatomy USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.collection_biofluid
ALTER TABLE c2m2.collection_biofluid ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.collection_biofluid SET searchable = concat_ws('|', '', c2m2.collection_biofluid.collection_local_id, c2m2.collection_biofluid.biofluid);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_collection_biofluid_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'collection_biofluid' 
	AND indexname = 'c2m2_collection_biofluid_idx_searchable') THEN
		CREATE INDEX c2m2_collection_biofluid_idx_searchable ON c2m2.collection_biofluid USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.collection_protein
ALTER TABLE c2m2.collection_protein ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.collection_protein SET searchable = concat_ws('|', '', c2m2.collection_protein.collection_local_id, c2m2.collection_protein.protein);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_collection_protein_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'collection_protein' 
	AND indexname = 'c2m2_collection_protein_idx_searchable') THEN
		CREATE INDEX c2m2_collection_protein_idx_searchable ON c2m2.collection_protein USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.subject_phenotype
ALTER TABLE c2m2.subject_phenotype ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.subject_phenotype SET searchable = concat_ws('|', '', c2m2.subject_phenotype.subject_local_id, c2m2.subject_phenotype.association_type, c2m2.subject_phenotype.phenotype);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_subject_phenotype_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'subject_phenotype' 
	AND indexname = 'c2m2_subject_phenotype_idx_searchable') THEN
		CREATE INDEX c2m2_subject_phenotype_idx_searchable ON c2m2.subject_phenotype USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.biosample_substance
ALTER TABLE c2m2.biosample_substance ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.biosample_substance SET searchable = concat_ws('|', '', c2m2.biosample_substance.biosample_local_id, c2m2.biosample_substance.substance);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_biosample_substance_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'biosample_substance' 
	AND indexname = 'c2m2_biosample_substance_idx_searchable') THEN
		CREATE INDEX c2m2_biosample_substance_idx_searchable ON c2m2.biosample_substance USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.subject_substance
ALTER TABLE c2m2.subject_substance ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.subject_substance SET searchable = concat_ws('|', '', c2m2.subject_substance.subject_local_id, c2m2.subject_substance.substance);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_subject_substance_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'subject_substance' 
	AND indexname = 'c2m2_subject_substance_idx_searchable') THEN
		CREATE INDEX c2m2_subject_substance_idx_searchable ON c2m2.subject_substance USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.biosample_gene
ALTER TABLE c2m2.biosample_gene ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.biosample_gene SET searchable = concat_ws('|', '', c2m2.biosample_gene.biosample_local_id, c2m2.biosample_gene.gene);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_biosample_gene_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'biosample_gene' 
	AND indexname = 'c2m2_biosample_gene_idx_searchable') THEN
		CREATE INDEX c2m2_biosample_gene_idx_searchable ON c2m2.biosample_gene USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.phenotype_gene
ALTER TABLE c2m2.phenotype_gene ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.phenotype_gene SET searchable = concat_ws('|', '', c2m2.phenotype_gene.phenotype, c2m2.phenotype_gene.gene);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_phenotype_gene_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'phenotype_gene' 
	AND indexname = 'c2m2_phenotype_gene_idx_searchable') THEN
		CREATE INDEX c2m2_phenotype_gene_idx_searchable ON c2m2.phenotype_gene USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.phenotype_disease
ALTER TABLE c2m2.phenotype_disease ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.phenotype_disease SET searchable = concat_ws('|', '', c2m2.phenotype_disease.phenotype, c2m2.phenotype_disease.disease);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_phenotype_disease_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'phenotype_disease' 
	AND indexname = 'c2m2_phenotype_disease_idx_searchable') THEN
		CREATE INDEX c2m2_phenotype_disease_idx_searchable ON c2m2.phenotype_disease USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.subject_race
ALTER TABLE c2m2.subject_race ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.subject_race SET searchable = concat_ws('|', '', c2m2.subject_race.subject_local_id, c2m2.subject_race.race);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_subject_race_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'subject_race' 
	AND indexname = 'c2m2_subject_race_idx_searchable') THEN
		CREATE INDEX c2m2_subject_race_idx_searchable ON c2m2.subject_race USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.subject_role_taxonomy
ALTER TABLE c2m2.subject_role_taxonomy ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.subject_role_taxonomy SET searchable = concat_ws('|', '', c2m2.subject_role_taxonomy.subject_local_id, c2m2.subject_role_taxonomy.role_id, c2m2.subject_role_taxonomy.taxonomy_id);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_subject_role_taxonomy_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'subject_role_taxonomy' 
	AND indexname = 'c2m2_subject_role_taxonomy_idx_searchable') THEN
		CREATE INDEX c2m2_subject_role_taxonomy_idx_searchable ON c2m2.subject_role_taxonomy USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.assay_type
ALTER TABLE c2m2.assay_type ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.assay_type SET searchable = concat_ws('|', '', c2m2.assay_type.id, c2m2.assay_type.name, c2m2.assay_type.description, c2m2.assay_type.synonyms);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_assay_type_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'assay_type' 
	AND indexname = 'c2m2_assay_type_idx_searchable') THEN
		CREATE INDEX c2m2_assay_type_idx_searchable ON c2m2.assay_type USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.analysis_type
ALTER TABLE c2m2.analysis_type ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.analysis_type SET searchable = concat_ws('|', '', c2m2.analysis_type.id, c2m2.analysis_type.name, c2m2.analysis_type.description, c2m2.analysis_type.synonyms);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_analysis_type_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'analysis_type' 
	AND indexname = 'c2m2_analysis_type_idx_searchable') THEN
		CREATE INDEX c2m2_analysis_type_idx_searchable ON c2m2.analysis_type USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.ncbi_taxonomy
ALTER TABLE c2m2.ncbi_taxonomy ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.ncbi_taxonomy SET searchable = concat_ws('|', '', c2m2.ncbi_taxonomy.id, c2m2.ncbi_taxonomy.clade, c2m2.ncbi_taxonomy.name, c2m2.ncbi_taxonomy.description, c2m2.ncbi_taxonomy.synonyms);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_ncbi_taxonomy_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'ncbi_taxonomy' 
	AND indexname = 'c2m2_ncbi_taxonomy_idx_searchable') THEN
		CREATE INDEX c2m2_ncbi_taxonomy_idx_searchable ON c2m2.ncbi_taxonomy USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.anatomy
ALTER TABLE c2m2.anatomy ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.anatomy SET searchable = concat_ws('|', '', c2m2.anatomy.id, c2m2.anatomy.name, c2m2.anatomy.description, c2m2.anatomy.synonyms);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_anatomy_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'anatomy' 
	AND indexname = 'c2m2_anatomy_idx_searchable') THEN
		CREATE INDEX c2m2_anatomy_idx_searchable ON c2m2.anatomy USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.biofluid
ALTER TABLE c2m2.biofluid ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.biofluid SET searchable = concat_ws('|', '', c2m2.biofluid.id, c2m2.biofluid.name, c2m2.biofluid.description, c2m2.biofluid.synonyms);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_biofluid_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'biofluid' 
	AND indexname = 'c2m2_biofluid_idx_searchable') THEN
		CREATE INDEX c2m2_biofluid_idx_searchable ON c2m2.biofluid USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.file_format
ALTER TABLE c2m2.file_format ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.file_format SET searchable = concat_ws('|', '', c2m2.file_format.id, c2m2.file_format.name, c2m2.file_format.description, c2m2.file_format.synonyms);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_file_format_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'file_format' 
	AND indexname = 'c2m2_file_format_idx_searchable') THEN
		CREATE INDEX c2m2_file_format_idx_searchable ON c2m2.file_format USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.data_type
ALTER TABLE c2m2.data_type ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.data_type SET searchable = concat_ws('|', '', c2m2.data_type.id, c2m2.data_type.name, c2m2.data_type.description, c2m2.data_type.synonyms);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_data_type_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'data_type' 
	AND indexname = 'c2m2_data_type_idx_searchable') THEN
		CREATE INDEX c2m2_data_type_idx_searchable ON c2m2.data_type USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.disease
ALTER TABLE c2m2.disease ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.disease SET searchable = concat_ws('|', '', c2m2.disease.id, c2m2.disease.name, c2m2.disease.description, c2m2.disease.synonyms);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_disease_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'disease' 
	AND indexname = 'c2m2_disease_idx_searchable') THEN
		CREATE INDEX c2m2_disease_idx_searchable ON c2m2.disease USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.phenotype
ALTER TABLE c2m2.phenotype ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.phenotype SET searchable = concat_ws('|', '', c2m2.phenotype.id, c2m2.phenotype.name, c2m2.phenotype.description, c2m2.phenotype.synonyms);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_phenotype_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'phenotype' 
	AND indexname = 'c2m2_phenotype_idx_searchable') THEN
		CREATE INDEX c2m2_phenotype_idx_searchable ON c2m2.phenotype USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.compound
ALTER TABLE c2m2.compound ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.compound SET searchable = concat_ws('|', '', c2m2.compound.id, c2m2.compound.name, c2m2.compound.description, c2m2.compound.synonyms);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_compound_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'compound' 
	AND indexname = 'c2m2_compound_idx_searchable') THEN
		CREATE INDEX c2m2_compound_idx_searchable ON c2m2.compound USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.substance
ALTER TABLE c2m2.substance ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.substance SET searchable = concat_ws('|', '', c2m2.substance.id, c2m2.substance.name, c2m2.substance.description, c2m2.substance.synonyms, c2m2.substance.compound);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_substance_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'substance' 
	AND indexname = 'c2m2_substance_idx_searchable') THEN
		CREATE INDEX c2m2_substance_idx_searchable ON c2m2.substance USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.gene
ALTER TABLE c2m2.gene ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.gene SET searchable = concat_ws('|', '', c2m2.gene.id, c2m2.gene.name, c2m2.gene.description, c2m2.gene.synonyms, c2m2.gene.organism);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_gene_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'gene' 
	AND indexname = 'c2m2_gene_idx_searchable') THEN
		CREATE INDEX c2m2_gene_idx_searchable ON c2m2.gene USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.protein
ALTER TABLE c2m2.protein ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.protein SET searchable = concat_ws('|', '', c2m2.protein.id, c2m2.protein.name, c2m2.protein.description, c2m2.protein.synonyms, c2m2.protein.organism);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_protein_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'protein' 
	AND indexname = 'c2m2_protein_idx_searchable') THEN
		CREATE INDEX c2m2_protein_idx_searchable ON c2m2.protein USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.protein_gene
ALTER TABLE c2m2.protein_gene ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.protein_gene SET searchable = concat_ws('|', '', c2m2.protein_gene.protein, c2m2.protein_gene.gene);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_protein_gene_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'protein_gene' 
	AND indexname = 'c2m2_protein_gene_idx_searchable') THEN
		CREATE INDEX c2m2_protein_gene_idx_searchable ON c2m2.protein_gene USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.sample_prep_method
ALTER TABLE c2m2.sample_prep_method ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.sample_prep_method SET searchable = concat_ws('|', '', c2m2.sample_prep_method.id, c2m2.sample_prep_method.name, c2m2.sample_prep_method.description, c2m2.sample_prep_method.synonyms);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_sample_prep_method_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'sample_prep_method' 
	AND indexname = 'c2m2_sample_prep_method_idx_searchable') THEN
		CREATE INDEX c2m2_sample_prep_method_idx_searchable ON c2m2.sample_prep_method USING gin(searchable);
	END IF;
END $$;

--- Adding COLUMN searchable to table c2m2.id_namespace
ALTER TABLE c2m2.id_namespace ADD COLUMN searchable VARCHAR DEFAULT '';
UPDATE c2m2.id_namespace SET searchable = concat_ws('|', '', c2m2.id_namespace.id, c2m2.id_namespace.abbreviation, c2m2.id_namespace.name, c2m2.id_namespace.description);

DO $$
BEGIN
	DROP INDEX IF EXISTS c2m2_id_namespace_idx_searchable;
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'id_namespace' 
	AND indexname = 'c2m2_id_namespace_idx_searchable') THEN
		CREATE INDEX c2m2_id_namespace_idx_searchable ON c2m2.id_namespace USING gin(searchable);
	END IF;
END $$;
