DROP SCHEMA IF EXISTS c2 CASCADE;
CREATE SCHEMA IF NOT EXISTS c2;

/* Define the tables */
CREATE TABLE c2.file (
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

CREATE TABLE c2.biosample (
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

CREATE TABLE c2.subject (
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

CREATE TABLE c2.dcc (
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

CREATE TABLE c2.project (
id_namespace VARCHAR NOT NULL, 
local_id VARCHAR NOT NULL, 
persistent_id VARCHAR DEFAULT '', 
creation_time VARCHAR DEFAULT '', 
abbreviation VARCHAR DEFAULT '', 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '',
PRIMARY KEY(id_namespace, local_id)
);

CREATE TABLE c2.project_in_project (
parent_project_id_namespace VARCHAR NOT NULL, 
parent_project_local_id VARCHAR NOT NULL, 
child_project_id_namespace VARCHAR NOT NULL, 
child_project_local_id VARCHAR NOT NULL,
PRIMARY KEY(parent_project_id_namespace, parent_project_local_id, child_project_id_namespace, child_project_local_id)
);

CREATE TABLE c2.collection (
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

CREATE TABLE c2.collection_in_collection (
superset_collection_id_namespace VARCHAR NOT NULL, 
superset_collection_local_id VARCHAR NOT NULL, 
subset_collection_id_namespace VARCHAR NOT NULL, 
subset_collection_local_id VARCHAR NOT NULL,
PRIMARY KEY(superset_collection_id_namespace, superset_collection_local_id, subset_collection_id_namespace, subset_collection_local_id)
);

CREATE TABLE c2.file_describes_collection (
file_id_namespace VARCHAR NOT NULL, 
file_local_id VARCHAR NOT NULL, 
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL,
PRIMARY KEY(file_id_namespace, file_local_id, collection_id_namespace, collection_local_id)
);

CREATE TABLE c2.collection_defined_by_project (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
project_id_namespace VARCHAR NOT NULL, 
project_local_id VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, project_id_namespace, project_local_id)
);

CREATE TABLE c2.file_in_collection (
file_id_namespace VARCHAR NOT NULL, 
file_local_id VARCHAR NOT NULL, 
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL,
PRIMARY KEY(file_id_namespace, file_local_id, collection_id_namespace, collection_local_id)
);

CREATE TABLE c2.biosample_in_collection (
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL, 
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL,
PRIMARY KEY(biosample_id_namespace, biosample_local_id, collection_id_namespace, collection_local_id)
);

CREATE TABLE c2.subject_in_collection (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL,
PRIMARY KEY(subject_id_namespace, subject_local_id, collection_id_namespace, collection_local_id)
);

CREATE TABLE c2.file_describes_biosample (
file_id_namespace VARCHAR NOT NULL, 
file_local_id VARCHAR NOT NULL, 
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL,
PRIMARY KEY(file_id_namespace, file_local_id, biosample_id_namespace, biosample_local_id)
);

CREATE TABLE c2.file_describes_subject (
file_id_namespace VARCHAR NOT NULL, 
file_local_id VARCHAR NOT NULL, 
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL,
PRIMARY KEY(file_id_namespace, file_local_id, subject_id_namespace, subject_local_id)
);

CREATE TABLE c2.biosample_from_subject (
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL, 
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
age_at_sampling VARCHAR DEFAULT '',
PRIMARY KEY(biosample_id_namespace, biosample_local_id, subject_id_namespace, subject_local_id)
);

CREATE TABLE c2.biosample_disease (
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL, 
association_type VARCHAR NOT NULL, 
disease VARCHAR NOT NULL,
PRIMARY KEY(biosample_id_namespace, biosample_local_id, association_type, disease)
);

CREATE TABLE c2.subject_disease (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
association_type VARCHAR NOT NULL, 
disease VARCHAR NOT NULL,
PRIMARY KEY(subject_id_namespace, subject_local_id, association_type, disease)
);

CREATE TABLE c2.collection_disease (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
disease VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, disease)
);

CREATE TABLE c2.collection_phenotype (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
phenotype VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, phenotype)
);

CREATE TABLE c2.collection_gene (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
gene VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, gene)
);

CREATE TABLE c2.collection_compound (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
compound VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, compound)
);

