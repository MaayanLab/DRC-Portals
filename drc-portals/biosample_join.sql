/* How to run: on psql prompt: be in the folder with this file or give full path:
\i biosample_join.sql
 */

CREATE TABLE c2m2.fl2_biosample as (SELECT DISTINCT
id_namespace, local_id, project_id_namespace, project_local_id, persistent_id, creation_time, sample_prep_method, anatomy,
association_type, disease,
subject_id_namespace, subject_local_id, age_at_sampling,
gene,
collection_id_namespace, collection_local_id,
substance
FROM 
(c2m2.biosample b 
FULL OUTER JOIN c2m2.biosample_disease bd ON (b.local_id = bd.biosample_local_id AND b.id_namespace = bd.biosample_id_namespace)
FULL OUTER JOIN c2m2.biosample_from_subject bs ON (b.local_id = bs.biosample_local_id AND b.id_namespace = bs.biosample_id_namespace)
FULL OUTER JOIN c2m2.biosample_gene bg ON (b.local_id = bg.biosample_local_id AND b.id_namespace = bg.biosample_id_namespace)
FULL OUTER JOIN c2m2.biosample_in_collection bc ON (b.local_id = bc.biosample_local_id AND b.id_namespace = bc.biosample_id_namespace)
FULL OUTER JOIN c2m2.biosample_substance bsub ON (b.local_id = bsub.biosample_local_id AND b.id_namespace = bsub.biosample_id_namespace)
/* FULL OUTER JOIN c2m2.file_describes_biosample fdb on (b.local_id = fdb.biosample_local_id and b.id_namespace = fdb.biosample_id_namespace)
 FULL OUTER JOIN c2m2.substance subs on (bsub.substance = subs.id)
FULL OUTER JOIN c2m2.anatomy ana on (b.anatomy = ana.id)
FULL OUTER JOIN c2m2.disease dis on (bd.anatomy = dis.id) */
) 
/* ORDER BY id_namespace, local_id, project_id_namespace, project_local_id, persistent_id, creation_time, sample_prep_method, anatomy,
association_type, disease, subject_id_namespace, subject_local_id, age_at_sampling, gene, collection_id_namespace, collection_local_id, 
substance */
ORDER BY project_id_namespace, project_local_id, subject_id_namespace, subject_local_id, id_namespace, local_id,
persistent_id, creation_time, sample_prep_method, anatomy, association_type, disease, age_at_sampling, gene, 
collection_id_namespace, collection_local_id, substance
);
