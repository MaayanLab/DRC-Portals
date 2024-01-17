select
id_namespace, local_id, project_id_namespace, project_local_id, creation_time, sample_prep_method, anatomy,
association_type, disease,
subject_id_namespace, subject_local_id, age_at_sampling,
gene,
collection_id_namespace, collection_local_id,
substance,
persistent_id
from 
(c2m2.biosample b 
full join c2m2.biosample_disease bd on (b.local_id = bd.biosample_local_id and b.id_namespace = bd.biosample_id_namespace)
full join c2m2.biosample_from_subject bs on (b.local_id = bs.biosample_local_id and b.id_namespace = bs.biosample_id_namespace)
full join c2m2.biosample_gene bg on (b.local_id = bg.biosample_local_id and b.id_namespace = bg.biosample_id_namespace)
full join c2m2.biosample_in_collection bc on (b.local_id = bc.biosample_local_id and b.id_namespace = bc.biosample_id_namespace)
full join c2m2.biosample_substance bsub on (b.local_id = bsub.biosample_local_id and b.id_namespace = bsub.biosample_id_namespace)
full join c2m2.substance subs on (bsub.substance = subs.id)
full join c2m2.anatomy ana on (b.anatomy = ana.id)
full join c2m2.disease dis on (bd.anatomy = dis.id)

) tmp limit 10;
