set statement_timeout = 0;
/* DO NOT DELETE ANY OF THE COMMENTS */
/*
run in psql as \i c2m2_other_indexes.sql or on bash prompt:
psql -h localhost -U drc -d drc -p [5432|5433] -a -f c2m2_other_indexes.sql
*/

--- This script generates other other indexes on some of the tables for faster search

--- How to get the existing indexes of a table
/*
select tablename,indexname,tablespace,indexdef from pg_indexes where tablename = 'file' and schemaname = 'c2m2';
*/
-------------------------------------------------------------------------------
--- c2m2.file table: index on project_id_namespace, project_local_id, assay_type, data_type
DO $$
BEGIN
    DROP INDEX IF EXISTS file_proj_assay_data_idx;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'file'
    AND indexname = 'file_proj_assay_data_idx') THEN
        CREATE INDEX file_proj_assay_data_idx ON c2m2.file USING
        btree(project_id_namespace, project_local_id, assay_type, data_type, analysis_type, file_format);
    END IF;
END $$;

-------------------------------------------------------------------------------
------ For c2m2_summary speed-up
------ biosample and related tables
-- Drop indexes if they already exist
DROP INDEX IF EXISTS idx_biosample_anatomy;
DROP INDEX IF EXISTS idx_biosample_biofluid;
DROP INDEX IF EXISTS idx_biosample_sample_prep;
DROP INDEX IF EXISTS idx_biosample_idns;
DROP INDEX IF EXISTS idx_biosample_disease_disease;
DROP INDEX IF EXISTS idx_biosample_disease_association_type;
DROP INDEX IF EXISTS idx_biosample_disease_idns_local;

-- Create indexes using the BTREE method
CREATE INDEX idx_biosample_anatomy ON c2m2.biosample USING BTREE (anatomy);
CREATE INDEX idx_biosample_biofluid ON c2m2.biosample USING BTREE (biofluid);
CREATE INDEX idx_biosample_sample_prep ON c2m2.biosample USING BTREE (sample_prep_method);
CREATE INDEX idx_biosample_idns ON c2m2.biosample USING BTREE (id_namespace);
CREATE INDEX idx_biosample_disease_disease ON c2m2.biosample_disease USING BTREE (disease);
CREATE INDEX idx_biosample_disease_association_type ON c2m2.biosample_disease USING BTREE (association_type);
CREATE INDEX idx_biosample_disease_idns_local ON c2m2.biosample_disease USING BTREE (biosample_id_namespace, biosample_local_id);

------ subject and related tables
-- Drop indexes if they already exist
DROP INDEX IF EXISTS idx_subject_granularity;
DROP INDEX IF EXISTS idx_subject_sex;
DROP INDEX IF EXISTS idx_subject_ethnicity;
DROP INDEX IF EXISTS idx_subject_idns;
DROP INDEX IF EXISTS idx_subject_disease_disease;
DROP INDEX IF EXISTS idx_subject_disease_association_type;
DROP INDEX IF EXISTS idx_subject_disease_idns_local;
DROP INDEX IF EXISTS idx_subject_race_race;
DROP INDEX IF EXISTS idx_subject_race_idns_local;
DROP INDEX IF EXISTS idx_subject_role_taxonomy_taxonomy_id;
DROP INDEX IF EXISTS idx_subject_role_taxonomy_role_id;
DROP INDEX IF EXISTS idx_subject_role_taxonomy_idns_local;

-- Create indexes using the BTREE method
CREATE INDEX idx_subject_granularity ON c2m2.subject USING BTREE (granularity);
CREATE INDEX idx_subject_sex ON c2m2.subject USING BTREE (sex);
CREATE INDEX idx_subject_ethnicity ON c2m2.subject USING BTREE (ethnicity);
CREATE INDEX idx_subject_idns ON c2m2.subject USING BTREE (id_namespace);
CREATE INDEX idx_subject_disease_disease ON c2m2.subject_disease USING BTREE (disease);
CREATE INDEX idx_subject_disease_association_type ON c2m2.subject_disease USING BTREE (association_type);
CREATE INDEX idx_subject_disease_idns_local ON c2m2.subject_disease USING BTREE (subject_id_namespace, subject_local_id);
CREATE INDEX idx_subject_race_race ON c2m2.subject_race USING BTREE (race);
CREATE INDEX idx_subject_race_idns_local ON c2m2.subject_race USING BTREE (subject_id_namespace, subject_local_id);
CREATE INDEX idx_subject_role_taxonomy_taxonomy_id ON c2m2.subject_role_taxonomy USING BTREE (taxonomy_id);
CREATE INDEX idx_subject_role_taxonomy_role_id ON c2m2.subject_role_taxonomy USING BTREE (role_id);
CREATE INDEX idx_subject_role_taxonomy_idns_local ON c2m2.subject_role_taxonomy USING BTREE (subject_id_namespace, subject_local_id);

