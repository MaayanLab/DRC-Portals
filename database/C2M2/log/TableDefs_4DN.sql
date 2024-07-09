DROP SCHEMA IF EXISTS _4dn CASCADE;
CREATE SCHEMA IF NOT EXISTS _4dn;

/* Define the tables */
CREATE TABLE _4dn.file (
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

CREATE TABLE _4dn.biosample (
id_namespace VARCHAR NOT NULL, 
local_id VARCHAR NOT NULL, 
project_id_namespace VARCHAR NOT NULL, 
project_local_id VARCHAR NOT NULL, 
persistent_id VARCHAR DEFAULT '', 
creation_time VARCHAR DEFAULT '', 
sample_prep_method VARCHAR DEFAULT '', 
anatomy VARCHAR DEFAULT '',
PRIMARY KEY(id_namespace, local_id)
);

CREATE TABLE _4dn.subject (
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

CREATE TABLE _4dn.dcc (
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

CREATE TABLE _4dn.project (
id_namespace VARCHAR NOT NULL, 
local_id VARCHAR NOT NULL, 
persistent_id VARCHAR DEFAULT '', 
creation_time VARCHAR DEFAULT '', 
abbreviation VARCHAR DEFAULT '', 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '',
PRIMARY KEY(id_namespace, local_id)
);

CREATE TABLE _4dn.project_in_project (
parent_project_id_namespace VARCHAR NOT NULL, 
parent_project_local_id VARCHAR NOT NULL, 
child_project_id_namespace VARCHAR NOT NULL, 
child_project_local_id VARCHAR NOT NULL,
PRIMARY KEY(parent_project_id_namespace, parent_project_local_id, child_project_id_namespace, child_project_local_id)
);

CREATE TABLE _4dn.collection (
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

CREATE TABLE _4dn.collection_in_collection (
superset_collection_id_namespace VARCHAR NOT NULL, 
superset_collection_local_id VARCHAR NOT NULL, 
subset_collection_id_namespace VARCHAR NOT NULL, 
subset_collection_local_id VARCHAR NOT NULL,
PRIMARY KEY(superset_collection_id_namespace, superset_collection_local_id, subset_collection_id_namespace, subset_collection_local_id)
);

CREATE TABLE _4dn.file_describes_collection (
file_id_namespace VARCHAR NOT NULL, 
file_local_id VARCHAR NOT NULL, 
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL,
PRIMARY KEY(file_id_namespace, file_local_id, collection_id_namespace, collection_local_id)
);

CREATE TABLE _4dn.collection_defined_by_project (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
project_id_namespace VARCHAR NOT NULL, 
project_local_id VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, project_id_namespace, project_local_id)
);

CREATE TABLE _4dn.file_in_collection (
file_id_namespace VARCHAR NOT NULL, 
file_local_id VARCHAR NOT NULL, 
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL,
PRIMARY KEY(file_id_namespace, file_local_id, collection_id_namespace, collection_local_id)
);

CREATE TABLE _4dn.biosample_in_collection (
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL, 
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL,
PRIMARY KEY(biosample_id_namespace, biosample_local_id, collection_id_namespace, collection_local_id)
);

CREATE TABLE _4dn.subject_in_collection (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL,
PRIMARY KEY(subject_id_namespace, subject_local_id, collection_id_namespace, collection_local_id)
);

CREATE TABLE _4dn.file_describes_biosample (
file_id_namespace VARCHAR NOT NULL, 
file_local_id VARCHAR NOT NULL, 
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL,
PRIMARY KEY(file_id_namespace, file_local_id, biosample_id_namespace, biosample_local_id)
);

CREATE TABLE _4dn.file_describes_subject (
file_id_namespace VARCHAR NOT NULL, 
file_local_id VARCHAR NOT NULL, 
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL,
PRIMARY KEY(file_id_namespace, file_local_id, subject_id_namespace, subject_local_id)
);

CREATE TABLE _4dn.biosample_from_subject (
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL, 
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
age_at_sampling VARCHAR DEFAULT '',
PRIMARY KEY(biosample_id_namespace, biosample_local_id, subject_id_namespace, subject_local_id)
);

CREATE TABLE _4dn.biosample_disease (
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL, 
association_type VARCHAR NOT NULL, 
disease VARCHAR NOT NULL,
PRIMARY KEY(biosample_id_namespace, biosample_local_id, association_type, disease)
);

CREATE TABLE _4dn.subject_disease (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
association_type VARCHAR NOT NULL, 
disease VARCHAR NOT NULL,
PRIMARY KEY(subject_id_namespace, subject_local_id, association_type, disease)
);

CREATE TABLE _4dn.collection_disease (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
disease VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, disease)
);

CREATE TABLE _4dn.collection_phenotype (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
phenotype VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, phenotype)
);

CREATE TABLE _4dn.collection_gene (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
gene VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, gene)
);

