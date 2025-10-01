
    DROP TABLE IF EXISTS c2m2.subjectcount_dcc_anatomy;
    CREATE TABLE c2m2.subjectcount_dcc_anatomy as (
      /* Y-axis: subjectscount, X-axis: dcc, Group by: ethnicity */
      
      SELECT
        i.dcc_short_label AS dcc, COALESCE(se.name, 'Unspecified') AS ethnicity,
        COUNT(*)::int AS count
      FROM c2m2.subject s
      LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = s.id_namespace
LEFT JOIN c2m2.subject_ethnicity se ON s.ethnicity = se.id
      GROUP BY s.id_namespace, i.dcc_short_label, s.ethnicity, COALESCE(se.name, 'Unspecified')
      ORDER BY count DESC, dcc, ethnicity
      ;
    
    );


    DROP TABLE IF EXISTS c2m2.subjectcount_dcc_anatomy;
    CREATE TABLE c2m2.subjectcount_dcc_anatomy as (
      /* Y-axis: subjectscount, X-axis: dcc, Group by: disease */
      
      SELECT
        i.dcc_short_label AS dcc, COALESCE(d.name, 'Unspecified') AS disease,
        COUNT(*)::int AS count
      FROM c2m2.subject s
      LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = s.id_namespace
LEFT JOIN c2m2.subject_disease sd ON s.local_id = sd.subject_local_id AND s.id_namespace = sd.subject_id_namespace
LEFT JOIN c2m2.disease d ON d.id = sd.disease
      GROUP BY s.id_namespace, i.dcc_short_label, sd.disease, COALESCE(d.name, 'Unspecified')
      ORDER BY count DESC, dcc, disease
      ;
    
    );


    DROP TABLE IF EXISTS c2m2.subjectscount_dcc_ethnicity;
    CREATE TABLE c2m2.subjectscount_dcc_ethnicity AS (
      /* Y-axis: subjectscount, X-axis: dcc, Group by: ethnicity */
      
      SELECT
        i.dcc_short_label AS dcc, COALESCE(se.name, 'Unspecified') AS ethnicity,
        COUNT(*)::int AS count
      FROM c2m2.subject s
      LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = s.id_namespace
LEFT JOIN c2m2.subject_ethnicity se ON s.ethnicity = se.id
      GROUP BY s.id_namespace, i.dcc_short_label, s.ethnicity, COALESCE(se.name, 'Unspecified')
      ORDER BY count DESC, dcc, ethnicity
      ;
    
    );


    DROP TABLE IF EXISTS c2m2.subjectscount_dcc_disease;
    CREATE TABLE c2m2.subjectscount_dcc_disease AS (
      /* Y-axis: subjectscount, X-axis: dcc, Group by: disease */
      
      SELECT
        i.dcc_short_label AS dcc, COALESCE(d.name, 'Unspecified') AS disease,
        COUNT(*)::int AS count
      FROM c2m2.subject s
      LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = s.id_namespace
LEFT JOIN c2m2.subject_disease sd ON s.local_id = sd.subject_local_id AND s.id_namespace = sd.subject_id_namespace
LEFT JOIN c2m2.disease d ON d.id = sd.disease
      GROUP BY s.id_namespace, i.dcc_short_label, sd.disease, COALESCE(d.name, 'Unspecified')
      ORDER BY count DESC, dcc, disease
      ;
    
    );


    DROP TABLE IF EXISTS c2m2.subjectscount_dcc_disease;
    CREATE TABLE c2m2.subjectscount_dcc_disease AS (
      /* Y-axis: subjectscount, X-axis: dcc, Group by: disease */
      
      SELECT
        i.dcc_short_label AS dcc, COALESCE(d.name, 'Unspecified') AS disease,
        COUNT(*)::int AS count
      FROM c2m2.subject s
      LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = s.id_namespace
LEFT JOIN c2m2.subject_disease sd ON s.local_id = sd.subject_local_id AND s.id_namespace = sd.subject_id_namespace
LEFT JOIN c2m2.disease d ON d.id = sd.disease
      GROUP BY s.id_namespace, i.dcc_short_label, sd.disease, COALESCE(d.name, 'Unspecified')
      ORDER BY count DESC, dcc, disease
      ;
    
    );

