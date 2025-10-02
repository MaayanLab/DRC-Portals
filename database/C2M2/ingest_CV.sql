set statement_timeout = 0;
/*
Script to ingest C2M2 Controlled Vocabularies: being in the directory /home/mano/DRC/DRC-Portals/database/C2M2, generated using the command ./gen_ingest_script.sh ingest_CV.sql
Generated sql script ingest_CV.sql and made it executable for owner and group. The resulting sql script can be run as (upon starting psql shell, or equivalent command):
\i ingest_CV.sql
OR, directly specify the sql file name in psql command:
psql -h localhost -U drc -d drc -p 5432 -a -f ingest_CV.sql
*/

DROP TABLE IF EXISTS c2m2.biosample_type RESTRICT;
CREATE TABLE c2m2.biosample_type(id varchar NOT NULL, name varchar NOT NULL, description varchar NOT NULL, PRIMARY KEY(id));
\COPY c2m2.biosample_type FROM 'CV/biosample_type.tsv' DELIMITER E'\t' CSV HEADER;

DROP TABLE IF EXISTS c2m2.disease_association_type RESTRICT;
CREATE TABLE c2m2.disease_association_type(id varchar NOT NULL, name varchar NOT NULL, description varchar NOT NULL, PRIMARY KEY(id));
\COPY c2m2.disease_association_type FROM 'CV/disease_association_type.tsv' DELIMITER E'\t' CSV HEADER;

DROP TABLE IF EXISTS c2m2.phenotype_association_type RESTRICT;
CREATE TABLE c2m2.phenotype_association_type(id varchar NOT NULL, name varchar NOT NULL, description varchar NOT NULL, PRIMARY KEY(id));
\COPY c2m2.phenotype_association_type FROM 'CV/phenotype_association_type.tsv' DELIMITER E'\t' CSV HEADER;

DROP TABLE IF EXISTS c2m2.site_type RESTRICT;
CREATE TABLE c2m2.site_type(id varchar NOT NULL, name varchar NOT NULL, description varchar NOT NULL, PRIMARY KEY(id));
\COPY c2m2.site_type FROM 'CV/site_type.tsv' DELIMITER E'\t' CSV HEADER;

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

