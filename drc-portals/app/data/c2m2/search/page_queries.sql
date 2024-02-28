--- Mano: Better to write the queries here first for ease of edting, etc.
  -- with proj_info AS (SELECT DISTINCT 
  --   allres_full.project_local_id AS project_local_id, allres_full.project_id_namespace AS project_id_namespace
  --   FROM allres_full
  -- ), 
  -- file_table AS (
  SELECT DISTINCT
    f.id_namespace,
    f.local_id,
    f.project_id_namespace,
    f.project_local_id,
    f.persistent_id,
    f.creation_time,
    f.size_in_bytes,
    f.uncompressed_size_in_bytes,
    f.sha256,
    f.md5,
    f.filename,
    f.file_format,
    f.compression_format,
    f.mime_type,
    f.dbgap_study_id,
    dt.name as data_type_name,
    at.name as assay_type_name,
    aty.name as analysis_type_name
FROM c2m2.file as f
LEFT JOIN c2m2.data_type as dt ON f.data_type = dt.id
LEFT JOIN c2m2.assay_type as at ON f.assay_type = at.id
LEFT JOIN c2m2.analysis_type as aty ON f.analysis_type = aty.id limit 5;
