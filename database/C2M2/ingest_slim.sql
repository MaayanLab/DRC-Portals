/*
Script to ingest C2M2 relevant slim and related table: being in the directory /home/mano/DRC/DRC-Portals/database/C2M2, generated using the command ./gen_ingest_slim_script.sh ingest_slim.sql
Generated sql script ingest_slim.sql and made it executable for owner and group. The resulting sql script can be run as (upon starting psql shell, or equivalent command):
\i ingest_slim.sql
OR, directly specify the sql file name in psql command:
psql -h localhost -U drc -d drc -p 5432 -a -f ingest_slim.sql
*/

DROP SCHEMA IF EXISTS slim CASCADE;
CREATE SCHEMA IF NOT EXISTS slim;


DROP TABLE IF EXISTS slim.anatomy_slim RESTRICT;
CREATE TABLE slim.anatomy_slim(original_term_id VARCHAR NOT NULL, slim_term_id VARCHAR NOT NULL);
\COPY slim.anatomy_slim FROM 'slim/anatomy_slim.tsv' DELIMITER E'\t' CSV HEADER;
ALTER TABLE slim.anatomy_slim ADD COLUMN pk_id serial PRIMARY KEY;

DROP TABLE IF EXISTS slim.anatomy RESTRICT;
CREATE TABLE slim.anatomy(id VARCHAR NOT NULL, name VARCHAR NOT NULL, description VARCHAR DEFAULT NULL, synonyms VARCHAR DEFAULT NULL, PRIMARY KEY(id));
\COPY slim.anatomy FROM 'slim/anatomy.tsv' DELIMITER E'\t' CSV HEADER;


DROP TABLE IF EXISTS slim.assay_type_slim RESTRICT;
CREATE TABLE slim.assay_type_slim(original_term_id VARCHAR NOT NULL, slim_term_id VARCHAR NOT NULL);
\COPY slim.assay_type_slim FROM 'slim/assay_type_slim.tsv' DELIMITER E'\t' CSV HEADER;
ALTER TABLE slim.assay_type_slim ADD COLUMN pk_id serial PRIMARY KEY;

DROP TABLE IF EXISTS slim.assay_type RESTRICT;
CREATE TABLE slim.assay_type(id VARCHAR NOT NULL, name VARCHAR NOT NULL, description VARCHAR DEFAULT NULL, synonyms VARCHAR DEFAULT NULL, PRIMARY KEY(id));
\COPY slim.assay_type FROM 'slim/assay_type.tsv' DELIMITER E'\t' CSV HEADER;


DROP TABLE IF EXISTS slim.data_type_slim RESTRICT;
CREATE TABLE slim.data_type_slim(original_term_id VARCHAR NOT NULL, slim_term_id VARCHAR NOT NULL);
\COPY slim.data_type_slim FROM 'slim/data_type_slim.tsv' DELIMITER E'\t' CSV HEADER;
ALTER TABLE slim.data_type_slim ADD COLUMN pk_id serial PRIMARY KEY;

DROP TABLE IF EXISTS slim.data_type RESTRICT;
CREATE TABLE slim.data_type(id VARCHAR NOT NULL, name VARCHAR NOT NULL, description VARCHAR DEFAULT NULL, synonyms VARCHAR DEFAULT NULL, PRIMARY KEY(id));
\COPY slim.data_type FROM 'slim/data_type.tsv' DELIMITER E'\t' CSV HEADER;


DROP TABLE IF EXISTS slim.dbgap_study_id RESTRICT;
CREATE TABLE slim.dbgap_study_id(id VARCHAR NOT NULL, name VARCHAR NOT NULL, description VARCHAR DEFAULT NULL, PRIMARY KEY(id));
\COPY slim.dbgap_study_id FROM 'slim/dbgap_study_id.tsv' DELIMITER E'\t' CSV HEADER;


DROP TABLE IF EXISTS slim.disease_slim RESTRICT;
CREATE TABLE slim.disease_slim(original_term_id VARCHAR NOT NULL, slim_term_id VARCHAR NOT NULL);
\COPY slim.disease_slim FROM 'slim/disease_slim.tsv' DELIMITER E'\t' CSV HEADER;
ALTER TABLE slim.disease_slim ADD COLUMN pk_id serial PRIMARY KEY;

DROP TABLE IF EXISTS slim.disease RESTRICT;
CREATE TABLE slim.disease(id VARCHAR NOT NULL, name VARCHAR NOT NULL, description VARCHAR DEFAULT NULL, synonyms VARCHAR DEFAULT NULL, PRIMARY KEY(id));
\COPY slim.disease FROM 'slim/disease.tsv' DELIMITER E'\t' CSV HEADER;


DROP TABLE IF EXISTS slim.file_format_slim RESTRICT;
CREATE TABLE slim.file_format_slim(original_term_id VARCHAR NOT NULL, slim_term_id VARCHAR NOT NULL);
\COPY slim.file_format_slim FROM 'slim/file_format_slim.tsv' DELIMITER E'\t' CSV HEADER;
ALTER TABLE slim.file_format_slim ADD COLUMN pk_id serial PRIMARY KEY;

DROP TABLE IF EXISTS slim.file_format RESTRICT;
CREATE TABLE slim.file_format(id VARCHAR NOT NULL, name VARCHAR NOT NULL, description VARCHAR DEFAULT NULL, synonyms VARCHAR DEFAULT NULL, PRIMARY KEY(id));
\COPY slim.file_format FROM 'slim/file_format.tsv' DELIMITER E'\t' CSV HEADER;