CREATE TABLE c2.collection_substance (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
substance VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, substance)
);

CREATE TABLE c2.collection_taxonomy (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
taxon VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, taxon)
);

CREATE TABLE c2.collection_anatomy (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
anatomy VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, anatomy)
);

CREATE TABLE c2.collection_protein (
collection_id_namespace VARCHAR NOT NULL, 
collection_local_id VARCHAR NOT NULL, 
protein VARCHAR NOT NULL,
PRIMARY KEY(collection_id_namespace, collection_local_id, protein)
);

CREATE TABLE c2.subject_phenotype (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
association_type VARCHAR NOT NULL, 
phenotype VARCHAR NOT NULL,
PRIMARY KEY(subject_id_namespace, subject_local_id, association_type, phenotype)
);

CREATE TABLE c2.biosample_substance (
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL, 
substance VARCHAR NOT NULL,
PRIMARY KEY(biosample_id_namespace, biosample_local_id, substance)
);

CREATE TABLE c2.subject_substance (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
substance VARCHAR NOT NULL,
PRIMARY KEY(subject_id_namespace, subject_local_id, substance)
);

CREATE TABLE c2.biosample_gene (
biosample_id_namespace VARCHAR NOT NULL, 
biosample_local_id VARCHAR NOT NULL, 
gene VARCHAR NOT NULL,
PRIMARY KEY(biosample_id_namespace, biosample_local_id, gene)
);

CREATE TABLE c2.phenotype_gene (
phenotype VARCHAR NOT NULL, 
gene VARCHAR NOT NULL,
PRIMARY KEY(phenotype, gene)
);

CREATE TABLE c2.phenotype_disease (
phenotype VARCHAR NOT NULL, 
disease VARCHAR NOT NULL,
PRIMARY KEY(phenotype, disease)
);

CREATE TABLE c2.subject_race (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
race VARCHAR DEFAULT '',
PRIMARY KEY(subject_id_namespace, subject_local_id, race)
);

CREATE TABLE c2.subject_role_taxonomy (
subject_id_namespace VARCHAR NOT NULL, 
subject_local_id VARCHAR NOT NULL, 
role_id VARCHAR NOT NULL, 
taxonomy_id VARCHAR NOT NULL,
PRIMARY KEY(subject_id_namespace, subject_local_id, role_id, taxonomy_id)
);

