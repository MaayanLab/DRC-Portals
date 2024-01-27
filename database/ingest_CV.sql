/* Script to ingest C2M2 Controlled Vocabularies: being in the directory /home/mano/DRC/DRC-Portals/database, generated using the command ./gen_ingest_script.sh ingest_CV.sql */

DROP TABLE IF EXISTS c2m2.disease_association_type RESTRICT;
CREATE TABLE c2m2.disease_association_type(id varchar NOT NULL, name varchar NOT NULL, description varchar NOT NULL, PRIMARY KEY(id));
\COPY c2m2.disease_association_type FROM 'CV/disease_association_type.tsv' DELIMITER E'\t' CSV HEADER;

DROP TABLE IF EXISTS c2m2.phenotype_association_type RESTRICT;
CREATE TABLE c2m2.phenotype_association_type(id varchar NOT NULL, name varchar NOT NULL, description varchar NOT NULL, PRIMARY KEY(id));
\COPY c2m2.phenotype_association_type FROM 'CV/phenotype_association_type.tsv' DELIMITER E'\t' CSV HEADER;

DROP TABLE IF EXISTS c2m2.subject_ethnicity RESTRICT;
CREATE TABLE c2m2.subject_ethnicity(id varchar NOT NULL, name varchar NOT NULL, description varchar NOT NULL, PRIMARY KEY(id));
\COPY c2m2.subject_ethnicity FROM 'CV/subject_ethnicity.tsv' DELIMITER E'\t' CSV HEADER;

DROP TABLE IF EXISTS c2m2.subject_granularity RESTRICT;
CREATE TABLE c2m2.subject_granularity(id varchar NOT NULL, name varchar NOT NULL, description varchar NOT NULL, PRIMARY KEY(id));
\COPY c2m2.subject_granularity FROM 'CV/subject_granularity.tsv' DELIMITER E'\t' CSV HEADER;

DROP TABLE IF EXISTS c2m2.subject_race_CV RESTRICT;
CREATE TABLE c2m2.subject_race_CV(id varchar NOT NULL, name varchar NOT NULL, description varchar NOT NULL, PRIMARY KEY(id));
\COPY c2m2.subject_race_CV FROM 'CV/subject_race_CV.tsv' DELIMITER E'\t' CSV HEADER;

DROP TABLE IF EXISTS c2m2.subject_role RESTRICT;
CREATE TABLE c2m2.subject_role(id varchar NOT NULL, name varchar NOT NULL, description varchar NOT NULL, PRIMARY KEY(id));
\COPY c2m2.subject_role FROM 'CV/subject_role.tsv' DELIMITER E'\t' CSV HEADER;

DROP TABLE IF EXISTS c2m2.subject_sex RESTRICT;
CREATE TABLE c2m2.subject_sex(id varchar NOT NULL, name varchar NOT NULL, description varchar NOT NULL, PRIMARY KEY(id));
\COPY c2m2.subject_sex FROM 'CV/subject_sex.tsv' DELIMITER E'\t' CSV HEADER;

