
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


    DROP TABLE IF EXISTS c2m2.subjectscount_ethnicity_sex;
    CREATE TABLE c2m2.subjectscount_ethnicity_sex AS (
      /* Y-axis: subjectscount, X-axis: ethnicity, Group by: sex */
      
      SELECT
        COALESCE(se.name, 'Unspecified') AS ethnicity, COALESCE(ss.name, 'Unspecified') AS sex,
        COUNT(*)::int AS count
      FROM c2m2.subject s
      LEFT JOIN c2m2.subject_ethnicity se ON s.ethnicity = se.id
LEFT JOIN c2m2.subject_sex ss ON s.sex = ss.id
      GROUP BY s.ethnicity, COALESCE(se.name, 'Unspecified'), s.sex, COALESCE(ss.name, 'Unspecified')
      ORDER BY count DESC, ethnicity, sex
      ;
    
    );


    DROP TABLE IF EXISTS c2m2.subjectscount_ethnicity_sex;
    CREATE TABLE c2m2.subjectscount_ethnicity_sex AS (
      /* Y-axis: subjectscount, X-axis: ethnicity, Group by: sex */
      
      SELECT
        COALESCE(se.name, 'Unspecified') AS ethnicity, COALESCE(ss.name, 'Unspecified') AS sex,
        COUNT(*)::int AS count
      FROM c2m2.subject s
      LEFT JOIN c2m2.subject_ethnicity se ON s.ethnicity = se.id
LEFT JOIN c2m2.subject_sex ss ON s.sex = ss.id
      GROUP BY s.ethnicity, COALESCE(se.name, 'Unspecified'), s.sex, COALESCE(ss.name, 'Unspecified')
      ORDER BY count DESC, ethnicity, sex
      ;
    
    );


    DROP TABLE IF EXISTS c2m2.subjectscount_ethnicity_sex;
    CREATE TABLE c2m2.subjectscount_ethnicity_sex AS (
      /* Y-axis: subjectscount, X-axis: ethnicity, Group by: sex */
      
      SELECT
        COALESCE(se.name, 'Unspecified') AS ethnicity, COALESCE(ss.name, 'Unspecified') AS sex,
        COUNT(*)::int AS count
      FROM c2m2.subject s
      LEFT JOIN c2m2.subject_ethnicity se ON s.ethnicity = se.id
LEFT JOIN c2m2.subject_sex ss ON s.sex = ss.id
      GROUP BY s.ethnicity, COALESCE(se.name, 'Unspecified'), s.sex, COALESCE(ss.name, 'Unspecified')
      ORDER BY count DESC, ethnicity, sex
      ;
    
    );


    DROP TABLE IF EXISTS c2m2.subjectscount_ethnicity_sex;
    CREATE TABLE c2m2.subjectscount_ethnicity_sex AS (
      /* Y-axis: subjectscount, X-axis: ethnicity, Group by: sex */
      
      SELECT
        COALESCE(se.name, 'Unspecified') AS ethnicity, COALESCE(ss.name, 'Unspecified') AS sex,
        COUNT(*)::int AS count
      FROM c2m2.subject s
      LEFT JOIN c2m2.subject_ethnicity se ON s.ethnicity = se.id
LEFT JOIN c2m2.subject_sex ss ON s.sex = ss.id
      GROUP BY s.ethnicity, COALESCE(se.name, 'Unspecified'), s.sex, COALESCE(ss.name, 'Unspecified')
      ORDER BY count DESC, ethnicity, sex
      ;
    
    );


    DROP TABLE IF EXISTS c2m2.subjectscount_ethnicity_sex;
    CREATE TABLE c2m2.subjectscount_ethnicity_sex AS (
      /* Y-axis: subjectscount, X-axis: ethnicity, Group by: sex */
      
      SELECT
        COALESCE(se.name, 'Unspecified') AS ethnicity, COALESCE(ss.name, 'Unspecified') AS sex,
        COUNT(*)::int AS count
      FROM c2m2.subject s
      LEFT JOIN c2m2.subject_ethnicity se ON s.ethnicity = se.id
LEFT JOIN c2m2.subject_sex ss ON s.sex = ss.id
      GROUP BY s.ethnicity, COALESCE(se.name, 'Unspecified'), s.sex, COALESCE(ss.name, 'Unspecified')
      ORDER BY count DESC, ethnicity, sex
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


    DROP TABLE IF EXISTS c2m2.subjectscount_dcc_race;
    CREATE TABLE c2m2.subjectscount_dcc_race AS (
      /* Y-axis: subjectscount, X-axis: dcc, Group by: race */
      
      SELECT
        i.dcc_short_label AS dcc, COALESCE(srcv.name, 'Unspecified') AS race,
        COUNT(*)::int AS count
      FROM c2m2.subject s
      LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = s.id_namespace
LEFT JOIN c2m2.subject_race sr ON s.local_id = sr.subject_local_id AND s.id_namespace = sr.subject_id_namespace
LEFT JOIN c2m2.subject_race_cv srcv ON sr.race = srcv.id
      GROUP BY s.id_namespace, i.dcc_short_label, sr.race, COALESCE(srcv.name, 'Unspecified')
      ORDER BY count DESC, dcc, race
      ;
    
    );


    DROP TABLE IF EXISTS c2m2.subjectscount_dcc_granularity;
    CREATE TABLE c2m2.subjectscount_dcc_granularity AS (
      /* Y-axis: subjectscount, X-axis: dcc, Group by: granularity */
      
      SELECT
        i.dcc_short_label AS dcc, COALESCE(sg.name, 'Unspecified') AS granularity,
        COUNT(*)::int AS count
      FROM c2m2.subject s
      LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = s.id_namespace
LEFT JOIN c2m2.subject_granularity sg ON s.granularity = sg.id
      GROUP BY s.id_namespace, i.dcc_short_label, s.granularity, COALESCE(sg.name, 'Unspecified')
      ORDER BY count DESC, dcc, granularity
      ;
    
    );


    DROP TABLE IF EXISTS c2m2.subjectscount_dcc_role;
    CREATE TABLE c2m2.subjectscount_dcc_role AS (
      /* Y-axis: subjectscount, X-axis: dcc, Group by: role */
      
      SELECT
        i.dcc_short_label AS dcc, COALESCE(sr2.name, 'Unspecified') AS role,
        COUNT(*)::int AS count
      FROM c2m2.subject s
      LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = s.id_namespace
LEFT JOIN c2m2.subject_role_taxonomy srt ON s.local_id = srt.subject_local_id AND s.id_namespace = srt.subject_id_namespace
LEFT JOIN c2m2.subject_role sr2 ON srt.role_id = sr2.id
      GROUP BY s.id_namespace, i.dcc_short_label, srt.role_id, COALESCE(sr2.name, 'Unspecified')
      ORDER BY count DESC, dcc, role
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


    DROP TABLE IF EXISTS c2m2.subjectscount_dcc_granularity;
    CREATE TABLE c2m2.subjectscount_dcc_granularity AS (
      /* Y-axis: subjectscount, X-axis: dcc, Group by: granularity */
      
      SELECT
        i.dcc_short_label AS dcc, COALESCE(sg.name, 'Unspecified') AS granularity,
        COUNT(*)::int AS count
      FROM c2m2.subject s
      LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = s.id_namespace
LEFT JOIN c2m2.subject_granularity sg ON s.granularity = sg.id
      GROUP BY s.id_namespace, i.dcc_short_label, s.granularity, COALESCE(sg.name, 'Unspecified')
      ORDER BY count DESC, dcc, granularity
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