--- For c2m2.project_data_type
DROP INDEX IF EXISTS idx_project_data_type_project_idns;
DROP INDEX IF EXISTS idx_project_data_type_project_local;
DROP INDEX IF EXISTS idx_project_data_type_assay_type_id;
DROP INDEX IF EXISTS idx_project_data_type_data_type_id;
DROP INDEX IF EXISTS idx_project_data_type_analysis_type_id;
DROP INDEX IF EXISTS idx_project_data_type_file_format_id;

CREATE INDEX idx_project_data_type_project_idns ON c2m2.project_data_type USING BTREE (project_id_namespace);
CREATE INDEX idx_project_data_type_project_local ON c2m2.project_data_type USING BTREE (project_local_id);
CREATE INDEX idx_project_data_type_assay_type_id ON c2m2.project_data_type USING BTREE (assay_type_id);
CREATE INDEX idx_project_data_type_data_type_id ON c2m2.project_data_type USING BTREE (data_type_id);
CREATE INDEX idx_project_data_type_analysis_type_id ON c2m2.project_data_type USING BTREE (analysis_type_id);
CREATE INDEX idx_project_data_type_file_format_id ON c2m2.project_data_type USING BTREE (file_format_id);

--- For c2m2.file
DROP INDEX IF EXISTS idx_file_project_idns;
DROP INDEX IF EXISTS idx_file_project_local;
DROP INDEX IF EXISTS idx_file_assay_type;
DROP INDEX IF EXISTS idx_file_data_type;
DROP INDEX IF EXISTS idx_file_analysis_type;
DROP INDEX IF EXISTS idx_file_file_format;

CREATE INDEX idx_file_project_idns ON c2m2.file USING BTREE (project_id_namespace);
CREATE INDEX idx_file_project_local ON c2m2.file USING BTREE (project_local_id);
CREATE INDEX idx_file_assay_type ON c2m2.file USING BTREE (assay_type);
CREATE INDEX idx_file_data_type ON c2m2.file USING BTREE (data_type);
CREATE INDEX idx_file_analysis_type ON c2m2.file USING BTREE (analysis_type);
CREATE INDEX idx_file_file_format ON c2m2.file USING BTREE (file_format);

--- c2m2.file_describes_subject
DROP INDEX IF EXISTS idx_file_subject_file_idns;
DROP INDEX IF EXISTS idx_file_subject_file_local;
DROP INDEX IF EXISTS idx_file_subject_subj_idns;
DROP INDEX IF EXISTS idx_file_subject_subj_local;

CREATE INDEX idx_file_subject_file_idns ON c2m2.file_describes_subject USING BTREE (file_id_namespace);
CREATE INDEX idx_file_subject_file_local ON c2m2.file_describes_subject USING BTREE (file_local_id);
CREATE INDEX idx_file_subject_subj_idns ON c2m2.file_describes_subject USING BTREE (subject_id_namespace);
CREATE INDEX idx_file_subject_subj_local ON c2m2.file_describes_subject USING BTREE (subject_local_id);

--- c2m2.file_describes_biosample with columns 
DROP INDEX IF EXISTS idx_file_biosample_file_idns;
DROP INDEX IF EXISTS idx_file_biosample_file_local;
DROP INDEX IF EXISTS idx_file_biosample_bs_idns;
DROP INDEX IF EXISTS idx_file_biosample_bs_local;

CREATE INDEX idx_file_biosample_file_idns ON c2m2.file_describes_biosample USING BTREE (file_id_namespace);
CREATE INDEX idx_file_biosample_file_local ON c2m2.file_describes_biosample USING BTREE (file_local_id);
CREATE INDEX idx_file_biosample_bs_idns ON c2m2.file_describes_biosample USING BTREE (biosample_id_namespace);
CREATE INDEX idx_file_biosample_bs_local ON c2m2.file_describes_biosample USING BTREE (biosample_local_id);

--- Same for c2m2.file_describes_in_collection with columns
DROP INDEX IF EXISTS idx_file_collection_file_idns;
DROP INDEX IF EXISTS idx_file_collection_file_local;
DROP INDEX IF EXISTS idx_file_collection_coll_idns;
DROP INDEX IF EXISTS idx_file_collection_coll_local;

CREATE INDEX idx_file_collection_file_idns ON c2m2.file_describes_in_collection USING BTREE (file_id_namespace);
CREATE INDEX idx_file_collection_file_local ON c2m2.file_describes_in_collection USING BTREE (file_local_id);
CREATE INDEX idx_file_collection_coll_idns ON c2m2.file_describes_in_collection USING BTREE (collection_id_namespace);
CREATE INDEX idx_file_collection_coll_local ON c2m2.file_describes_in_collection USING BTREE (collection_local_id);

--- c2m2.collection; separate btree indexes not needed if always joining on the two together
-- DROP INDEX IF EXISTS idx_collection_idns;
-- DROP INDEX IF EXISTS idx_collection_local;
-- CREATE INDEX idx_collection_idns ON c2m2.collection USING BTREE (id_namespace);
-- CREATE INDEX idx_collection_local ON c2m2.collection USING BTREE (local_id);

--- Similarly, for the table c2m2.subject_role_taxonomy taxonomy_id, role_id, and column pair (subject_id_namespace, subject_local_id )