CREATE TABLE _4dn.collection_compound (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
compound VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, compound)
);

CREATE TABLE _4dn.collection_substance (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
substance VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, substance)
);

CREATE TABLE _4dn.collection_taxonomy (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
taxon VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, taxon)
);

CREATE TABLE _4dn.collection_anatomy (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
anatomy VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, anatomy)
);

CREATE TABLE _4dn.collection_protein (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
protein VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, protein)
);

CREATE TABLE _4dn.subject_phenotype (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
association_type VARCHAR NOT NULL, 
phenotype VARCHAR NOT NULL,
PRIMARY KEY(subject_id_namespace, subject_local_id, association_type, phenotype)
);

CREATE TABLE _4dn.biosample_substance (
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL, 
substance VARCHAR NOT NULL,
PRIMARY KEY(biosample_id_namespace, biosample_local_id, substance)
);

CREATE TABLE _4dn.subject_substance (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
substance VARCHAR NOT NULL,
PRIMARY KEY(subject_id_namespace, subject_local_id, substance)
);

CREATE TABLE _4dn.biosample_gene (
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL, 
gene VARCHAR NOT NULL,
PRIMARY KEY(biosample_id_namespace, biosample_local_id, gene)
);

CREATE TABLE _4dn.phenotype_gene (
phenotype VARCHAR NOT NULL, 
gene VARCHAR NOT NULL,
PRIMARY KEY(phenotype, gene)
);

CREATE TABLE _4dn.phenotype_disease (
phenotype VARCHAR NOT NULL, 
disease VARCHAR NOT NULL,
PRIMARY KEY(phenotype, disease)
);

CREATE TABLE _4dn.subject_race (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
race VARCHAR DEFAULT '',
PRIMARY KEY(subject_id_namespace, subject_local_id, race)
);

CREATE TABLE _4dn.subject_role_taxonomy (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
role_id VARCHAR NOT NULL, 
taxonomy_id VARCHAR NOT NULL,
PRIMARY KEY(subject_id_namespace, subject_local_id, role_id, taxonomy_id)
);