CREATE TABLE c2.assay_type (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2.analysis_type (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2.ncbi_taxonomy (
id VARCHAR NOT NULL, 
clade VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2.anatomy (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2.file_format (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2.data_type (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2.disease (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2.phenotype (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2.compound (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2.substance (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '', 
compound VARCHAR NOT NULL,
PRIMARY KEY(id)
);

CREATE TABLE c2.gene (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '', 
organism VARCHAR NOT NULL,
PRIMARY KEY(id)
);

CREATE TABLE c2.protein (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '', 
organism VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2.protein_gene (
protein VARCHAR NOT NULL, 
gene VARCHAR NOT NULL,
PRIMARY KEY(protein, gene)
);

CREATE TABLE c2.sample_prep_method (
id VARCHAR NOT NULL, 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '', 
synonyms VARCHAR DEFAULT '',
PRIMARY KEY(id)
);

CREATE TABLE c2.id_namespace (
id VARCHAR NOT NULL, 
abbreviation VARCHAR DEFAULT '', 
name VARCHAR NOT NULL, 
description VARCHAR DEFAULT '',
PRIMARY KEY(id)
);


/* Add foreign key constraints */
ALTER TABLE c2.file ADD CONSTRAINT  fk_file_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES c2.id_namespace (id);
ALTER TABLE c2.file ADD CONSTRAINT  fk_file_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES c2.project (id_namespace, local_id);
ALTER TABLE c2.file ADD CONSTRAINT  fk_file_file_format_3 FOREIGN KEY (file_format) REFERENCES c2.file_format (id);
ALTER TABLE c2.file ADD CONSTRAINT  fk_file_file_format_4 FOREIGN KEY (compression_format) REFERENCES c2.file_format (id);
ALTER TABLE c2.file ADD CONSTRAINT  fk_file_data_type_5 FOREIGN KEY (data_type) REFERENCES c2.data_type (id);
ALTER TABLE c2.file ADD CONSTRAINT  fk_file_assay_type_6 FOREIGN KEY (assay_type) REFERENCES c2.assay_type (id);
ALTER TABLE c2.file ADD CONSTRAINT  fk_file_analysis_type_7 FOREIGN KEY (analysis_type) REFERENCES c2.analysis_type (id);
ALTER TABLE c2.file ADD CONSTRAINT  fk_file_collection_8 FOREIGN KEY (bundle_collection_id_namespace, bundle_collection_local_id) REFERENCES c2.collection (id_namespace, local_id);

ALTER TABLE c2.biosample ADD CONSTRAINT  fk_biosample_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES c2.id_namespace (id);
ALTER TABLE c2.biosample ADD CONSTRAINT  fk_biosample_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES c2.project (id_namespace, local_id);
ALTER TABLE c2.biosample ADD CONSTRAINT  fk_biosample_sample_prep_method_3 FOREIGN KEY (sample_prep_method) REFERENCES c2.sample_prep_method (id);
ALTER TABLE c2.biosample ADD CONSTRAINT  fk_biosample_anatomy_4 FOREIGN KEY (anatomy) REFERENCES c2.anatomy (id);

ALTER TABLE c2.subject ADD CONSTRAINT  fk_subject_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES c2.id_namespace (id);
ALTER TABLE c2.subject ADD CONSTRAINT  fk_subject_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES c2.project (id_namespace, local_id);

ALTER TABLE c2.dcc ADD CONSTRAINT  fk_dcc_project_1 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES c2.project (id_namespace, local_id);

ALTER TABLE c2.project ADD CONSTRAINT  fk_project_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES c2.id_namespace (id);

ALTER TABLE c2.project_in_project ADD CONSTRAINT  fk_project_in_project_project_1 FOREIGN KEY (parent_project_id_namespace, parent_project_local_id) REFERENCES c2.project (id_namespace, local_id);
ALTER TABLE c2.project_in_project ADD CONSTRAINT  fk_project_in_project_project_2 FOREIGN KEY (child_project_id_namespace, child_project_local_id) REFERENCES c2.project (id_namespace, local_id);

ALTER TABLE c2.collection ADD CONSTRAINT  fk_collection_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES c2.id_namespace (id);

ALTER TABLE c2.collection_in_collection ADD CONSTRAINT  fk_collection_in_collection_collection_1 FOREIGN KEY (superset_collection_id_namespace, superset_collection_local_id) REFERENCES c2.collection (id_namespace, local_id);
ALTER TABLE c2.collection_in_collection ADD CONSTRAINT  fk_collection_in_collection_collection_2 FOREIGN KEY (subset_collection_id_namespace, subset_collection_local_id) REFERENCES c2.collection (id_namespace, local_id);

ALTER TABLE c2.file_describes_collection ADD CONSTRAINT  fk_file_describes_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES c2.file (id_namespace, local_id);
ALTER TABLE c2.file_describes_collection ADD CONSTRAINT  fk_file_describes_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2.collection (id_namespace, local_id);

ALTER TABLE c2.collection_defined_by_project ADD CONSTRAINT  fk_collection_defined_by_project_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2.collection (id_namespace, local_id);
ALTER TABLE c2.collection_defined_by_project ADD CONSTRAINT  fk_collection_defined_by_project_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES c2.project (id_namespace, local_id);

ALTER TABLE c2.file_in_collection ADD CONSTRAINT  fk_file_in_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES c2.file (id_namespace, local_id);
ALTER TABLE c2.file_in_collection ADD CONSTRAINT  fk_file_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2.collection (id_namespace, local_id);

ALTER TABLE c2.biosample_in_collection ADD CONSTRAINT  fk_biosample_in_collection_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2.biosample (id_namespace, local_id);
ALTER TABLE c2.biosample_in_collection ADD CONSTRAINT  fk_biosample_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2.collection (id_namespace, local_id);

ALTER TABLE c2.subject_in_collection ADD CONSTRAINT  fk_subject_in_collection_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2.subject (id_namespace, local_id);
ALTER TABLE c2.subject_in_collection ADD CONSTRAINT  fk_subject_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2.collection (id_namespace, local_id);

ALTER TABLE c2.file_describes_biosample ADD CONSTRAINT  fk_file_describes_biosample_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES c2.file (id_namespace, local_id);
ALTER TABLE c2.file_describes_biosample ADD CONSTRAINT  fk_file_describes_biosample_biosample_2 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2.biosample (id_namespace, local_id);

ALTER TABLE c2.file_describes_subject ADD CONSTRAINT  fk_file_describes_subject_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES c2.file (id_namespace, local_id);
ALTER TABLE c2.file_describes_subject ADD CONSTRAINT  fk_file_describes_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2.subject (id_namespace, local_id);

ALTER TABLE c2.biosample_from_subject ADD CONSTRAINT  fk_biosample_from_subject_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2.biosample (id_namespace, local_id);
ALTER TABLE c2.biosample_from_subject ADD CONSTRAINT  fk_biosample_from_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2.subject (id_namespace, local_id);

ALTER TABLE c2.biosample_disease ADD CONSTRAINT  fk_biosample_disease_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2.biosample (id_namespace, local_id);
ALTER TABLE c2.biosample_disease ADD CONSTRAINT  fk_biosample_disease_disease_2 FOREIGN KEY (disease) REFERENCES c2.disease (id);

ALTER TABLE c2.subject_disease ADD CONSTRAINT  fk_subject_disease_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2.subject (id_namespace, local_id);
ALTER TABLE c2.subject_disease ADD CONSTRAINT  fk_subject_disease_disease_2 FOREIGN KEY (disease) REFERENCES c2.disease (id);

ALTER TABLE c2.collection_disease ADD CONSTRAINT  fk_collection_disease_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2.collection (id_namespace, local_id);
ALTER TABLE c2.collection_disease ADD CONSTRAINT  fk_collection_disease_disease_2 FOREIGN KEY (disease) REFERENCES c2.disease (id);

ALTER TABLE c2.collection_phenotype ADD CONSTRAINT  fk_collection_phenotype_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2.collection (id_namespace, local_id);
ALTER TABLE c2.collection_phenotype ADD CONSTRAINT  fk_collection_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES c2.phenotype (id);

ALTER TABLE c2.collection_gene ADD CONSTRAINT  fk_collection_gene_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2.collection (id_namespace, local_id);
ALTER TABLE c2.collection_gene ADD CONSTRAINT  fk_collection_gene_gene_2 FOREIGN KEY (gene) REFERENCES c2.gene (id);

ALTER TABLE c2.collection_compound ADD CONSTRAINT  fk_collection_compound_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2.collection (id_namespace, local_id);
ALTER TABLE c2.collection_compound ADD CONSTRAINT  fk_collection_compound_compound_2 FOREIGN KEY (compound) REFERENCES c2.compound (id);

ALTER TABLE c2.collection_substance ADD CONSTRAINT  fk_collection_substance_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2.collection (id_namespace, local_id);
ALTER TABLE c2.collection_substance ADD CONSTRAINT  fk_collection_substance_substance_2 FOREIGN KEY (substance) REFERENCES c2.substance (id);

ALTER TABLE c2.collection_taxonomy ADD CONSTRAINT  fk_collection_taxonomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2.collection (id_namespace, local_id);
ALTER TABLE c2.collection_taxonomy ADD CONSTRAINT  fk_collection_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxon) REFERENCES c2.ncbi_taxonomy (id);

ALTER TABLE c2.collection_anatomy ADD CONSTRAINT  fk_collection_anatomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2.collection (id_namespace, local_id);
ALTER TABLE c2.collection_anatomy ADD CONSTRAINT  fk_collection_anatomy_anatomy_2 FOREIGN KEY (anatomy) REFERENCES c2.anatomy (id);

ALTER TABLE c2.collection_protein ADD CONSTRAINT  fk_collection_protein_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2.collection (id_namespace, local_id);
ALTER TABLE c2.collection_protein ADD CONSTRAINT  fk_collection_protein_protein_2 FOREIGN KEY (protein) REFERENCES c2.protein (id);

ALTER TABLE c2.subject_phenotype ADD CONSTRAINT  fk_subject_phenotype_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2.subject (id_namespace, local_id);
ALTER TABLE c2.subject_phenotype ADD CONSTRAINT  fk_subject_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES c2.phenotype (id);

ALTER TABLE c2.biosample_substance ADD CONSTRAINT  fk_biosample_substance_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2.biosample (id_namespace, local_id);
ALTER TABLE c2.biosample_substance ADD CONSTRAINT  fk_biosample_substance_substance_2 FOREIGN KEY (substance) REFERENCES c2.substance (id);

ALTER TABLE c2.subject_substance ADD CONSTRAINT  fk_subject_substance_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2.subject (id_namespace, local_id);
ALTER TABLE c2.subject_substance ADD CONSTRAINT  fk_subject_substance_substance_2 FOREIGN KEY (substance) REFERENCES c2.substance (id);

ALTER TABLE c2.biosample_gene ADD CONSTRAINT  fk_biosample_gene_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2.biosample (id_namespace, local_id);
ALTER TABLE c2.biosample_gene ADD CONSTRAINT  fk_biosample_gene_gene_2 FOREIGN KEY (gene) REFERENCES c2.gene (id);

ALTER TABLE c2.phenotype_gene ADD CONSTRAINT  fk_phenotype_gene_phenotype_1 FOREIGN KEY (phenotype) REFERENCES c2.phenotype (id);
ALTER TABLE c2.phenotype_gene ADD CONSTRAINT  fk_phenotype_gene_gene_2 FOREIGN KEY (gene) REFERENCES c2.gene (id);

ALTER TABLE c2.phenotype_disease ADD CONSTRAINT  fk_phenotype_disease_phenotype_1 FOREIGN KEY (phenotype) REFERENCES c2.phenotype (id);
ALTER TABLE c2.phenotype_disease ADD CONSTRAINT  fk_phenotype_disease_disease_2 FOREIGN KEY (disease) REFERENCES c2.disease (id);

ALTER TABLE c2.subject_race ADD CONSTRAINT  fk_subject_race_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2.subject (id_namespace, local_id);

ALTER TABLE c2.subject_role_taxonomy ADD CONSTRAINT  fk_subject_role_taxonomy_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2.subject (id_namespace, local_id);
ALTER TABLE c2.subject_role_taxonomy ADD CONSTRAINT  fk_subject_role_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxonomy_id) REFERENCES c2.ncbi_taxonomy (id);










ALTER TABLE c2.substance ADD CONSTRAINT  fk_substance_compound_1 FOREIGN KEY (compound) REFERENCES c2.compound (id);

ALTER TABLE c2.gene ADD CONSTRAINT  fk_gene_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES c2.ncbi_taxonomy (id);

ALTER TABLE c2.protein ADD CONSTRAINT  fk_protein_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES c2.ncbi_taxonomy (id);

ALTER TABLE c2.protein_gene ADD CONSTRAINT  fk_protein_gene_protein_1 FOREIGN KEY (protein) REFERENCES c2.protein (id);
ALTER TABLE c2.protein_gene ADD CONSTRAINT  fk_protein_gene_gene_2 FOREIGN KEY (gene) REFERENCES c2.gene (id);