CREATE TABLE _4dn.assay_type (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE _4dn.analysis_type (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE _4dn.ncbi_taxonomy (
id VARCHAR NOT NULL, 
clade VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE _4dn.anatomy (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE _4dn.file_format (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE _4dn.data_type (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE _4dn.disease (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE _4dn.phenotype (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE _4dn.compound (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE _4dn.substance (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '', 
compound VARCHAR NOT NULL,
PRIMARY KEY(id)
);

CREATE TABLE _4dn.gene (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '', 
organism VARCHAR NOT NULL,
PRIMARY KEY(id)
);

CREATE TABLE _4dn.protein (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '', 
organism VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE _4dn.protein_gene (
protein VARCHAR NOT NULL, 
gene VARCHAR NOT NULL,
PRIMARY KEY(protein, gene)
);

CREATE TABLE _4dn.sample_prep_method (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE _4dn.id_namespace (
id VARCHAR NOT NULL, 
abbreviation VARCHAR DEFAULT '', 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '',
PRIMARY KEY(id)
);


/* Add foreign key constraints */
ALTER TABLE _4dn.file DROP CONSTRAINT IF EXISTS fk_file_id_namespace_1;
ALTER TABLE _4dn.file ADD CONSTRAINT  fk_file_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES _4dn.id_namespace (id);
ALTER TABLE _4dn.file DROP CONSTRAINT IF EXISTS fk_file_project_2;
ALTER TABLE _4dn.file ADD CONSTRAINT  fk_file_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES _4dn.project (id_namespace, local_id);
ALTER TABLE _4dn.file DROP CONSTRAINT IF EXISTS fk_file_file_format_3;
ALTER TABLE _4dn.file ADD CONSTRAINT  fk_file_file_format_3 FOREIGN KEY (file_format) REFERENCES _4dn.file_format (id);
ALTER TABLE _4dn.file DROP CONSTRAINT IF EXISTS fk_file_file_format_4;
ALTER TABLE _4dn.file ADD CONSTRAINT  fk_file_file_format_4 FOREIGN KEY (compression_format) REFERENCES _4dn.file_format (id);
ALTER TABLE _4dn.file DROP CONSTRAINT IF EXISTS fk_file_data_type_5;
ALTER TABLE _4dn.file ADD CONSTRAINT  fk_file_data_type_5 FOREIGN KEY (data_type) REFERENCES _4dn.data_type (id);
ALTER TABLE _4dn.file DROP CONSTRAINT IF EXISTS fk_file_assay_type_6;
ALTER TABLE _4dn.file ADD CONSTRAINT  fk_file_assay_type_6 FOREIGN KEY (assay_type) REFERENCES _4dn.assay_type (id);
ALTER TABLE _4dn.file DROP CONSTRAINT IF EXISTS fk_file_analysis_type_7;
ALTER TABLE _4dn.file ADD CONSTRAINT  fk_file_analysis_type_7 FOREIGN KEY (analysis_type) REFERENCES _4dn.analysis_type (id);
ALTER TABLE _4dn.file DROP CONSTRAINT IF EXISTS fk_file_collection_8;
ALTER TABLE _4dn.file ADD CONSTRAINT  fk_file_collection_8 FOREIGN KEY (bundle_collection_id_namespace, bundle_collection_local_id) REFERENCES _4dn.collection (id_namespace, local_id);

ALTER TABLE _4dn.biosample DROP CONSTRAINT IF EXISTS fk_biosample_id_namespace_1;
ALTER TABLE _4dn.biosample ADD CONSTRAINT  fk_biosample_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES _4dn.id_namespace (id);
ALTER TABLE _4dn.biosample DROP CONSTRAINT IF EXISTS fk_biosample_project_2;
ALTER TABLE _4dn.biosample ADD CONSTRAINT  fk_biosample_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES _4dn.project (id_namespace, local_id);
ALTER TABLE _4dn.biosample DROP CONSTRAINT IF EXISTS fk_biosample_sample_prep_method_3;
ALTER TABLE _4dn.biosample ADD CONSTRAINT  fk_biosample_sample_prep_method_3 FOREIGN KEY (sample_prep_method) REFERENCES _4dn.sample_prep_method (id);
ALTER TABLE _4dn.biosample DROP CONSTRAINT IF EXISTS fk_biosample_anatomy_4;
ALTER TABLE _4dn.biosample ADD CONSTRAINT  fk_biosample_anatomy_4 FOREIGN KEY (anatomy) REFERENCES _4dn.anatomy (id);

ALTER TABLE _4dn.subject DROP CONSTRAINT IF EXISTS fk_subject_id_namespace_1;
ALTER TABLE _4dn.subject ADD CONSTRAINT  fk_subject_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES _4dn.id_namespace (id);
ALTER TABLE _4dn.subject DROP CONSTRAINT IF EXISTS fk_subject_project_2;
ALTER TABLE _4dn.subject ADD CONSTRAINT  fk_subject_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES _4dn.project (id_namespace, local_id);

ALTER TABLE _4dn.dcc DROP CONSTRAINT IF EXISTS fk_dcc_project_1;
ALTER TABLE _4dn.dcc ADD CONSTRAINT  fk_dcc_project_1 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES _4dn.project (id_namespace, local_id);

ALTER TABLE _4dn.project DROP CONSTRAINT IF EXISTS fk_project_id_namespace_1;
ALTER TABLE _4dn.project ADD CONSTRAINT  fk_project_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES _4dn.id_namespace (id);

ALTER TABLE _4dn.project_in_project DROP CONSTRAINT IF EXISTS fk_project_in_project_project_1;
ALTER TABLE _4dn.project_in_project ADD CONSTRAINT  fk_project_in_project_project_1 FOREIGN KEY (parent_project_id_namespace, parent_project_local_id) REFERENCES _4dn.project (id_namespace, local_id);
ALTER TABLE _4dn.project_in_project DROP CONSTRAINT IF EXISTS fk_project_in_project_project_2;
ALTER TABLE _4dn.project_in_project ADD CONSTRAINT  fk_project_in_project_project_2 FOREIGN KEY (child_project_id_namespace, child_project_local_id) REFERENCES _4dn.project (id_namespace, local_id);

ALTER TABLE _4dn.collection DROP CONSTRAINT IF EXISTS fk_collection_id_namespace_1;
ALTER TABLE _4dn.collection ADD CONSTRAINT  fk_collection_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES _4dn.id_namespace (id);

ALTER TABLE _4dn.collection_in_collection DROP CONSTRAINT IF EXISTS fk_collection_in_collection_collection_1;
ALTER TABLE _4dn.collection_in_collection ADD CONSTRAINT  fk_collection_in_collection_collection_1 FOREIGN KEY (superset_collection_id_namespace, superset_collection_local_id) REFERENCES _4dn.collection (id_namespace, local_id);
ALTER TABLE _4dn.collection_in_collection DROP CONSTRAINT IF EXISTS fk_collection_in_collection_collection_2;
ALTER TABLE _4dn.collection_in_collection ADD CONSTRAINT  fk_collection_in_collection_collection_2 FOREIGN KEY (subset_collection_id_namespace, subset_collection_local_id) REFERENCES _4dn.collection (id_namespace, local_id);

ALTER TABLE _4dn.file_describes_collection DROP CONSTRAINT IF EXISTS fk_file_describes_collection_file_1;
ALTER TABLE _4dn.file_describes_collection ADD CONSTRAINT  fk_file_describes_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES _4dn.file (id_namespace, local_id);
ALTER TABLE _4dn.file_describes_collection DROP CONSTRAINT IF EXISTS fk_file_describes_collection_collection_2;
ALTER TABLE _4dn.file_describes_collection ADD CONSTRAINT  fk_file_describes_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection (id_namespace, local_id);

ALTER TABLE _4dn.collection_defined_by_project DROP CONSTRAINT IF EXISTS fk_collection_defined_by_project_collection_1;
ALTER TABLE _4dn.collection_defined_by_project ADD CONSTRAINT  fk_collection_defined_by_project_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection (id_namespace, local_id);
ALTER TABLE _4dn.collection_defined_by_project DROP CONSTRAINT IF EXISTS fk_collection_defined_by_project_project_2;
ALTER TABLE _4dn.collection_defined_by_project ADD CONSTRAINT  fk_collection_defined_by_project_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES _4dn.project (id_namespace, local_id);

ALTER TABLE _4dn.file_in_collection DROP CONSTRAINT IF EXISTS fk_file_in_collection_file_1;
ALTER TABLE _4dn.file_in_collection ADD CONSTRAINT  fk_file_in_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES _4dn.file (id_namespace, local_id);
ALTER TABLE _4dn.file_in_collection DROP CONSTRAINT IF EXISTS fk_file_in_collection_collection_2;
ALTER TABLE _4dn.file_in_collection ADD CONSTRAINT  fk_file_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection (id_namespace, local_id);

ALTER TABLE _4dn.biosample_in_collection DROP CONSTRAINT IF EXISTS fk_biosample_in_collection_biosample_1;
ALTER TABLE _4dn.biosample_in_collection ADD CONSTRAINT  fk_biosample_in_collection_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES _4dn.biosample (id_namespace, local_id);
ALTER TABLE _4dn.biosample_in_collection DROP CONSTRAINT IF EXISTS fk_biosample_in_collection_collection_2;
ALTER TABLE _4dn.biosample_in_collection ADD CONSTRAINT  fk_biosample_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection (id_namespace, local_id);

ALTER TABLE _4dn.subject_in_collection DROP CONSTRAINT IF EXISTS fk_subject_in_collection_subject_1;
ALTER TABLE _4dn.subject_in_collection ADD CONSTRAINT  fk_subject_in_collection_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES _4dn.subject (id_namespace, local_id);
ALTER TABLE _4dn.subject_in_collection DROP CONSTRAINT IF EXISTS fk_subject_in_collection_collection_2;
ALTER TABLE _4dn.subject_in_collection ADD CONSTRAINT  fk_subject_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection (id_namespace, local_id);

ALTER TABLE _4dn.file_describes_biosample DROP CONSTRAINT IF EXISTS fk_file_describes_biosample_file_1;
ALTER TABLE _4dn.file_describes_biosample ADD CONSTRAINT  fk_file_describes_biosample_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES _4dn.file (id_namespace, local_id);
ALTER TABLE _4dn.file_describes_biosample DROP CONSTRAINT IF EXISTS fk_file_describes_biosample_biosample_2;
ALTER TABLE _4dn.file_describes_biosample ADD CONSTRAINT  fk_file_describes_biosample_biosample_2 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES _4dn.biosample (id_namespace, local_id);

ALTER TABLE _4dn.file_describes_subject DROP CONSTRAINT IF EXISTS fk_file_describes_subject_file_1;
ALTER TABLE _4dn.file_describes_subject ADD CONSTRAINT  fk_file_describes_subject_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES _4dn.file (id_namespace, local_id);
ALTER TABLE _4dn.file_describes_subject DROP CONSTRAINT IF EXISTS fk_file_describes_subject_subject_2;
ALTER TABLE _4dn.file_describes_subject ADD CONSTRAINT  fk_file_describes_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES _4dn.subject (id_namespace, local_id);

ALTER TABLE _4dn.biosample_from_subject DROP CONSTRAINT IF EXISTS fk_biosample_from_subject_biosample_1;
ALTER TABLE _4dn.biosample_from_subject ADD CONSTRAINT  fk_biosample_from_subject_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES _4dn.biosample (id_namespace, local_id);
ALTER TABLE _4dn.biosample_from_subject DROP CONSTRAINT IF EXISTS fk_biosample_from_subject_subject_2;
ALTER TABLE _4dn.biosample_from_subject ADD CONSTRAINT  fk_biosample_from_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES _4dn.subject (id_namespace, local_id);

ALTER TABLE _4dn.biosample_disease DROP CONSTRAINT IF EXISTS fk_biosample_disease_biosample_1;
ALTER TABLE _4dn.biosample_disease ADD CONSTRAINT  fk_biosample_disease_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES _4dn.biosample (id_namespace, local_id);
ALTER TABLE _4dn.biosample_disease DROP CONSTRAINT IF EXISTS fk_biosample_disease_disease_2;
ALTER TABLE _4dn.biosample_disease ADD CONSTRAINT  fk_biosample_disease_disease_2 FOREIGN KEY (disease) REFERENCES _4dn.disease (id);

ALTER TABLE _4dn.subject_disease DROP CONSTRAINT IF EXISTS fk_subject_disease_subject_1;
ALTER TABLE _4dn.subject_disease ADD CONSTRAINT  fk_subject_disease_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES _4dn.subject (id_namespace, local_id);
ALTER TABLE _4dn.subject_disease DROP CONSTRAINT IF EXISTS fk_subject_disease_disease_2;
ALTER TABLE _4dn.subject_disease ADD CONSTRAINT  fk_subject_disease_disease_2 FOREIGN KEY (disease) REFERENCES _4dn.disease (id);

ALTER TABLE _4dn.collection_disease DROP CONSTRAINT IF EXISTS fk_collection_disease_collection_1;
ALTER TABLE _4dn.collection_disease ADD CONSTRAINT  fk_collection_disease_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection (id_namespace, local_id);
ALTER TABLE _4dn.collection_disease DROP CONSTRAINT IF EXISTS fk_collection_disease_disease_2;
ALTER TABLE _4dn.collection_disease ADD CONSTRAINT  fk_collection_disease_disease_2 FOREIGN KEY (disease) REFERENCES _4dn.disease (id);

ALTER TABLE _4dn.collection_phenotype DROP CONSTRAINT IF EXISTS fk_collection_phenotype_collection_1;
ALTER TABLE _4dn.collection_phenotype ADD CONSTRAINT  fk_collection_phenotype_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection (id_namespace, local_id);
ALTER TABLE _4dn.collection_phenotype DROP CONSTRAINT IF EXISTS fk_collection_phenotype_phenotype_2;
ALTER TABLE _4dn.collection_phenotype ADD CONSTRAINT  fk_collection_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES _4dn.phenotype (id);

ALTER TABLE _4dn.collection_gene DROP CONSTRAINT IF EXISTS fk_collection_gene_collection_1;
ALTER TABLE _4dn.collection_gene ADD CONSTRAINT  fk_collection_gene_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection (id_namespace, local_id);
ALTER TABLE _4dn.collection_gene DROP CONSTRAINT IF EXISTS fk_collection_gene_gene_2;
ALTER TABLE _4dn.collection_gene ADD CONSTRAINT  fk_collection_gene_gene_2 FOREIGN KEY (gene) REFERENCES _4dn.gene (id);

ALTER TABLE _4dn.collection_compound DROP CONSTRAINT IF EXISTS fk_collection_compound_collection_1;
ALTER TABLE _4dn.collection_compound ADD CONSTRAINT  fk_collection_compound_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection (id_namespace, local_id);
ALTER TABLE _4dn.collection_compound DROP CONSTRAINT IF EXISTS fk_collection_compound_compound_2;
ALTER TABLE _4dn.collection_compound ADD CONSTRAINT  fk_collection_compound_compound_2 FOREIGN KEY (compound) REFERENCES _4dn.compound (id);

ALTER TABLE _4dn.collection_substance DROP CONSTRAINT IF EXISTS fk_collection_substance_collection_1;
ALTER TABLE _4dn.collection_substance ADD CONSTRAINT  fk_collection_substance_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection (id_namespace, local_id);
ALTER TABLE _4dn.collection_substance DROP CONSTRAINT IF EXISTS fk_collection_substance_substance_2;
ALTER TABLE _4dn.collection_substance ADD CONSTRAINT  fk_collection_substance_substance_2 FOREIGN KEY (substance) REFERENCES _4dn.substance (id);

ALTER TABLE _4dn.collection_taxonomy DROP CONSTRAINT IF EXISTS fk_collection_taxonomy_collection_1;
ALTER TABLE _4dn.collection_taxonomy ADD CONSTRAINT  fk_collection_taxonomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection (id_namespace, local_id);
ALTER TABLE _4dn.collection_taxonomy DROP CONSTRAINT IF EXISTS fk_collection_taxonomy_ncbi_taxonomy_2;
ALTER TABLE _4dn.collection_taxonomy ADD CONSTRAINT  fk_collection_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxon) REFERENCES _4dn.ncbi_taxonomy (id);

ALTER TABLE _4dn.collection_anatomy DROP CONSTRAINT IF EXISTS fk_collection_anatomy_collection_1;
ALTER TABLE _4dn.collection_anatomy ADD CONSTRAINT  fk_collection_anatomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection (id_namespace, local_id);
ALTER TABLE _4dn.collection_anatomy DROP CONSTRAINT IF EXISTS fk_collection_anatomy_anatomy_2;
ALTER TABLE _4dn.collection_anatomy ADD CONSTRAINT  fk_collection_anatomy_anatomy_2 FOREIGN KEY (anatomy) REFERENCES _4dn.anatomy (id);

ALTER TABLE _4dn.collection_protein DROP CONSTRAINT IF EXISTS fk_collection_protein_collection_1;
ALTER TABLE _4dn.collection_protein ADD CONSTRAINT  fk_collection_protein_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection (id_namespace, local_id);
ALTER TABLE _4dn.collection_protein DROP CONSTRAINT IF EXISTS fk_collection_protein_protein_2;
ALTER TABLE _4dn.collection_protein ADD CONSTRAINT  fk_collection_protein_protein_2 FOREIGN KEY (protein) REFERENCES _4dn.protein (id);

ALTER TABLE _4dn.subject_phenotype DROP CONSTRAINT IF EXISTS fk_subject_phenotype_subject_1;
ALTER TABLE _4dn.subject_phenotype ADD CONSTRAINT  fk_subject_phenotype_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES _4dn.subject (id_namespace, local_id);
ALTER TABLE _4dn.subject_phenotype DROP CONSTRAINT IF EXISTS fk_subject_phenotype_phenotype_2;
ALTER TABLE _4dn.subject_phenotype ADD CONSTRAINT  fk_subject_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES _4dn.phenotype (id);

ALTER TABLE _4dn.biosample_substance DROP CONSTRAINT IF EXISTS fk_biosample_substance_biosample_1;
ALTER TABLE _4dn.biosample_substance ADD CONSTRAINT  fk_biosample_substance_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES _4dn.biosample (id_namespace, local_id);
ALTER TABLE _4dn.biosample_substance DROP CONSTRAINT IF EXISTS fk_biosample_substance_substance_2;
ALTER TABLE _4dn.biosample_substance ADD CONSTRAINT  fk_biosample_substance_substance_2 FOREIGN KEY (substance) REFERENCES _4dn.substance (id);

ALTER TABLE _4dn.subject_substance DROP CONSTRAINT IF EXISTS fk_subject_substance_subject_1;
ALTER TABLE _4dn.subject_substance ADD CONSTRAINT  fk_subject_substance_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES _4dn.subject (id_namespace, local_id);
ALTER TABLE _4dn.subject_substance DROP CONSTRAINT IF EXISTS fk_subject_substance_substance_2;
ALTER TABLE _4dn.subject_substance ADD CONSTRAINT  fk_subject_substance_substance_2 FOREIGN KEY (substance) REFERENCES _4dn.substance (id);

ALTER TABLE _4dn.biosample_gene DROP CONSTRAINT IF EXISTS fk_biosample_gene_biosample_1;
ALTER TABLE _4dn.biosample_gene ADD CONSTRAINT  fk_biosample_gene_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES _4dn.biosample (id_namespace, local_id);
ALTER TABLE _4dn.biosample_gene DROP CONSTRAINT IF EXISTS fk_biosample_gene_gene_2;
ALTER TABLE _4dn.biosample_gene ADD CONSTRAINT  fk_biosample_gene_gene_2 FOREIGN KEY (gene) REFERENCES _4dn.gene (id);

ALTER TABLE _4dn.phenotype_gene DROP CONSTRAINT IF EXISTS fk_phenotype_gene_phenotype_1;
ALTER TABLE _4dn.phenotype_gene ADD CONSTRAINT  fk_phenotype_gene_phenotype_1 FOREIGN KEY (phenotype) REFERENCES _4dn.phenotype (id);
ALTER TABLE _4dn.phenotype_gene DROP CONSTRAINT IF EXISTS fk_phenotype_gene_gene_2;
ALTER TABLE _4dn.phenotype_gene ADD CONSTRAINT  fk_phenotype_gene_gene_2 FOREIGN KEY (gene) REFERENCES _4dn.gene (id);

ALTER TABLE _4dn.phenotype_disease DROP CONSTRAINT IF EXISTS fk_phenotype_disease_phenotype_1;
ALTER TABLE _4dn.phenotype_disease ADD CONSTRAINT  fk_phenotype_disease_phenotype_1 FOREIGN KEY (phenotype) REFERENCES _4dn.phenotype (id);
ALTER TABLE _4dn.phenotype_disease DROP CONSTRAINT IF EXISTS fk_phenotype_disease_disease_2;
ALTER TABLE _4dn.phenotype_disease ADD CONSTRAINT  fk_phenotype_disease_disease_2 FOREIGN KEY (disease) REFERENCES _4dn.disease (id);

ALTER TABLE _4dn.subject_race DROP CONSTRAINT IF EXISTS fk_subject_race_subject_1;
ALTER TABLE _4dn.subject_race ADD CONSTRAINT  fk_subject_race_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES _4dn.subject (id_namespace, local_id);

ALTER TABLE _4dn.subject_role_taxonomy DROP CONSTRAINT IF EXISTS fk_subject_role_taxonomy_subject_1;
ALTER TABLE _4dn.subject_role_taxonomy ADD CONSTRAINT  fk_subject_role_taxonomy_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES _4dn.subject (id_namespace, local_id);
ALTER TABLE _4dn.subject_role_taxonomy DROP CONSTRAINT IF EXISTS fk_subject_role_taxonomy_ncbi_taxonomy_2;
ALTER TABLE _4dn.subject_role_taxonomy ADD CONSTRAINT  fk_subject_role_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxonomy_id) REFERENCES _4dn.ncbi_taxonomy (id);










ALTER TABLE _4dn.substance DROP CONSTRAINT IF EXISTS fk_substance_compound_1;
ALTER TABLE _4dn.substance ADD CONSTRAINT  fk_substance_compound_1 FOREIGN KEY (compound) REFERENCES _4dn.compound (id);

ALTER TABLE _4dn.gene DROP CONSTRAINT IF EXISTS fk_gene_ncbi_taxonomy_1;
ALTER TABLE _4dn.gene ADD CONSTRAINT  fk_gene_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES _4dn.ncbi_taxonomy (id);

ALTER TABLE _4dn.protein DROP CONSTRAINT IF EXISTS fk_protein_ncbi_taxonomy_1;
ALTER TABLE _4dn.protein ADD CONSTRAINT  fk_protein_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES _4dn.ncbi_taxonomy (id);

ALTER TABLE _4dn.protein_gene DROP CONSTRAINT IF EXISTS fk_protein_gene_protein_1;
ALTER TABLE _4dn.protein_gene ADD CONSTRAINT  fk_protein_gene_protein_1 FOREIGN KEY (protein) REFERENCES _4dn.protein (id);
ALTER TABLE _4dn.protein_gene DROP CONSTRAINT IF EXISTS fk_protein_gene_gene_2;
ALTER TABLE _4dn.protein_gene ADD CONSTRAINT  fk_protein_gene_gene_2 FOREIGN KEY (gene) REFERENCES _4dn.gene (id);



